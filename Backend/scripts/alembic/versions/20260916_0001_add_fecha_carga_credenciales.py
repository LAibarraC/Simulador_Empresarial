"""add fecha_carga to credenciales autorizadas

Revision ID: 7a1b2c3d4e5f
Revises: 5de205b3a989
Create Date: 2026-09-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7a1b2c3d4e5f"
down_revision: Union[str, None] = "5de205b3a989"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "credenciales_autorizadas",
        sa.Column("fecha_carga", sa.DateTime(), server_default=sa.func.now(), nullable=True),
    )
    op.execute(
        "UPDATE credenciales_autorizadas SET fecha_carga = CURRENT_TIMESTAMP WHERE fecha_carga IS NULL"
    )


def downgrade() -> None:
    op.drop_column("credenciales_autorizadas", "fecha_carga")
