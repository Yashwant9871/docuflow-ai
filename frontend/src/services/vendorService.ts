import type { Vendor } from "@/mock/types";
import { apiGet, apiPost } from "./api";

export async function getVendors(): Promise<Vendor[]> {
  return apiGet<Vendor[]>('/vendors');
}

export async function createVendor(data: Partial<Vendor>): Promise<Vendor> {
  return apiPost<Vendor>('/vendors', data);
}
