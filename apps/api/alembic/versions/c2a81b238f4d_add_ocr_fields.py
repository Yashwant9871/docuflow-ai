"""add ocr fields

Revision ID: c2a81b238f4d
Revises: None
Create Date: 2026-06-28 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c2a81b238f4d'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns to documents table
    op.add_column('documents', sa.Column('raw_text', sa.String(length=65535), nullable=True))
    op.add_column('documents', sa.Column('processing_error', sa.String(length=1000), nullable=True))
    op.add_column('documents', sa.Column('reviewer_notes', sa.String(length=1000), nullable=True))
    op.add_column('documents', sa.Column('is_ocr_simulated', sa.Boolean(), nullable=False, server_default='false'))
    
    # Add columns to extracted_fields table
    op.add_column('extracted_fields', sa.Column('corrected_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column('extracted_fields', 'corrected_at')
    op.drop_column('documents', 'is_ocr_simulated')
    op.drop_column('documents', 'reviewer_notes')
    op.drop_column('documents', 'processing_error')
    op.drop_column('documents', 'raw_text')
