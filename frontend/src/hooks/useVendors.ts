import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVendors, createVendor } from "@/services/vendorService";
import type { Vendor } from "@/mock/types";

export function useVendorsQuery() {
  return useQuery({
    queryKey: ["vendors"],
    queryFn: getVendors,
  });
}

export function useCreateVendorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Vendor>) => createVendor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}
