import type { Document, DocumentStatus } from "@/mock/types";
import { apiGet, apiPost, apiPatch } from "./api";

export async function getDocuments(): Promise<Document[]> {
  return apiGet<Document[]>('/documents');
}

export async function getDocumentById(id: string): Promise<Document | undefined> {
  try {
    return await apiGet<Document>(`/documents/${id}`);
  } catch {
    return undefined;
  }
}

export async function uploadDocument(data: FormData): Promise<{ id: string; number: string; status: string }> {
  return apiPost('/documents/upload', data);
}

export async function processDocument(id: string): Promise<Document> {
  return apiPost<Document>(`/documents/${id}/process`);
}

export async function updateDocumentStatus(id: string, status: DocumentStatus): Promise<void> {
  if (status === 'APPROVED') {
    await apiPost(`/documents/${id}/approve`, { comments: '' });
  } else if (status === 'REJECTED') {
    await apiPost(`/documents/${id}/reject`, { comments: '' });
  } else if (status === 'EXPORTED') {
    await apiPost(`/documents/${id}/export`);
  } else if (status === 'PROCESSING') {
    await apiPost(`/documents/${id}/process`);
  } else {
    await apiPatch(`/documents/${id}/fields`, { status });
  }
}

export async function approveDocument(id: string, comments: string = ''): Promise<Document> {
  return apiPost<Document>(`/documents/${id}/approve`, { comments });
}

export async function rejectDocument(id: string, comments: string = ''): Promise<Document> {
  return apiPost<Document>(`/documents/${id}/reject`, { comments });
}

export async function exportDocument(id: string): Promise<Document> {
  return apiPost<Document>(`/documents/${id}/export`);
}

export async function correctField(id: string, fieldName: string, value: string): Promise<Document> {
  return apiPatch<Document>(`/documents/${id}/fields/${fieldName}`, { value });
}

export async function runValidation(id: string): Promise<any> {
  return apiPost(`/documents/${id}/validate`);
}

export async function completeReview(id: string, notes: string = ""): Promise<Document> {
  return apiPost<Document>(`/documents/${id}/review/complete`, { notes });
}
