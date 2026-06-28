# DocuFlow AI — API Reference

All API endpoints are prefixed with `/api/v1`.

## Auth Endpoints

### 1. Login
* **URL**: `/auth/login`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "email": "admin@docuflow.ai",
    "password": "Admin@123"
  }
  ```
* **Response**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "110e8400-e29b-41d4-a716-446655440001",
      "full_name": "Admin User",
      "email": "admin@docuflow.ai",
      "roles": ["ADMIN"]
    }
  }
  ```

### 2. Token Refresh
* **URL**: `/auth/refresh`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "refresh_token": "eyJhbGciOi..."
  }
  ```

### 3. Get Current User Details
* **URL**: `/auth/me`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <access_token>`

---

## Documents Endpoints

### 1. Upload Invoice
* **URL**: `/documents/upload`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <access_token>`, `Content-Type: multipart/form-data`
* **Form Parameters**:
  - `file`: (Binary File)
  - `document_type`: "Invoice"
  - `vendor_id`: (UUID String, Optional)
  - `purchase_order_id`: (UUID String, Optional)
  - `notes`: (String, Optional)

### 2. Fetch Document List
* **URL**: `/documents`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <access_token>`

### 3. Fetch Document Detail
* **URL**: `/documents/{document_id}`
* **Method**: `GET`
* **Headers**: `Authorization: Bearer <access_token>`

### 4. Process Document (Stub Extraction)
* **URL**: `/documents/{document_id}/process`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <access_token>`

### 5. Approve Document
* **URL**: `/documents/{document_id}/approve`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <access_token>`

### 6. Reject Document
* **URL**: `/documents/{document_id}/reject`
* **Method**: `POST`
* **Headers**: `Authorization: Bearer <access_token>`

---

## Vendors & POs

### 1. List Vendors
* **URL**: `/vendors`
* **Method**: `GET`

### 2. Create Vendor
* **URL**: `/vendors`
* **Method**: `POST`

### 3. List Purchase Orders
* **URL**: `/purchase-orders`
* **Method**: `GET`

---

## Audit Logs

### 1. Global Audit Log Trail
* **URL**: `/audit-logs`
* **Method**: `GET`

### 2. Document Audit Log Timeline
* **URL**: `/documents/{document_id}/audit`
* **Method**: `GET`
