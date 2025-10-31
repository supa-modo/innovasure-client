import api from "./api";

export type OwnerType = "member" | "agent" | "super_agent";

export interface DocumentItem {
  id: string;
  owner_type: OwnerType;
  owner_id: string;
  document_type: string;
  file_name: string;
  mime_type?: string;
  file_size_bytes?: number;
  uploaded_at?: string;
  verified: boolean;
}

export async function listDocuments(
  ownerType: OwnerType,
  ownerId: string
): Promise<DocumentItem[]> {
  const res = await api.get("/documents", {
    params: { owner_type: ownerType, owner_id: ownerId },
  });
  return res.data.documents || [];
}

export async function getDocumentUrl(documentId: string): Promise<string> {
  const res = await api.get(`/documents/${documentId}/url`);
  return res.data.url;
}

/**
 * Get document as blob URL (secure - no credentials exposed)
 * @param documentId - Document ID
 * @returns Blob URL for viewing/downloading
 */
export async function getDocumentBlobUrl(documentId: string): Promise<string> {
  const res = await api.get(`/documents/${documentId}/file`, {
    responseType: "blob",
  });

  // Create blob URL from response
  const blob = new Blob([res.data], {
    type: res.headers["content-type"] || "application/octet-stream",
  });
  return URL.createObjectURL(blob);
}

/**
 * Get document as blob for download (secure - no credentials exposed)
 * @param documentId - Document ID
 * @param filename - Filename for download
 * @returns Promise that resolves when download is triggered
 */
export async function downloadDocumentBlob(
  documentId: string,
  filename: string
): Promise<void> {
  const res = await api.get(`/documents/${documentId}/file`, {
    responseType: "blob",
  });

  // Create blob URL and trigger download
  const blob = new Blob([res.data], {
    type: res.headers["content-type"] || "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up blob URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export async function uploadDocument(
  ownerType: OwnerType,
  ownerId: string,
  file: File,
  documentType: string
): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("owner_type", ownerType);
  formData.append("owner_id", ownerId);
  formData.append("document_type", documentType);

  const res = await api.post("/documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.document;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await api.delete(`/documents/${documentId}`);
}

export async function verifyDocument(documentId: string): Promise<void> {
  await api.patch(`/documents/${documentId}/verify`);
}

export default {
  listDocuments,
  getDocumentUrl,
  getDocumentBlobUrl,
  downloadDocumentBlob,
  uploadDocument,
  deleteDocument,
  verifyDocument,
};
