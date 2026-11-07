"""add_modulo_to_historial_calculos

Revision ID: 990cd84b8d4e
Revises: 20260917_0001
Create Date: 2026-10-28 21:47:42.490765

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '990cd84b8d4e'
down_revision: Union[str, None] = '20260917_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Aplica los cambios a la base de datos."""
    # 1. Agregar la columna con valor por defecto 'MAT151'
    op.add_column(
        "historial_calculos",
        sa.Column("modulo", sa.String(length=50), nullable=True, server_default="MAT151")
    )
    # 2. Crear índice en la columna modulo para optimizar los filtros
    op.create_index(
        "ix_historial_calculos_modulo",
        "historial_calculos",
        ["modulo"],
        unique=False
    )
    # 3. Asegurar que los registros existentes queden clasificados como MAT151
    op.execute("UPDATE historial_calculos SET modulo = 'MAT151' WHERE modulo IS NULL")


def downgrade() -> None:
    """Revierte los cambios (rollback)."""
    op.drop_index("ix_historial_calculos_modulo", table_name="historial_calculos")
    op.drop_column("historial_calculos", "modulo")
