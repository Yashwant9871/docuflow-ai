from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    vendors,
    purchase_orders,
    documents,
    dashboard,
    audit_logs,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(vendors.router, prefix="/vendors", tags=["vendors"])
api_router.include_router(purchase_orders.router, prefix="/purchase-orders", tags=["purchase-orders"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])
api_router.include_router(audit_logs.document_audit_router, prefix="/documents", tags=["documents"])
