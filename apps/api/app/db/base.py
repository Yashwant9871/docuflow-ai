from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import all models to ensure they are registered on the metadata
from app.models.role import Role, user_roles
from app.models.user import User
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.validation_result import ValidationResult
from app.models.review_task import ReviewTask
from app.models.approval_action import ApprovalAction
from app.models.audit_log import AuditLog
