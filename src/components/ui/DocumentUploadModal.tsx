import React, { useState } from "react";
import { FiX, FiUpload } from "react-icons/fi";

interface Props {
  showUploadModal: boolean;
  setShowUploadModal: (v: boolean) => void;
  onDocumentUploaded: (doc: any) => void;
  onUpload: (file: File, type: string) => Promise<any>;
}

const DocumentUploadModal: React.FC<Props> = ({ showUploadModal, setShowUploadModal, onDocumentUploaded, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("other");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  if (!showUploadModal) return null;

  const onSubmit = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }
    try {
      setSubmitting(true);
      const uploaded = await onUpload(file, documentType);
      onDocumentUploaded(uploaded);
      setShowUploadModal(false);
      setFile(null);
      setError("");
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Upload Document</h3>
          <button onClick={() => setShowUploadModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <FiX />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && <div className="text-red-600 text-xs">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Document Type</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="id_card">ID Card / Passport</option>
              <option value="passport">Passport</option>
              <option value="proof_of_address">Proof of Address</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">File</label>
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full" accept=".pdf,.jpg,.jpeg,.png" />
            <p className="text-[11px] text-gray-500 mt-1">Max 5MB. PDF, JPG, PNG</p>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-end gap-2">
          <button onClick={() => setShowUploadModal(false)} className="px-3 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
          <button onClick={onSubmit} disabled={submitting || !file} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            <FiUpload /> {submitting ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;

