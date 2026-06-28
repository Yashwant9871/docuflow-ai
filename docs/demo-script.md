# DocuFlow AI — Consulting Demo Script

This script walks potential clients, stakeholders, or managers through DocuFlow AI's business value and human-in-the-loop workflows in 3 minutes.

---

## 1. Onboarding & Login (0:00 - 0:30)
* **Action**: Open [http://localhost:5173/login](http://localhost:5173/login).
* **Script**: 
  > "Welcome to the DocuFlow AI platform overview. DocuFlow AI solves manual invoice processing errors by combining automated text extraction with strict validations and human audit controls. Let's start by logging in as our Processor, whose job is to ingest new documents."
* **Action**: Log in using `processor@docuflow.ai` / `Processor@123`.

---

## 2. Ingestion & Automated Extraction (0:30 - 1:15)
* **Action**: Navigate to `/documents/upload`, drag-and-drop a sample invoice PDF, and click **Process**.
* **Script**:
  > "As a Processor, I upload our newly received invoice. Once processed, DocuFlow AI runs digital text parsing to extract the vendor, PO reference, amount, and date. Simultaneously, it runs a rules engine verifying if this vendor is registered, if the invoice amount matches our purchase order balance, and if this invoice is a duplicate."

---

## 3. Human Review & Corrections (1:15 - 2:15)
* **Action**: Log out, log in as `reviewer@docuflow.ai` / `Reviewer@123`, and open the uploaded invoice.
* **Script**:
  > "Our validation flagged warnings due to low OCR confidence or validation mismatches. Logging in as a Reviewer, I inspect the document details. Here we see the raw OCR text side-by-side with our parsed fields. I can hover over any incorrect value, edit it inline, and see it sync automatically. Once fixed, I add reviewer comments, click 'Complete Review', and the document is routed forward as clean and Ready for Approval."

---

## 4. Executive Approval & Audit Trail (2:15 - 3:00)
* **Action**: Log out, log in as `approver@docuflow.ai` / `Approver@123`, open the document, and click **Approve** and then **Export CSV**.
* **Script**:
  > "Finally, our Approver reviews the invoice. The system displays a comprehensive audit history detailing who uploaded the file, what corrections were made, and who verified it. I click 'Approve' and 'Export CSV' to send the data directly into our ERP ledger. DocuFlow AI ensures the AI assists, but humans retain full operational control over the financial ledger."
