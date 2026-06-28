import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPurchaseOrders, createPurchaseOrder } from "@/services/purchaseOrderService";
import type { PurchaseOrder } from "@/mock/types";

export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: getPurchaseOrders,
  });
}

export function useCreatePurchaseOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PurchaseOrder>) => createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
  });
}
