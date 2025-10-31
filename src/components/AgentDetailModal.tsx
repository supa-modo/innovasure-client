import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import { FiPhone, FiUser, FiTrendingUp } from "react-icons/fi";
import { AgentPerformance } from "../services/dashboardService";
import { TbUpload, TbFile, TbTrash, TbDownload } from "react-icons/tb";
import DocumentViewer from "./shared/DocumentViewer";
import DocumentUploadModal from "./ui/DocumentUploadModal";
import { listDocuments, uploadDocument as uploadDocApi, getDocumentBlobUrl, downloadDocumentBlob, deleteDocument as deleteDoc } from "../services/documentsService";

interface AgentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentPerformance | null;
}

const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  isOpen,
  onClose,
  agent,
}) => {
  if (!agent) return null;

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return "bg-green-100 text-green-800";
    if (rate >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const [docs, setDocs] = React.useState<any[]>([]);
  const [docsLoading, setDocsLoading] = React.useState(false);
  const [showUpload, setShowUpload] = React.useState(false);
  const [viewer, setViewer] = React.useState<{ open: boolean; url: string; filename: string; type: "pdf" | "image" | "unknown" }>({ open: false, url: "", filename: "", type: "unknown" });

  React.useEffect(() => {
    const fetchDocs = async () => {
      if (!agent) return;
      setDocsLoading(true);
      try {
        const data = await listDocuments("agent", agent.id);
        setDocs(data);
      } finally {
        setDocsLoading(false);
      }
    };
    fetchDocs();
  }, [agent?.id]);

  const handleUpload = async (file: File, type: string) => {
    const newDoc = await uploadDocApi("agent", agent.id, file, type);
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
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Agent Details
                    </h2>
                    <p className="text-purple-100 text-sm font-mono">
                      {agent.code}
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
              <div className="p-6 space-y-5">
                {/* Performance Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getComplianceColor(
                      agent.complianceRate
                    )}`}
                  >
                    {agent.complianceRate}% Compliance
                  </span>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      Agent Information
                    </h3>
                    <div className="space-y-3 pl-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Agent Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Phone Number
                        </p>
                        <div className="flex items-center gap-2">
                          <FiPhone className="w-4 h-4 text-gray-400" />
                          <p className="text-sm font-medium text-gray-900">
                            {agent.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <FiTrendingUp className="w-4 h-4" />
                      Performance Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pl-6">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Members</p>
                        <p className="text-lg font-bold text-blue-900">
                          {agent.memberCount}
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-xs text-gray-500 mb-1">
                          Active Subs
                        </p>
                        <p className="text-lg font-bold text-green-900">
                          {agent.activeSubscriptions}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pl-6">
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-xs text-gray-500 mb-1">
                          Commission Balance
                        </p>
                        <p className="text-lg font-bold text-purple-900">
                          {formatCurrency(agent.commissionBalance)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Documents</h3>
                    <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-white bg-purple-600 hover:bg-purple-700">
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
                            <TbFile className="w-5 h-5 text-purple-600" />
                            <p className="text-sm text-gray-900 truncate">{doc.file_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openViewer(doc)} className="px-2 py-1 border border-gray-300 rounded-md text-xs">View</button>
                            <button onClick={() => download(doc)} className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs"><TbDownload className="mr-1"/>Download</button>
                            <button onClick={() => removeDoc(doc)} className="inline-flex items-center px-2 py-1 border border-red-300 rounded-md text-xs text-red-700"><TbTrash className="mr-1"/>Delete</button>
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
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AgentDetailModal;






