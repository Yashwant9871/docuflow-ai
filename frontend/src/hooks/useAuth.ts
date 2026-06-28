import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, logout, getCurrentUser, getDemoUsers } from "@/services/authService";

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
  });
}

export function useCurrentUserQuery(enabled: boolean = true) {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export { logout, getDemoUsers };
