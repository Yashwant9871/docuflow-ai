import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  processDocument,
  updateDocumentStatus,
  approveDocument,
  rejectDocument,
  exportDocument,
  correctField,
  runValidation,
  completeReview
} from "@/services/documentService";
import type { DocumentStatus } from "@/mock/types";

export function useDocumentsQuery() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
  });
}

export function useDocumentByIdQuery(id: string) {
  return useQuery({
    queryKey: ["document", id],
    queryFn: () => getDocumentById(id),
    enabled: !!id,
  });
}

export function useUploadDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => uploadDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useProcessDocumentMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => processDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useApproveDocumentMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comments: string = "") => approveDocument(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRejectDocumentMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comments: string = "") => rejectDocument(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useExportDocumentMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => exportDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateDocumentStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: DocumentStatus) => updateDocumentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCorrectFieldMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fieldName, value }: { fieldName: string; value: string }) => correctField(id, fieldName, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useRunValidationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runValidation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });
}

export function useCompleteReviewMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notes: string = "") => completeReview(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
