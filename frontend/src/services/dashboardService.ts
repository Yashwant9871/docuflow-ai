import type { DashboardSummary } from "@/mock/types";
import { apiGet } from "./api";

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiGet<DashboardSummary>('/dashboard/summary');
}
