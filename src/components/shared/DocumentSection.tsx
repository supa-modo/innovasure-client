/**
 * DocumentSection Component
 * Reusable document management section
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFileText, FiTrash2, FiDownload, FiEye } from "react-icons/fi";
import FileUpload from "./FileUpload";
import DocumentViewer from "./DocumentViewer";
import NotificationModal from "../ui/NotificationModal";

interface Document {
  key: string;
  filename: string;
  uploaded_at: string;
  url?: string;
}

interface DocumentSectionProps {
  documents: Document[];
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({
  documents,
  onUpload,
  onDelete,
  onRefresh,
  loading = false,
  className = "",
}) => {
  const [viewingDocument, setViewingDocument] = useState<{
    url: string;
    filename: string;
    type: "pdf" | "image" | "unknown";
  } | null>(null);

  const [notification, setNotification] = useState({
    isOpen: false,
    type: "info" as
      | "info"
      | "success"
      | "error"
      | "warning"
      | "confirm"
      | "delete",
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  const handleDocumentUpload = async (files: File[]) => {
    try {
      await onUpload(files);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Success",
        message: `${files.length} document(s) uploaded successfully`,
        onConfirm: undefined,
      });
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Upload Failed",
        message: error.response?.data?.error || "Failed to upload documents",
        onConfirm: undefined,
      });
    }
  };

  const handleDocumentDelete = (key: string) => {
    setNotification({
      isOpen: true,
      type: "delete",
      title: "Delete Document",
      message:
        "Are you sure you want to delete this document? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await onDelete(key);
          setNotification({
            isOpen: true,
            type: "success",
            title: "Success",
            message: "Document deleted successfully",
            onConfirm: undefined,
          });
        } catch (error: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Delete Failed",
            message: error.response?.data?.error || "Failed to delete document",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleViewDocument = (doc: Document) => {
    if (!doc.url) return;

    const fileExtension = doc.filename.split(".").pop()?.toLowerCase();
    let type: "pdf" | "image" | "unknown" = "unknown";

    if (fileExtension === "pdf") {
      type = "pdf";
    } else if (
      ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension || "")
    ) {
      type = "image";
    }

    setViewingDocument({
      url: doc.url,
      filename: doc.filename,
      type,
    });
  };

  const handleDownloadDocument = (doc: Document) => {
    if (!doc.url) return;

    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
      return <FiFileText className="w-5 h-5 text-red-500" />;
    } else if (
      ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")
    ) {
      return <FiFileText className="w-5 h-5 text-blue-500" />;
    } else if (["doc", "docx"].includes(extension || "")) {
      return <FiFileText className="w-5 h-5 text-blue-600" />;
    } else {
      return <FiFileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Documents
          </h3>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <FileUpload
            onUpload={handleDocumentUpload}
            acceptedTypes={[".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"]}
            maxSize={5 * 1024 * 1024}
            multiple={true}
          />
        </div>

        {/* Documents List */}
        {documents.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Documents ({documents.length})
            </h4>
            <AnimatePresence>
              {documents.map((doc, _index) => (
                <motion.div
                  key={doc.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(doc.filename)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {doc.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded{" "}
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {doc.url && (
                      <>
                        <button
                          onClick={() => handleViewDocument(doc)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Download"
                        >
                          <FiDownload className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDocumentDelete(doc.key)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiFileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Upload documents using the area above</p>
          </div>
        )}
      </div>

      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          url={viewingDocument.url}
          filename={viewingDocument.filename}
          fileType={viewingDocument.type}
          onClose={() => setViewingDocument(null)}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </>
  );
};

export default DocumentSection;
