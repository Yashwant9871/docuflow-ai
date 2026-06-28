import type { PurchaseOrder } from "@/mock/types";
import { apiGet, apiPost } from "./api";

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  return apiGet<PurchaseOrder[]>('/purchase-orders');
}

export async function createPurchaseOrder(data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  return apiPost<PurchaseOrder>('/purchase-orders', data);
}
