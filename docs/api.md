# DocuFlow AI — REST API Reference

The backend exposes a secure REST API on `/api/v1` protected by JWT authentication and RBAC dependency guards.

---

## Authentication Endpoints

### 1. User Sign In
* **Method**: `POST`
* **URL**: `/api/v1/auth/login`
* **Payload**:
  ```json
  {
    "username": "reviewer@docuflow.ai",
    "password": "Reviewer@123"
  }
  ```
* **Response**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "bearer",
    "user": {
      "id": "c76a917c-2b22-48e0-bb12-9c1762b1b369",
      "fullName": "Alice Johnson",
      "email": "reviewer@docuflow.ai",
      "role": "REVIEWER"
    }
  }
  ```

---

## Document Workflow Endpoints

### 2. Upload Document
* **Method**: `POST`
* **URL**: `/api/v1/documents/upload`
* **Headers**: `Authorization: Bearer <token>`
* **Payload**: `multipart/form-data` containing `file`
* **Required Role**: `PROCESSOR` or `ADMIN`
* **Response**:
  ```json
  {
    "id": "e45ba012-11ef-42b3-a128-4985223abef0",
    "number": "INV-NEW-99",
    "status": "UPLOADED"
  }
  ```

### 3. Trigger Extraction
* **Method**: `POST`
* **URL**: `/api/v1/documents/{id}/process`
* **Headers**: `Authorization: Bearer <token>`
* **Required Role**: `PROCESSOR` or `ADMIN`
* **Response**: Serialized `DocumentRead` JSON structure.

### 4. Fetch Validation Results
* **Method**: `GET`
* **URL**: `/api/v1/documents/{id}/validation-results`
* **Headers**: `Authorization: Bearer <token>`
* **Required Role**: `REVIEWER`, `APPROVER`, or `ADMIN`
* **Response**:
  ```json
  [
    {
      "id": "18fa9180-a19f-4318-971c-19c28eef911a",
      "ruleName": "Duplicate invoice check",
      "status": "PASSED",
      "severity": "CRITICAL",
      "expectedValue": "Unique invoice number",
      "actualValue": "Unique",
      "message": "Invoice number unique."
    }
  ]
  ```

### 5. Correct Extracted Field
* **Method**: `PATCH`
* **URL**: `/api/v1/documents/{id}/fields/{field_name}`
* **Headers**: `Authorization: Bearer <token>`
* **Required Role**: `REVIEWER` or `ADMIN`
* **Payload**:
  ```json
  {
    "value": "1500.00"
  }
  ```
* **Response**: Serialized `DocumentRead` JSON showing updated `total_amount` and field `corrected_value`.

### 6. Complete Human Review
* **Method**: `POST`
* **URL**: `/api/v1/documents/{id}/review/complete`
* **Headers**: `Authorization: Bearer <token>`
* **Required Role**: `REVIEWER` or `ADMIN`
* **Payload**:
  ```json
  {
    "notes": "Verified PO number with vendor. PO balance is correct."
  }
  ```
* **Response**: Serialized `DocumentRead` transitioning the status to `READY_FOR_APPROVAL`.

### 7. Approve Document
* **Method**: `POST`
* **URL**: `/api/v1/documents/{id}/approve`
* **Headers**: `Authorization: Bearer <token>`
* **Required Role**: `APPROVER` or `ADMIN`
* **Response**: Serialized `DocumentRead` status transitioning to `APPROVED`.
