from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.extracted_field import ExtractedField
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder
from app.utils.enums import FieldStatus, DocumentStatus
import uuid
import re
import os
from datetime import datetime, date
from decimal import Decimal
from pypdf import PdfReader

def extract_raw_text(file_path: str) -> str:
    """Extract raw text from PDF or image using pypdf and optional pytesseract."""
    if not file_path or not os.path.exists(file_path):
        return "[Error] File path not found or not specified."

    _, ext = os.path.splitext(file_path.lower())
    if ext == '.pdf':
        try:
            reader = PdfReader(file_path)
            text = ""
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            return f"[Error] Digital PDF text extraction failed: {str(e)}"
    elif ext in ('.png', '.jpg', '.jpeg'):
        try:
            import pytesseract
            from PIL import Image
            img = Image.open(file_path)
            return pytesseract.image_to_string(img).strip()
        except Exception as e:
            return f"[OCR Fallback Simulation] Scanned image text content. Tesseract OCR binary not found. File: {os.path.basename(file_path)}"
    else:
        return f"[Error] Unsupported file format: {ext}"

def parse_with_regex(text: str, pattern: str) -> str | None:
    """Helper to search regex pattern and return first group match."""
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return None

def extract_fields(db: Session, doc: Document) -> list[ExtractedField]:
    """Runs PDF/OCR extraction, saves raw text, parses fields, and maps them to ExtractedField."""
    print(f"Running OCR/Text extraction pipeline for document ID: {doc.id}")
    
    # 1. Extract raw text
    raw_text = ""
    if doc.file_path:
        raw_text = extract_raw_text(doc.file_path)
    
    doc.raw_text = raw_text
    doc.is_ocr_simulated = "[OCR Fallback Simulation]" in raw_text
    if "[Error]" in raw_text:
        doc.processing_error = raw_text
        doc.status = DocumentStatus.NEEDS_REVIEW
    else:
        doc.processing_error = None

    # Delete existing extracted fields if any
    db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).delete()
    db.commit()

    fields_to_create = []

    # 2. Check if we have a seeded scenario to retain high-fidelity mock properties
    is_scenario = doc.scenario is not None and doc.scenario != "Newly uploaded"
    
    # Defaults
    inv_num = doc.document_number or ""
    vendor_name = doc.vendor.name if doc.vendor else ""
    inv_date = doc.invoice_date.strftime("%Y-%m-%d") if doc.invoice_date else ""
    due_date = doc.due_date.strftime("%Y-%m-%d") if doc.due_date else ""
    po_num = doc.purchase_order.po_number if doc.purchase_order else ""
    total = float(doc.total_amount) if doc.total_amount is not None else 0.0
    tax_id = doc.vendor.tax_id if doc.vendor else ""

    # Parse using regex/heuristics if NOT a seeded scenario
    if not is_scenario and raw_text and "[Error]" not in raw_text:
        # Regex Parsers
        parsed_inv_num = parse_with_regex(raw_text, r'(?:invoice|inv)(?:\s+number|\s*no\.?|\s*#)?\s*:?\s*([A-Za-z0-9-]+)')
        if parsed_inv_num:
            inv_num = parsed_inv_num
            doc.document_number = inv_num

        parsed_po_num = parse_with_regex(raw_text, r'(?:po|purchase\s+order)(?:\s+number|\s*no\.?|\s*#)?\s*:?\s*([A-Za-z0-9-]+)')
        if parsed_po_num:
            po_num = parsed_po_num
            po_rec = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_num).first()
            if po_rec:
                doc.purchase_order_id = po_rec.id

        parsed_total = parse_with_regex(raw_text, r'(?:total|amount\s+due|grand\s+total)\s*:?\s*\$?\s*([0-9,]+\.[0-9]{2})')
        if parsed_total:
            try:
                total = float(parsed_total.replace(',', ''))
                doc.total_amount = Decimal(f"{total:.2f}")
            except:
                pass

        parsed_tax_id = parse_with_regex(raw_text, r'(?:tax\s+id|ein|vat\s*#?)\s*:?\s*([A-Za-z0-9-]+)')
        if parsed_tax_id:
            tax_id = parsed_tax_id

        parsed_inv_date = parse_with_regex(raw_text, r'(?:invoice\s+date|inv\s+date|date)\s*:?\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4})')
        if parsed_inv_date:
            inv_date = parsed_inv_date
            try:
                doc.invoice_date = datetime.strptime(inv_date, "%Y-%m-%d").date()
            except:
                pass

        parsed_due_date = parse_with_regex(raw_text, r'(?:due\s+date|pay\s+by)\s*:?\s*([0-9]{4}[-/][0-9]{2}[-/][0-9]{2}|[0-9]{2}[-/][0-9]{2}[-/][0-9]{4})')
        if parsed_due_date:
            due_date = parsed_due_date
            try:
                doc.due_date = datetime.strptime(due_date, "%Y-%m-%d").date()
            except:
                pass

        # Look up vendor name in raw text
        all_vendors = db.query(Vendor).all()
        for v in all_vendors:
            if v.name.lower() in raw_text.lower():
                vendor_name = v.name
                doc.vendor_id = v.id
                break

    # Setup numeric values
    subtotal = total / 1.1
    tax = total - subtotal

    # Define fields
    raw_fields = [
        ("Invoice Number", inv_num, 0.99, FieldStatus.OK),
        ("Vendor Name", vendor_name, 0.97, FieldStatus.OK),
        ("Invoice Date", inv_date, 0.96, FieldStatus.OK),
        ("Due Date", due_date, 0.95, FieldStatus.OK),
        ("PO Number", po_num, 0.94 if po_num else 0.0, FieldStatus.OK if po_num else FieldStatus.MISSING),
        ("Subtotal", f"${subtotal:.2f}" if total > 0 else "", 0.93 if total > 0 else 0.0, FieldStatus.OK if total > 0 else FieldStatus.MISSING),
        ("Tax", f"${tax:.2f}" if (total > 0 and doc.scenario != "Missing tax field") else "", 0.91 if (total > 0 and doc.scenario != "Missing tax field") else 0.0, FieldStatus.OK if (total > 0 and doc.scenario != "Missing tax field") else FieldStatus.MISSING),
        ("Total Amount", f"${total:.2f}" if total > 0 else "", 0.97 if total > 0 else 0.0, FieldStatus.OK if total > 0 else FieldStatus.MISSING),
        ("Currency", doc.currency or "USD", 0.99, FieldStatus.OK),
        ("Payment Terms", "Net 30", 0.90, FieldStatus.OK),
    ]

    # Calculate average confidence
    valid_scores = [score for _, _, score, status in raw_fields if status != FieldStatus.MISSING]
    avg_conf = sum(valid_scores) / len(valid_scores) if valid_scores else 0.0
    doc.confidence_score = avg_conf

    # Reduced confidence scenario
    is_low_conf = doc.scenario == "Low-confidence OCR" or avg_conf < 0.8

    for name, val, conf, status in raw_fields:
        actual_conf = max(0.55, conf - 0.3) if is_low_conf else conf
        actual_status = FieldStatus.LOW_CONFIDENCE if is_low_conf and status == FieldStatus.OK else status

        field = ExtractedField(
            id=uuid.uuid4(),
            document_id=doc.id,
            field_name=name,
            field_value=val,
            confidence=actual_conf,
            source="OCR",
            status=actual_status
        )
        db.add(field)
        fields_to_create.append(field)

    db.commit()
    return fields_to_create
