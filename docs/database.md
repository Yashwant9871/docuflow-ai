# DocuFlow AI — Database Design

DocuFlow AI implements a relational database structure designed with SQLAlchemy ORM and PostgreSQL. UUIDs are used for all primary keys to guarantee unique identification across potential distributed ledgers.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        string full_name
        string email
        string hashed_password
        boolean is_active
        datetime created_at
    }
    roles {
        uuid id PK
        string name
        string description
    }
    user_roles {
        uuid user_id FK
        uuid role_id FK
    }
    vendors {
        uuid id PK
        string vendor_code
        string name
        string tax_id
        string email
        string phone
        string status
    }
    purchase_orders {
        uuid id PK
        string po_number
        uuid vendor_id FK
        numeric total_amount
        numeric remaining_amount
        string currency
        string status
    }
    documents {
        uuid id PK
        string document_number
        string document_type
        string file_name
        string file_path
        uuid vendor_id FK
        uuid purchase_order_id FK
        string status
        uuid uploaded_by_id FK
        uuid assigned_reviewer_id FK
        uuid assigned_approver_id FK
        numeric total_amount
        string currency
        date invoice_date
        date due_date
        float confidence_score
        string priority
        string scenario
        string raw_text
        string processing_error
        string reviewer_notes
        boolean is_ocr_simulated
    }
    extracted_fields {
        uuid id PK
        uuid document_id FK
        string field_name
        string field_value
        float confidence
        string source
        string status
        boolean is_corrected
        string corrected_value
        uuid corrected_by_id FK
        datetime corrected_at
    }
    validation_results {
        uuid id PK
        uuid document_id FK
        string rule_name
        string status
        string severity
        string expected_value
        string actual_value
        string message
    }
    audit_logs {
        uuid id PK
        uuid actor_id FK
        string entity_type
        string entity_id
        string action
        string old_value
        string new_value
        string ip_address
        datetime created_at
    }

    users ||--o{ user_roles : has
    roles ||--o{ user_roles : holds
    vendors ||--o{ purchase_orders : issues
    vendors ||--o{ documents : owns
    purchase_orders ||--o{ documents : matches
    documents ||--o{ extracted_fields : extracts
    documents ||--o{ validation_results : validates
    users ||--o{ audit_logs : logs
```

---

## Major Tables Layout

### 1. `documents`
Stores metadata, file storage references, and active process pipeline statuses.
* `id` (UUID, Primary Key)
* `document_number` (String, Indexed, Unique) - Extracted invoice reference.
* `status` (String) - Mapped enum values (`UPLOADED`, `NEEDS_REVIEW`, etc.).
* `raw_text` (String) - Full OCR output.
* `is_ocr_simulated` (Boolean) - True if image OCR fallback is active.
* `reviewer_notes` (String) - Comments saved during human verification.

### 2. `extracted_fields`
Saves key-value pairs parsed from the document with audit histories.
* `id` (UUID, Primary Key)
* `document_id` (UUID, Foreign Key)
* `field_name` (String) - Field identifier (`Invoice Number`, `Total Amount`, etc.).
* `field_value` (String) - Value originally returned by the extraction pipeline.
* `corrected_value` (String) - Edited value overwritten by the human reviewer.
* `is_corrected` (Boolean) - Flags human intervention.
* `corrected_by_id` (UUID, Foreign Key)
* `corrected_at` (DateTime)

### 3. `validation_results`
Individual rules check outcomes returned by the validation engine.
* `id` (UUID, Primary Key)
* `document_id` (UUID, Foreign Key)
* `rule_name` (String)
* `status` (String) - `PASSED`, `FAILED`, or `WARNING`.
* `severity` (String) - `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW`.
* `expected_value` / `actual_value` (String)

### 4. `audit_logs`
Read-only event log table tracking all application transactions.
* `id` (UUID, Primary Key)
* `actor_id` (UUID, Foreign Key) - Target user.
* `action` (String) - Trigger action (`FIELD_CORRECTED`, `REVIEW_COMPLETED`, etc.).
* `old_value` / `new_value` (String) - Value diff snapshot.
