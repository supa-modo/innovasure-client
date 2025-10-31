import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import { FiPhone, FiHash } from "react-icons/fi";
import { MemberWithStatus } from "../services/dashboardService";
import { TbUpload, TbFile, TbTrash, TbDownload } from "react-icons/tb";
import DocumentViewer from "./shared/DocumentViewer";
import DocumentUploadModal from "./ui/DocumentUploadModal";
import NotificationModal from "./ui/NotificationModal";
import { listDocuments, uploadDocument as uploadDocApi, getDocumentBlobUrl, downloadDocumentBlob, deleteDocument as deleteDoc } from "../services/documentsService";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberWithStatus | null;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  if (!member) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "due_today":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [docs, setDocs] = React.useState<any[]>([]);
  const [docsLoading, setDocsLoading] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);
  const [viewer, setViewer] = React.useState<{ open: boolean; url: string; filename: string; type: "pdf" | "image" | "unknown" }>({ open: false, url: "", filename: "", type: "unknown" });
  const [notification, setNotification] = React.useState({
    isOpen: false,
    type: "info" as "info" | "success" | "error" | "warning" | "confirm" | "delete",
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  React.useEffect(() => {
    const fetchDocs = async () => {
      if (!member) return;
      setDocsLoading(true);
      try {
        const data = await listDocuments("member", member.id);
        setDocs(data);
      } finally {
        setDocsLoading(false);
      }
    };
    fetchDocs();
  }, [member?.id]);

  const handleUpload = async (file: File, type: string) => {
    const newDoc = await uploadDocApi("member", member.id, file, type);
    setDocs((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const openViewer = async (doc: any) => {
    const blobUrl = await getDocumentBlobUrl(doc.id);
    const ext = (doc.file_name?.split(".").pop() || "").toLowerCase();
    const isImg = ["jpg", "jpeg", "png"].includes(ext);
    const isPdf = ext === "pdf";
    setViewer({ open: true, url: blobUrl, filename: doc.file_name, type: isImg ? "image" : isPdf ? "pdf" : "unknown" });
  };

  const download = async (doc: any) => {
    await downloadDocumentBlob(doc.id, doc.file_name);
  };

  const removeDoc = async (doc: any) => {
    await deleteDoc(doc.id);
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const handleDeleteDoc = (doc: any) => {
    setNotification({
      isOpen: true,
      type: "delete",
      title: "Delete Document",
      message: `Are you sure you want to delete "${doc.file_name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await removeDoc(doc);
          setNotification({
            isOpen: true,
            type: "success",
            title: "Document Deleted",
            message: "Document has been deleted successfully.",
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-linear-to-br from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Member Details
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Account: {member.account_number}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/20"
                    title="Close"
                  >
                    <FaXmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${getStatusColor(
                      member.paymentStatus
                    )}`}
                  >
                    {member.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h3 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-3">
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="pb-2 border-b border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Full Name</p>
                        <p className="text-sm font-semibold text-blue-900">
                          {member.full_name}
                        </p>
                      </div>
                      <div className="pb-2 border-b border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                        <div className="flex items-center gap-2">
                          <FiPhone className="w-4 h-4 text-blue-400" />
                          <p className="text-sm font-semibold text-blue-900">
                            {member.phone}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Account Number</p>
                        <div className="flex items-center gap-2">
                          <FiHash className="w-4 h-4 text-blue-400" />
                          <p className="text-sm font-mono font-semibold text-blue-900">
                            {member.account_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  {member.subscription && (
                    <div className="p-4 bg-linear-to-br from-emerald-50 to-white rounded-xl border border-emerald-100">
                      <h3 className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-3">
                        Subscription Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Plan Name</p>
                          <p className="text-sm font-semibold text-emerald-900">
                            {member.subscription.plan?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Premium Amount</p>
                          <p className="text-sm font-semibold text-emerald-900">
                            KSh{" "}
                            {member.subscription.plan?.premium_amount?.toLocaleString()}
                            /{member.subscription.plan?.premium_frequency || "period"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Next Due Date</p>
                          <p className="text-sm font-semibold text-emerald-900">
                            {formatDate(member.subscription.next_due_date)}
                          </p>
                        </div>
                        {member.subscription.last_payment_date && (
                          <div className="pt-2 border-t border-emerald-100">
                            <p className="text-xs text-gray-500 mb-1">Last Payment</p>
                            <p className="text-sm font-semibold text-emerald-900">
                              {formatDate(member.subscription.last_payment_date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* KYC Status */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                      KYC Status
                    </h3>
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                        member.kyc_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : member.kyc_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {member.kyc_status}
                    </span>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Documents</h3>
                    <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-white bg-blue-600 hover:bg-blue-700">
                      <TbUpload className="w-4 h-4" /> Upload
                    </button>
                  </div>
                  {docsLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : docs.length > 0 ? (
                    <div className="space-y-2">
                      {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <TbFile className="w-5 h-5 text-blue-600" />
                            <p className="text-sm text-gray-900 truncate">{doc.file_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openViewer(doc)} className="px-2 py-1 border border-gray-300 rounded-md text-xs">View</button>
                            <button onClick={() => download(doc)} className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs"><TbDownload className="mr-1"/>Download</button>
                            <button onClick={() => handleDeleteDoc(doc)} className="inline-flex items-center px-2 py-1 border border-red-300 rounded-md text-xs text-red-700"><TbTrash className="mr-1"/>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No documents uploaded</div>
                  )}
                </div>

                {viewer.open && (
                  <DocumentViewer
                    url={viewer.url}
                    filename={viewer.filename}
                    fileType={viewer.type}
                    onClose={() => {
                      // Clean up blob URL to prevent memory leaks
                      if (viewer.url.startsWith("blob:")) {
                        URL.revokeObjectURL(viewer.url);
                      }
                      setViewer({ open: false, url: "", filename: "", type: "unknown" });
                    }}
                  />
                )}
                <DocumentUploadModal
                  showUploadModal={showUpload}
                  setShowUploadModal={setShowUpload}
                  onDocumentUploaded={(d) => setDocs((prev) => [d, ...prev])}
                  onUpload={handleUpload}
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
      
      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        showCancel={notification.type === "confirm" || notification.type === "delete"}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </AnimatePresence>
  );
};

export default MemberDetailModal;

