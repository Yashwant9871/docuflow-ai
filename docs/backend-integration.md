# DocuFlow AI — Backend Integration

## Backend Integration Details

### 1. Unified API Client
An API client is built in `frontend/src/services/api.ts` that:
- Reads the base URL from the Vite configuration env `import.meta.env.VITE_API_BASE_URL`.
- Automatically injects the JWT access token in the `Authorization: Bearer <token>` header of every outgoing fetch request.
- Centralizes error handling and token expiration logouts.

### 2. React Query Migration Pattern
Rather than loading static synchronous variables directly on render (e.g. `const docs = getDocuments();`), route pages utilize the `@tanstack/react-query` hook library to fetch data asynchronously:
```typescript
const { data: docs = [], isLoading } = useQuery({
  queryKey: ['documents'],
  queryFn: getDocuments
});
```
This enables native async status management (loading state, error boundary triggers, network re-fetches, caching) while preserving the identical Lovable JSX layouts.

### 3. Data Schema Mapping (Mappers)
To ensure frontend typescript interfaces defined in `src/mock/types.ts` remain unchanged, API endpoints map backend entity fields into camelCase properties matching the UI expectations before returning JSON. Properties such as `issueCount` and vendor exception rates are calculated on-the-fly inside the SQLAlchemy query layer.

### 4. Phase 2: OCR & Validation Integration
- **Text & OCR Fallback**: Raw extracted text is saved to `raw_text` and mapped as `rawText` on `DocumentRead`.
- **Inline Corrections**: The table values in `_app.documents.$id.tsx` trigger `PATCH /documents/{id}/fields/{field_name}` which saves the corrected value and logs the `FIELD_CORRECTED` audit event.
- **Human Review**: Complete review actions call `POST /documents/{id}/review/complete` which saves comments into the `reviewer_notes` field and transitions the status.
