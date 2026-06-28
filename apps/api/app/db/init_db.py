from sqlalchemy.orm import Session
from app.models.role import Role
from app.models.user import User
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.validation_result import ValidationResult
from app.models.audit_log import AuditLog
from app.core.security import hash_password
from app.utils.enums import RoleName, VendorStatus, POStatus, DocumentStatus, FieldStatus, ValidationStatus, Severity, Priority
from decimal import Decimal
from datetime import datetime, date, timedelta, timezone
import uuid

def init_db(db: Session) -> None:
    print("Checking database seed status...")

    # 1. Seed Roles if none exist
    if db.query(Role).count() == 0:
        print("Seeding roles...")
        roles = {
            "ADMIN": Role(id=uuid.uuid4(), name="ADMIN", description="Administrator with full access"),
            "PROCESSOR": Role(id=uuid.uuid4(), name="PROCESSOR", description="Processor who can upload and process documents"),
            "REVIEWER": Role(id=uuid.uuid4(), name="REVIEWER", description="Reviewer who can verify fields and exceptions"),
            "APPROVER": Role(id=uuid.uuid4(), name="APPROVER", description="Approver who can approve or reject documents"),
        }
        for r in roles.values():
            db.add(r)
        db.commit()
    else:
        # Load existing roles for reference
        roles = {r.name: r for r in db.query(Role).all()}

    # 2. Seed Users if none exist
    if db.query(User).count() == 0:
        print("Seeding users...")
        users = {
            "admin": User(
                id=uuid.UUID("110e8400-e29b-41d4-a716-446655440001"),
                full_name="Admin User",
                email="admin@docuflow.ai",
                hashed_password=hash_password("Admin@123"),
                is_active=True,
                roles=[roles["ADMIN"]]
            ),
            "processor": User(
                id=uuid.UUID("110e8400-e29b-41d4-a716-446655440002"),
                full_name="Process User",
                email="processor@docuflow.ai",
                hashed_password=hash_password("Processor@123"),
                is_active=True,
                roles=[roles["PROCESSOR"]]
            ),
            "reviewer": User(
                id=uuid.UUID("110e8400-e29b-41d4-a716-446655440003"),
                full_name="Review User",
                email="reviewer@docuflow.ai",
                hashed_password=hash_password("Reviewer@123"),
                is_active=True,
                roles=[roles["REVIEWER"]]
            ),
            "approver": User(
                id=uuid.UUID("110e8400-e29b-41d4-a716-446655440004"),
                full_name="Approval User",
                email="approver@docuflow.ai",
                hashed_password=hash_password("Approver@123"),
                is_active=True,
                roles=[roles["APPROVER"]]
            )
        }
        for u in users.values():
            db.add(u)
        db.commit()
    else:
        users = {u.email.split('@')[0]: u for u in db.query(User).all()}

    # 3. Seed Vendors if none exist
    if db.query(Vendor).count() == 0:
        print("Seeding vendors...")
        vendors = {
            "v1": Vendor(
                id=uuid.UUID("550e8400-e29b-41d4-a716-446655440001"),
                vendor_code="APX-001",
                name="Apex Industrial Supplies",
                tax_id="TX-92831",
                email="ap@apexsupplies.com",
                phone="+1 (415) 555-0142",
                status=VendorStatus.ACTIVE
            ),
            "v2": Vendor(
                id=uuid.UUID("550e8400-e29b-41d4-a716-446655440002"),
                vendor_code="NST-002",
                name="Northstar Logistics",
                tax_id="TX-44217",
                email="billing@northstarlog.com",
                phone="+1 (312) 555-0193",
                status=VendorStatus.ACTIVE
            ),
            "v3": Vendor(
                id=uuid.UUID("550e8400-e29b-41d4-a716-446655440003"),
                vendor_code="MED-003",
                name="MedCore Billing Services",
                tax_id="TX-77104",
                email="ar@medcore.com",
                phone="+1 (646) 555-0188",
                status=VendorStatus.ACTIVE
            ),
            "v4": Vendor(
                id=uuid.UUID("550e8400-e29b-41d4-a716-446655440004"),
                vendor_code="BLD-004",
                name="BuildRight Materials",
                tax_id="TX-30188",
                email="ap@buildright.com",
                phone="+1 (213) 555-0166",
                status=VendorStatus.ACTIVE
            ),
            "v5": Vendor(
                id=uuid.UUID("550e8400-e29b-41d4-a716-446655440005"),
                vendor_code="POS-005",
                name="Prime Office Solutions",
                tax_id="TX-55291",
                email="invoices@primeoffice.com",
                phone="+1 (702) 555-0119",
                status=VendorStatus.ON_HOLD
            ),
        }
        for v in vendors.values():
            db.add(v)
        db.commit()
    else:
        # Load vendors
        vendors = {f"v{i+1}": v for i, v in enumerate(db.query(Vendor).order_by(Vendor.created_at).all())}

    # 4. Seed Purchase Orders if none exist
    if db.query(PurchaseOrder).count() == 0 and "v1" in vendors:
        print("Seeding purchase orders...")
        pos = {
            "po1": PurchaseOrder(
                id=uuid.UUID("660e8400-e29b-41d4-a716-446655440001"),
                po_number="PO-2026-1001",
                vendor_id=vendors["v1"].id,
                total_amount=Decimal("12000.00"),
                remaining_amount=Decimal("3200.00"),
                currency="USD",
                status=POStatus.PARTIALLY_USED,
                created_at=datetime.now(timezone.utc) - timedelta(days=160)
            ),
            "po2": PurchaseOrder(
                id=uuid.UUID("660e8400-e29b-41d4-a716-446655440002"),
                po_number="PO-2026-1002",
                vendor_id=vendors["v2"].id,
                total_amount=Decimal("8500.00"),
                remaining_amount=Decimal("0.00"),
                currency="USD",
                status=POStatus.CLOSED,
                created_at=datetime.now(timezone.utc) - timedelta(days=140)
            ),
            "po3": PurchaseOrder(
                id=uuid.UUID("660e8400-e29b-41d4-a716-446655440003"),
                po_number="PO-2026-1003",
                vendor_id=vendors["v4"].id,
                total_amount=Decimal("22000.00"),
                remaining_amount=Decimal("22000.00"),
                currency="USD",
                status=POStatus.OPEN,
                created_at=datetime.now(timezone.utc) - timedelta(days=100)
            ),
            "po4": PurchaseOrder(
                id=uuid.UUID("660e8400-e29b-41d4-a716-446655440004"),
                po_number="PO-2026-1004",
                vendor_id=vendors["v5"].id,
                total_amount=Decimal("4500.00"),
                remaining_amount=Decimal("1500.00"),
                currency="USD",
                status=POStatus.ON_HOLD,
                created_at=datetime.now(timezone.utc) - timedelta(days=80)
            ),
            "po5": PurchaseOrder(
                id=uuid.UUID("660e8400-e29b-41d4-a716-446655440005"),
                po_number="PO-2026-1005",
                vendor_id=vendors["v3"].id,
                total_amount=Decimal("15800.00"),
                remaining_amount=Decimal("9300.00"),
                currency="USD",
                status=POStatus.PARTIALLY_USED,
                created_at=datetime.now(timezone.utc) - timedelta(days=60)
            ),
        }
        for p in pos.values():
            db.add(p)
        db.commit()
    else:
        # Load POs
        pos = {f"po{i+1}": p for i, p in enumerate(db.query(PurchaseOrder).order_by(PurchaseOrder.created_at).all())}

    # 5. Seed Documents, fields, validation results, and timeline if none exist
    if db.query(Document).count() == 0 and "v1" in vendors and "po1" in pos and "admin" in users:
        print("Seeding documents...")
        
        # Helper to add standard extracted fields
        def add_extracted_fields(doc_id, num, vendor_name, po_num, total, low_conf=False, missing_tax=False):
            subtotal = total / 1.1
            tax = total - subtotal
            
            fields = [
                ("Invoice Number", num, 0.99, FieldStatus.OK),
                ("Vendor Name", vendor_name, 0.97, FieldStatus.OK),
                ("Invoice Date", "2026-05-12", 0.96, FieldStatus.OK),
                ("Due Date", "2026-06-12", 0.95, FieldStatus.OK),
                ("PO Number", po_num, 0.94 if po_num else 0.0, FieldStatus.OK if po_num else FieldStatus.MISSING),
                ("Subtotal", f"${subtotal:,.2f}", 0.93, FieldStatus.OK),
                ("Tax", f"${tax:,.2f}" if not missing_tax else "", 0.91 if not missing_tax else 0.0, FieldStatus.OK if not missing_tax else FieldStatus.MISSING),
                ("Total Amount", f"${total:,.2f}", 0.97, FieldStatus.OK),
                ("Currency", "USD", 0.99, FieldStatus.OK),
                ("Payment Terms", "Net 30", 0.90, FieldStatus.OK),
            ]
            for name, val, conf, status in fields:
                actual_conf = max(0.55, conf - 0.3) if low_conf else conf
                actual_status = FieldStatus.LOW_CONFIDENCE if low_conf and status == FieldStatus.OK else status
                db.add(ExtractedField(
                    id=uuid.uuid4(),
                    document_id=doc_id,
                    field_name=name,
                    field_value=val,
                    confidence=actual_conf,
                    source="OCR",
                    status=actual_status
                ))

        # Helper to add audit logs
        def add_audit_log(doc_id, action, actor_id, days_ago, val_old=None, val_new=None):
            db.add(AuditLog(
                id=uuid.uuid4(),
                actor_id=actor_id,
                entity_type="Document",
                entity_id=str(doc_id),
                action=action,
                old_value=val_old,
                new_value=val_new,
                ip_address="192.168.1.100",
                created_at=datetime.now(timezone.utc) - timedelta(days=days_ago)
            ))

        # Document 1: Perfect invoice - APPROVED
        d1_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440001")
        d1 = Document(
            id=d1_id,
            document_number="INV-2026-0001",
            vendor_id=vendors["v1"].id,
            purchase_order_id=pos["po1"].id,
            status=DocumentStatus.APPROVED,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("4820.00"),
            currency="USD",
            invoice_date=date(2026, 5, 12),
            due_date=date(2026, 6, 12),
            confidence_score=0.98,
            priority=Priority.LOW,
            scenario="Perfect invoice",
            created_at=datetime.now(timezone.utc) - timedelta(days=6)
        )
        db.add(d1)
        add_extracted_fields(d1_id, "INV-2026-0001", "Apex Industrial Supplies", "PO-2026-1001", 4820.0)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d1_id, rule_name="Vendor exists", status=ValidationStatus.PASSED, severity=Severity.HIGH, expected="Known vendor", actual="Apex Industrial Supplies", message="Vendor matched in master."))
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d1_id, rule_name="PO exists", status=ValidationStatus.PASSED, severity=Severity.HIGH, expected="Valid PO", actual="PO-2026-1001", message="PO active."))
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d1_id, rule_name="Amount within PO remaining", status=ValidationStatus.PASSED, severity=Severity.HIGH, expected="<= $12,000", actual="$4,820", message="Within limit."))
        add_audit_log(d1_id, "DOCUMENT_UPLOADED", users["processor"].id, 6)
        add_audit_log(d1_id, "EXTRACTED", None, 6)
        add_audit_log(d1_id, "VALIDATED", None, 5)
        add_audit_log(d1_id, "APPROVED", users["approver"].id, 3)

        # Document 2: Missing PO number - VALIDATION_FAILED
        d2_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440002")
        d2 = Document(
            id=d2_id,
            document_number="INV-2026-0002",
            vendor_id=vendors["v2"].id,
            status=DocumentStatus.VALIDATION_FAILED,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("2340.00"),
            currency="USD",
            invoice_date=date(2026, 5, 14),
            due_date=date(2026, 6, 14),
            confidence_score=0.88,
            priority=Priority.HIGH,
            scenario="Missing PO number",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(d2)
        add_extracted_fields(d2_id, "INV-2026-0002", "Northstar Logistics", "", 2340.0)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d2_id, rule_name="PO number required", status=ValidationStatus.FAILED, severity=Severity.CRITICAL, expected="Non-empty", actual="(missing)", message="Invoice has no PO reference."))
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d2_id, rule_name="Vendor exists", status=ValidationStatus.PASSED, severity=Severity.HIGH, expected="Known vendor", actual="Northstar Logistics", message="Vendor matched."))
        add_audit_log(d2_id, "DOCUMENT_UPLOADED", users["processor"].id, 2)
        add_audit_log(d2_id, "VALIDATION_FAILED", None, 2)

        # Document 3: Amount exceeds PO - NEEDS_REVIEW
        d3_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440003")
        d3 = Document(
            id=d3_id,
            document_number="INV-2026-0003",
            vendor_id=vendors["v4"].id,
            purchase_order_id=pos["po3"].id,
            status=DocumentStatus.NEEDS_REVIEW,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("24500.00"),
            currency="USD",
            invoice_date=date(2026, 5, 16),
            due_date=date(2026, 6, 16),
            confidence_score=0.92,
            priority=Priority.HIGH,
            scenario="Amount exceeds PO",
            created_at=datetime.now(timezone.utc) - timedelta(days=3)
        )
        db.add(d3)
        add_extracted_fields(d3_id, "INV-2026-0003", "BuildRight Materials", "PO-2026-1003", 24500.0)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d3_id, rule_name="Amount within PO remaining", status=ValidationStatus.FAILED, severity=Severity.CRITICAL, expected="<= $22,000", actual="$24,500", message="Invoice exceeds remaining PO balance."))
        add_audit_log(d3_id, "DOCUMENT_UPLOADED", users["processor"].id, 3)
        add_audit_log(d3_id, "NEEDS_REVIEW", None, 3)

        # Document 4: Duplicate invoice - VALIDATION_FAILED
        d4_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440004")
        d4 = Document(
            id=d4_id,
            document_number="INV-2026-0004",
            vendor_id=vendors["v1"].id,
            purchase_order_id=pos["po1"].id,
            status=DocumentStatus.VALIDATION_FAILED,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("4820.00"),
            currency="USD",
            invoice_date=date(2026, 5, 12),
            due_date=date(2026, 6, 12),
            confidence_score=0.97,
            priority=Priority.MEDIUM,
            scenario="Duplicate invoice",
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.add(d4)
        add_extracted_fields(d4_id, "INV-2026-0004", "Apex Industrial Supplies", "PO-2026-1001", 4820.0)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d4_id, rule_name="Duplicate invoice check", status=ValidationStatus.FAILED, severity=Severity.CRITICAL, expected="Unique invoice number", actual="Duplicate of INV-2026-0001", message="Invoice number already processed."))
        add_audit_log(d4_id, "DOCUMENT_UPLOADED", users["processor"].id, 1)
        add_audit_log(d4_id, "VALIDATION_FAILED", None, 1)

        # Document 5: Unknown vendor - NEEDS_REVIEW
        d5_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440005")
        d5 = Document(
            id=d5_id,
            document_number="INV-2026-0005",
            status=DocumentStatus.NEEDS_REVIEW,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("1280.00"),
            currency="USD",
            invoice_date=date(2026, 5, 18),
            due_date=date(2026, 6, 18),
            confidence_score=0.84,
            priority=Priority.MEDIUM,
            scenario="Unknown vendor",
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.add(d5)
        add_extracted_fields(d5_id, "INV-2026-0005", "Globex Components", "", 1280.0)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d5_id, rule_name="Vendor exists", status=ValidationStatus.FAILED, severity=Severity.HIGH, expected="Known vendor", actual="Globex Components", message="Vendor not found in master."))
        add_audit_log(d5_id, "DOCUMENT_UPLOADED", users["processor"].id, 1)

        # Document 6: Missing tax field - NEEDS_REVIEW
        d6_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440006")
        d6 = Document(
            id=d6_id,
            document_number="INV-2026-0006",
            vendor_id=vendors["v3"].id,
            purchase_order_id=pos["po5"].id,
            status=DocumentStatus.NEEDS_REVIEW,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("3450.00"),
            currency="USD",
            invoice_date=date(2026, 5, 20),
            due_date=date(2026, 6, 20),
            confidence_score=0.89,
            priority=Priority.MEDIUM,
            scenario="Missing tax field",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(d6)
        add_extracted_fields(d6_id, "INV-2026-0006", "MedCore Billing Services", "PO-2026-1005", 3450.0, missing_tax=True)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d6_id, rule_name="Required field: Tax", status=ValidationStatus.FAILED, severity=Severity.MEDIUM, expected="Non-empty", actual="(missing)", message="Tax amount not extracted."))
        add_audit_log(d6_id, "DOCUMENT_UPLOADED", users["processor"].id, 2)

        # Document 7: Future invoice date - VALIDATION_FAILED
        d7_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440007")
        d7 = Document(
            id=d7_id,
            document_number="INV-2026-0007",
            vendor_id=vendors["v2"].id,
            purchase_order_id=pos["po2"].id,
            status=DocumentStatus.VALIDATION_FAILED,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("980.00"),
            currency="USD",
            invoice_date=date(2027, 1, 5),
            due_date=date(2027, 2, 5),
            confidence_score=0.93,
            priority=Priority.LOW,
            scenario="Future invoice date",
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(d7)
        add_extracted_fields(d7_id, "INV-2026-0007", "Northstar Logistics", "PO-2026-1002", 980.0)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d7_id, rule_name="Invoice date not in future", status=ValidationStatus.FAILED, severity=Severity.HIGH, expected="<= today", actual="2027-01-05", message="Invoice date is in the future."))
        add_audit_log(d7_id, "DOCUMENT_UPLOADED", users["processor"].id, 2)

        # Document 8: Low-confidence OCR - NEEDS_REVIEW
        d8_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440008")
        d8 = Document(
            id=d8_id,
            document_number="INV-2026-0008",
            vendor_id=vendors["v5"].id,
            purchase_order_id=pos["po4"].id,
            status=DocumentStatus.NEEDS_REVIEW,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("720.00"),
            currency="USD",
            invoice_date=date(2026, 5, 22),
            due_date=date(2026, 6, 22),
            confidence_score=0.62,
            priority=Priority.LOW,
            scenario="Low-confidence OCR",
            created_at=datetime.now(timezone.utc) - timedelta(days=1)
        )
        db.add(d8)
        add_extracted_fields(d8_id, "INV-2026-0008", "Prime Office Solutions", "PO-2026-1004", 720.0, low_conf=True)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d8_id, rule_name="Confidence threshold", status=ValidationStatus.FAILED, severity=Severity.MEDIUM, expected=">= 0.80", actual="0.62", message="Average extraction confidence below threshold."))
        add_audit_log(d8_id, "DOCUMENT_UPLOADED", users["processor"].id, 1)

        # Document 9: High-value invoice - READY_FOR_APPROVAL
        d9_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440009")
        d9 = Document(
            id=d9_id,
            document_number="INV-2026-0009",
            vendor_id=vendors["v4"].id,
            purchase_order_id=pos["po3"].id,
            status=DocumentStatus.READY_FOR_APPROVAL,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("18750.00"),
            currency="USD",
            invoice_date=date(2026, 5, 23),
            due_date=date(2026, 6, 23),
            confidence_score=0.96,
            priority=Priority.HIGH,
            scenario="High-value invoice",
            created_at=datetime.now(timezone.utc) - timedelta(days=4)
        )
        db.add(d9)
        add_extracted_fields(d9_id, "INV-2026-0009", "BuildRight Materials", "PO-2026-1003", 18750.0)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d9_id, rule_name="All checks passed", status=ValidationStatus.PASSED, severity=Severity.LOW, expected="All rules pass", actual="All rules pass", message="Ready for approval."))
        add_audit_log(d9_id, "DOCUMENT_UPLOADED", users["processor"].id, 4)
        add_audit_log(d9_id, "REVIEWED", users["reviewer"].id, 2)
        add_audit_log(d9_id, "READY_FOR_APPROVAL", users["reviewer"].id, 1)

        # Document 10: Exported invoice - EXPORTED
        d10_id = uuid.UUID("770e8400-e29b-41d4-a716-446655440010")
        d10 = Document(
            id=d10_id,
            document_number="INV-2026-0010",
            vendor_id=vendors["v1"].id,
            purchase_order_id=pos["po1"].id,
            status=DocumentStatus.EXPORTED,
            uploaded_by_id=users["processor"].id,
            assigned_reviewer_id=users["reviewer"].id,
            assigned_approver_id=users["approver"].id,
            total_amount=Decimal("6230.00"),
            currency="USD",
            invoice_date=date(2026, 4, 10),
            due_date=date(2026, 5, 10),
            confidence_score=0.99,
            priority=Priority.LOW,
            scenario="Exported invoice",
            created_at=datetime.now(timezone.utc) - timedelta(days=40)
        )
        db.add(d10)
        add_extracted_fields(d10_id, "INV-2026-0010", "Apex Industrial Supplies", "PO-2026-1001", 6230.0)
        db.add(ValidationResult(id=uuid.uuid4(), document_id=d10_id, rule_name="All checks passed", status=ValidationStatus.PASSED, severity=Severity.LOW, expected="All rules pass", actual="All rules pass", message="Exported to ERP."))
        add_audit_log(d10_id, "DOCUMENT_UPLOADED", users["processor"].id, 40)
        add_audit_log(d10_id, "APPROVED", users["approver"].id, 30)
        add_audit_log(d10_id, "EXPORTED", None, 28)

        db.commit()

        # Seed extra Audit Logs to populate audit trail page
        actions = [
            "USER_LOGIN", "DOCUMENT_UPLOADED", "DOCUMENT_PROCESSED", "STATUS_CHANGED",
            "FIELD_CORRECTED", "VALIDATION_RUN", "SENT_TO_REVIEW", "APPROVED", "REJECTED", "EXPORTED",
        ]
        actors = [users["admin"], users["processor"], users["reviewer"], users["approver"]]
        
        import random
        for i in range(25):
            actor = random.choice(actors)
            action = random.choice(actions)
            doc_ref = f"INV-2026-000{random.randint(1, 9)}"
            
            is_field = action in ("FIELD_CORRECTED", "STATUS_CHANGED")
            
            db.add(AuditLog(
                id=uuid.uuid4(),
                actor_id=actor.id,
                entity_type="Document" if "DOCUMENT" in action or action in ("STATUS_CHANGED", "FIELD_CORRECTED", "VALIDATION_RUN", "APPROVED", "REJECTED", "EXPORTED") else "User",
                entity_id=doc_ref if "Document" else str(actor.id),
                action=action,
                old_value="EXTRACTED" if is_field else None,
                new_value="NEEDS_REVIEW" if is_field else None,
                ip_address=f"10.23.{random.randint(1, 20)}.{random.randint(1, 250)}",
                created_at=datetime.now(timezone.utc) - timedelta(hours=i*4 + random.randint(1, 3))
            ))

        db.commit()
    
    print("Database check & seeding completed successfully.")
