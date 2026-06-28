# DocuFlow AI — Phase Roadmap

## Phase 1: Backend Foundation & Integration (Current Phase)
* **Status**: Complete
* **Goal**: Build a functional FastAPI REST API backend with a persistent PostgreSQL database, seed enterprise data matching mockup scenarios, and integrate it with TanStack Router/Start using React Query.

---

## Phase 2: OCR & AI Extraction Pipeline
* **Timeline**: 4-6 Weeks
* **Goal**: Integrate real optical character recognition (OCR) and large language model (LLM) field extraction pipelines.
* **Milestones**:
  1. **OCR Engine Integration**: Deploy Tesseract OCR (or AWS Textract/Google Cloud Document AI) to parse text coordinates from uploaded PDFs and images.
  2. **LLM Extraction Layer**: Connect Gemini API (or local Mistral model) using Structured JSON outputs to extract target fields (vendor details, purchase order numbers, invoice date, payment terms, itemized tables) dynamically.
  3. **Confidence Scoring**: Compute confidence values per field based on token logprobs and visual bounds alignment.

---

## Phase 3: Background Worker Queue & ERP Integrations
* **Timeline**: 8-10 Weeks
* **Goal**: Harden system performance for high throughput and support automatic sync to external financial systems.
* **Milestones**:
  1. **Asynchronous Background Processing**: Transition OCR/AI tasks to Celery or RQ background queues powered by the Redis container.
  2. **File Preview Engine**: Build a dual-pane invoice preview screen rendering text highlight bounding boxes on top of the original PDF layout.
  3. **ERP Connectors**: Implement CSV/API exports to standard ERP ledgers (e.g. NetSuite, SAP, QuickBooks).
