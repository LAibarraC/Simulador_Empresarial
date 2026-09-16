"""sync_credenciales_autorizadas_security

Revision ID: 5de205b3a989
Revises: fb7bf0964615
Create Date: 2026-09-15 15:58:41.523189

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = '5de205b3a989'
down_revision: Union[str, None] = 'fb7bf0964615'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Aplica los cambios a la base de datos."""
    # 1. Consolidar Nombre y Apellido
    # Nota: Se asume que la tabla tiene 'apellidos' y 'nombre' antes de este cambio.
    # En entornos donde ya se hizo manualmente, este comando puede fallar si la columna no existe,
    # pero como usaremos 'stamp', esto es principalmente para el historial y otros entornos.
    try:
        op.execute("UPDATE credenciales_autorizadas SET nombre = CONCAT(apellidos, ' ', nombre) WHERE apellidos IS NOT NULL AND apellidos != ''")
        op.drop_column('credenciales_autorizadas', 'apellidos')
    except Exception:
        pass # Si la columna ya no existe, ignoramos

    # 2. Asegurar columnas de Blind Index (si no existen)
    try:
        op.add_column('credenciales_autorizadas', sa.Column('ci_hash', mysql.VARCHAR(length=64), nullable=True))
    except Exception:
        pass

    try:
        op.add_column('credenciales_autorizadas', sa.Column('cu_hash', mysql.VARCHAR(length=64), nullable=True))
    except Exception:
        pass

    # 3. Aplicar restricciones NOT NULL
    op.alter_column('credenciales_autorizadas', 'ci',
               existing_type=mysql.VARCHAR(length=255),
               nullable=False)
    op.alter_column('credenciales_autorizadas', 'ci_hash',
               existing_type=mysql.VARCHAR(length=64),
               nullable=False)
    op.alter_column('credenciales_autorizadas', 'nombre',
               existing_type=mysql.VARCHAR(length=255),
               nullable=False)

    # 4. Actualizar Índices
    try:
        op.drop_index('idx_ci_hash', table_name='credenciales_autorizadas')
    except Exception:
        pass
    try:
        op.drop_index('idx_cu_hash', table_name='credenciales_autorizadas')
    except Exception:
        pass

    op.create_index('ix_credenciales_autorizadas_ci_hash', 'credenciales_autorizadas', ['ci_hash'], unique=False)
    op.create_index('ix_credenciales_autorizadas_cu_hash', 'credenciales_autorizadas', ['cu_hash'], unique=False)

    # 5. Ajustes de tipos en otras tablas (detectados por autogenerate)
    op.alter_column('entregas_tareas', 'datos_respuesta',
               existing_type=mysql.LONGTEXT(),
               type_=sa.Text(length=4294967295),
               existing_nullable=True)
    op.alter_column('entregas_tareas', 'detalle_calificaciones',
               existing_type=mysql.LONGTEXT(),
               type_=sa.Text(length=4294967295),
               existing_nullable=True)
    op.alter_column('tareas', 'ejercicios_seleccionados',
               existing_type=mysql.LONGTEXT(),
               type_=sa.Text(length=4294967295),
               existing_nullable=True)


def downgrade() -> None:
    """Revierte los cambios (rollback)."""
    # Revertir tipos de texto
    op.alter_column('tareas', 'ejercicios_seleccionados',
               existing_type=sa.Text(length=4294967295),
               type_=mysql.LONGTEXT(),
               existing_nullable=True)
    op.alter_column('entregas_tareas', 'detalle_calificaciones',
               existing_type=sa.Text(length=4294967295),
               type_=mysql.LONGTEXT(),
               existing_nullable=True)
    op.alter_column('entregas_tareas', 'datos_respuesta',
               existing_type=sa.Text(length=4294967295),
               type_=mysql.LONGTEXT(),
               existing_nullable=True)

    # Revertir índices
    op.drop_index('ix_credenciales_autorizadas_cu_hash', table_name='credenciales_autorizadas')
    op.drop_index('ix_credenciales_autorizadas_ci_hash', table_name='credenciales_autorizadas')
    op.create_index('idx_cu_hash', 'credenciales_autorizadas', ['cu_hash'], unique=False)
    op.create_index('idx_ci_hash', 'credenciales_autorizadas', ['ci_hash'], unique=False)

    # Revertir NOT NULL
    op.alter_column('credenciales_autorizadas', 'nombre',
               existing_type=mysql.VARCHAR(length=255),
               nullable=True)
    op.alter_column('credenciales_autorizadas', 'ci_hash',
               existing_type=mysql.VARCHAR(length=64),
               nullable=True)
    op.alter_column('credenciales_autorizadas', 'ci',
               existing_type=mysql.VARCHAR(length=255),
               nullable=True)

    # Revertir columnas (estos pasos son destructivos, normalmente no se recuperan los datos perdidos)
    # op.add_column('credenciales_autorizadas', sa.Column('apellidos', mysql.VARCHAR(length=255), nullable=True))
    # op.drop_column('credenciales_autorizadas', 'ci_hash')
    # op.drop_column('credenciales_autorizadas', 'cu_hash')
