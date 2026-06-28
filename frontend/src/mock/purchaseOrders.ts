import type { PurchaseOrder } from "./types";

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: "po1", number: "PO-2026-1001", vendor: "Apex Industrial Supplies", totalAmount: 12000, remainingAmount: 3200, currency: "USD", status: "PARTIALLY_USED", createdDate: "2026-01-12", linkedDocuments: 3 },
  { id: "po2", number: "PO-2026-1002", vendor: "Northstar Logistics", totalAmount: 8500, remainingAmount: 0, currency: "USD", status: "CLOSED", createdDate: "2026-02-03", linkedDocuments: 2 },
  { id: "po3", number: "PO-2026-1003", vendor: "BuildRight Materials", totalAmount: 22000, remainingAmount: 22000, currency: "USD", status: "OPEN", createdDate: "2026-03-18", linkedDocuments: 0 },
  { id: "po4", number: "PO-2026-1004", vendor: "Prime Office Solutions", totalAmount: 4500, remainingAmount: 1500, currency: "USD", status: "ON_HOLD", createdDate: "2026-04-02", linkedDocuments: 1 },
  { id: "po5", number: "PO-2026-1005", vendor: "MedCore Billing Services", totalAmount: 15800, remainingAmount: 9300, currency: "USD", status: "PARTIALLY_USED", createdDate: "2026-04-21", linkedDocuments: 2 },
];
