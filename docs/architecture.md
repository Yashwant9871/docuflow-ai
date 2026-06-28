# DocuFlow AI — System Architecture

DocuFlow AI is built using a modern decoupled client-server architecture, separation of concerns, and human-in-the-loop design principles.

---

## High-Level Architecture Flow

```mermaid
graph LR
    User[1. Client React SPA] -->|Axios JSON Requests| API[2. FastAPI Gateway]
    API -->|JWT Validator| Auth[3. Security Middleware]
    API -->|Session Unit of Work| ORM[4. SQLAlchemy ORM]
    ORM -->|TCP Connection Pool| DB[(5. PostgreSQL Database)]
    API -->|Multipart Form Upload| Disk[(6. Local Storage /app/uploads)]
    API -->|Extraction & Validation Pipeline| Engine[7. Document Processing Services]
```

---

## Component Responsibilities

### 1. Frontend SPA (TanStack Start & Router)
* **Routing**: Managed via TanStack Router with client-side route guards validating session state.
* **State Management**: Asynchronous server caches are synchronized using custom React Query hooks under `src/hooks`.
* **API Client**: Intercepts outgoing calls to inject JWT Bearer headers and handle token renewals.

### 2. Backend REST API (FastAPI)
* **Request Validation**: Strictly serializes JSON payloads and parameters using Pydantic V2 schemas.
* **Dependency Injection**: Resolves security roles requirements and database context sessions on-the-fly.

### 3. Business Service Layer
* **Extraction Service**: Runs digital PDF extraction via `pypdf` and coordinates image OCR simulation.
* **Validation Engine**: Sequentially checks 9 configurable compliance rules.
* **Audit Logger**: Captures changes, actors, IP addresses, and transition states.

---

## Request Lifecycle (Process Pipeline)

```mermaid
sequenceDiagram
    autonumber
    actor Processor
    participant API as FastAPI Router
    participant Service as Document Service
    participant OCR as Extraction Service
    participant Engine as Validation Engine
    participant DB as PostgreSQL Database

    Processor->>API: POST /documents/{id}/process
    API->>Service: process_document(db, doc, user_id)
    Note over Service: Status -> PROCESSING
    Service->>DB: Update status, write Audit Log (OCR_STARTED)
    Service->>OCR: extract_fields(db, doc)
    OCR->>DB: Write ExtractedField records
    Note over Service: Status -> EXTRACTED
    Service->>DB: Write Audit Log (OCR_COMPLETED)
    Service->>Engine: validate_document(db, doc)
    Engine->>DB: Write ValidationResult records
    Note over Service: Evaluate Failures
    alt Critical Fails
        Service->>DB: Status -> VALIDATION_FAILED, log VALIDATION_FAILED
    else Warnings / Medium Fails
        Service->>DB: Status -> NEEDS_REVIEW, log VALIDATION_FAILED
    else Clean Pass
        Service->>DB: Status -> READY_FOR_APPROVAL, log VALIDATION_COMPLETED
    end
    Service-->>Processor: Return DocumentRead serialization
```
