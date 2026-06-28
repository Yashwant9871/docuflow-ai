# Technical & Business FAQ

### 1. Why does DocuFlow AI prohibit autonomous approval and export?
Autonomous financial approvals introduce significant fraud and compliance risks. Financial regulations (such as Sarbanes-Oxley compliance) require distinct separation of duties and human accountability. DocuFlow AI acts as an intelligence assistant—extracting data and flagging validation issues—but requires an authorized human user to sign off on invoices.

### 2. How accurate is the invoice OCR and field extraction?
For digital PDFs (generated directly from billing tools), accuracy is **100%** as it parses character coordinates using `pypdf`. For scanned paper invoices or image uploads, accuracy depends on scan resolution. The system handles low confidence by routing the document to the human review queue.

### 3. How does the validation engine prevent duplicate invoices?
The validation engine performs a database query looking for existing documents with the same `vendor_id` and `document_number`. If a match is found (excluding the active document's ID), the duplicate validation rule fails, flagging the invoice as a critical exception.

### 4. Can DocuFlow AI integrate with our existing ERP?
Yes. Approved invoices are structured and can be exported as standard CSV files. The platform is designed to connect to ERP systems (such as SAP, NetSuite, or Microsoft Dynamics) via REST APIs or secure FTP file transfers.

### 5. Can new validation rules be added?
Yes. The validation engine uses a modular rule check design. New checks (such as tax compliance audits, discount deadline checks, or currency validations) can be added to `apps/api/app/services/validation_service.py` without modifying the core API routers.
