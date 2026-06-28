import type { Vendor } from "./types";

export const mockVendors: Vendor[] = [
  { id: "v1", code: "APX-001", name: "Apex Industrial Supplies", taxId: "TX-92831", email: "ap@apexsupplies.com", phone: "+1 (415) 555-0142", status: "ACTIVE", totalDocuments: 42, exceptionRate: 4.7 },
  { id: "v2", code: "NST-002", name: "Northstar Logistics", taxId: "TX-44217", email: "billing@northstarlog.com", phone: "+1 (312) 555-0193", status: "ACTIVE", totalDocuments: 31, exceptionRate: 12.9 },
  { id: "v3", code: "MED-003", name: "MedCore Billing Services", taxId: "TX-77104", email: "ar@medcore.com", phone: "+1 (646) 555-0188", status: "ACTIVE", totalDocuments: 18, exceptionRate: 5.5 },
  { id: "v4", code: "BLD-004", name: "BuildRight Materials", taxId: "TX-30188", email: "ap@buildright.com", phone: "+1 (213) 555-0166", status: "ACTIVE", totalDocuments: 24, exceptionRate: 8.3 },
  { id: "v5", code: "POS-005", name: "Prime Office Solutions", taxId: "TX-55291", email: "invoices@primeoffice.com", phone: "+1 (702) 555-0119", status: "ON_HOLD", totalDocuments: 13, exceptionRate: 15.4 },
];
