"""Eventos de notificaciones confirmadas, para el proceso actual de FastAPI.

No consulta la base de datos por intervalos. Cada conexión recibe una señal
cuando una transacción confirma cambios que afectan a su usuario.
"""
import asyncio
from threading import Lock

from sqlalchemy import event, inspect
from sqlalchemy.orm import Session

import models

_CLAVE_CAMBIOS = "notificaciones_sse_pendientes"


class CanalNotificaciones:
    def __init__(self):
        self._suscriptores = {}
        self._lock = Lock()

    def suscribir(self, usuario_id):
        cola = asyncio.Queue(maxsize=1)
        suscripcion = (asyncio.get_running_loop(), cola)
        with self._lock:
            self._suscriptores.setdefault(usuario_id, set()).add(suscripcion)
        return suscripcion

    def desuscribir(self, usuario_id, suscripcion):
        with self._lock:
            suscripciones = self._suscriptores.get(usuario_id)
            if suscripciones is not None:
                suscripciones.discard(suscripcion)
                if not suscripciones:
                    self._suscriptores.pop(usuario_id, None)

    @staticmethod
    def _encolar(cola, actualizar):
        # Las señales se agrupan: una consulta posterior recupera el estado actual.
        if not actualizar and cola.full():
            cola.get_nowait()
        if not cola.full():
            cola.put_nowait(actualizar)

    def publicar(self, usuarios=(), globales=False):
        with self._lock:
            destinos = [
                suscripcion
                for usuario_id, suscripciones in self._suscriptores.items()
                if globales or usuario_id in usuarios
                for suscripcion in suscripciones
            ]
        for loop, cola in destinos:
            try:
                loop.call_soon_threadsafe(self._encolar, cola, True)
            except RuntimeError:
                # El cierre de una pestaña o del servidor no debe fallar un commit.
                pass

    def cerrar(self):
        with self._lock:
            destinos = [s for grupo in self._suscriptores.values() for s in grupo]
            self._suscriptores.clear()
        for loop, cola in destinos:
            try:
                loop.call_soon_threadsafe(self._encolar, cola, False)
            except RuntimeError:
                pass


canal_notificaciones = CanalNotificaciones()


def invalidar_notificaciones_al_confirmar(sesion, usuario_id=None, globales=False):
    cambios = sesion.info.setdefault(_CLAVE_CAMBIOS, {"usuarios": set(), "globales": False})
    if usuario_id is not None:
        cambios["usuarios"].add(usuario_id)
    cambios["globales"] = cambios["globales"] or globales


@event.listens_for(Session, "after_flush")
def _recoger_cambios(sesion, contexto):
    for objeto in list(sesion.new) + list(sesion.dirty) + list(sesion.deleted):
        if isinstance(objeto, models.Notificacion):
            if objeto.tipo == "sistema":
                invalidar_notificaciones_al_confirmar(sesion, globales=True)
            elif objeto.usuario_id is not None:
                invalidar_notificaciones_al_confirmar(sesion, objeto.usuario_id)
        elif isinstance(objeto, models.Usuario):
            estado = inspect(objeto)
            if objeto in sesion.deleted or any(
                estado.attrs[campo].history.has_changes()
                for campo in ("ultimo_aviso_global_id", "activo", "email")
            ):
                invalidar_notificaciones_al_confirmar(sesion, objeto.id)


@event.listens_for(Session, "after_commit")
def _publicar_cambios(sesion):
    if sesion.in_nested_transaction():
        return
    cambios = sesion.info.pop(_CLAVE_CAMBIOS, None)
    if cambios:
        canal_notificaciones.publicar(cambios["usuarios"], cambios["globales"])


@event.listens_for(Session, "after_rollback")
def _descartar_cambios(sesion):
    if not sesion.in_nested_transaction():
        sesion.info.pop(_CLAVE_CAMBIOS, None)
