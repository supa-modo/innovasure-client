/**
 * KYC Review Modal
 * Dedicated KYC review interface with document viewer
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFileText,
  FiImage,
  FiDownload,
} from "react-icons/fi";
import NotificationModal from "../ui/NotificationModal";
import { KYCQueueItem } from "../../services/kycService";
import { approveKYC, rejectKYC, flagKYC } from "../../services/kycService";

interface KYCReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  kycItem: KYCQueueItem | null;
  onUpdate?: () => void;
}

const KYCReviewModal = ({
  isOpen,
  onClose,
  kycItem,
  onUpdate,
}: KYCReviewModalProps) => {
  const [kycNotes, setKycNotes] = useState("");
  const [checklist, setChecklist] = useState({
    idFront: false,
    idBack: false,
    proofOfAddress: false,
    additional: false,
  });

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

  useEffect(() => {
    if (kycItem) {
      setKycNotes(kycItem.kyc_notes || "");
    }
  }, [kycItem]);

  const handleApprove = () => {
    if (!kycItem) return;

    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Approve KYC",
      message: "Are you sure you want to approve this KYC application?",
      onConfirm: async () => {
        try {
          await approveKYC(kycItem.entityType, kycItem.id);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Approved",
            message: "KYC has been approved successfully.",
            onConfirm: undefined,
          });
          onUpdate?.();
          setTimeout(() => onClose(), 1500);
        } catch (err: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Approval Failed",
            message: err.response?.data?.error || "Failed to approve KYC.",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleReject = () => {
    if (!kycItem) return;

    if (!kycNotes.trim()) {
      setNotification({
        isOpen: true,
        type: "warning",
        title: "Reason Required",
        message: "Please provide a reason for rejection before proceeding.",
        onConfirm: undefined,
      });
      return;
    }

    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Reject KYC",
      message: "Are you sure you want to reject this KYC application?",
      onConfirm: async () => {
        try {
          await rejectKYC(kycItem.entityType, kycItem.id, kycNotes);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Rejected",
            message: "KYC has been rejected successfully.",
            onConfirm: undefined,
          });
          onUpdate?.();
          setTimeout(() => onClose(), 1500);
        } catch (err: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Rejection Failed",
            message: err.response?.data?.error || "Failed to reject KYC.",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleFlag = () => {
    if (!kycItem) return;

    if (!kycNotes.trim()) {
      setNotification({
        isOpen: true,
        type: "warning",
        title: "Reason Required",
        message: "Please provide a reason for flagging before proceeding.",
        onConfirm: undefined,
      });
      return;
    }

    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Flag KYC",
      message: "Are you sure you want to flag this KYC for review?",
      onConfirm: async () => {
        try {
          await flagKYC(kycItem.entityType, kycItem.id, kycNotes);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Flagged",
            message: "KYC has been flagged for review successfully.",
            onConfirm: undefined,
          });
          onUpdate?.();
          setTimeout(() => onClose(), 1500);
        } catch (err: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Flag Failed",
            message: err.response?.data?.error || "Failed to flag KYC.",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleDocumentView = (doc: any) => {
    window.open(doc.url, "_blank");
  };

  const getEntityBadge = (type: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      member: { color: "bg-blue-100 text-blue-800", text: "Member" },
      agent: { color: "bg-green-100 text-green-800", text: "Agent" },
      super_agent: {
        color: "bg-purple-100 text-purple-800",
        text: "Super Agent",
      },
    };

    const badge = badges[type] || badges.member;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  if (!isOpen || !kycItem) return null;

  const documents = kycItem.kyc_documents || [];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] flex items-start justify-end z-50 p-3 font-lexend"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-[65%] h-[calc(100vh-20px)] bg-white shadow-2xl overflow-hidden rounded-3xl border border-gray-200 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">KYC Review</h2>
                  <p className="text-sm text-gray-600">
                    Reviewing documents for{" "}
                    {kycItem.full_name ||
                      (kycItem.entityType === "member" ? kycItem.user?.profile?.full_name : "") ||
                      "Applicant"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-2 hover:bg-gray-100"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6 py-5">
                  {/* Left Panel - Documents (60%) */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Uploaded Documents
                      </h3>
                      {documents.length > 0 ? (
                        <div className="space-y-3">
                          {documents.map((doc: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  {doc.filename.includes(".pdf") ? (
                                    <FiFileText className="w-5 h-5 text-blue-600" />
                                  ) : (
                                    <FiImage className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {doc.filename}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Uploaded{" "}
                                    {new Date(
                                      doc.uploaded_at
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDocumentView(doc)}
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                              >
                                <FiDownload className="w-4 h-4" />
                                View
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No documents uploaded
                        </p>
                      )}
                    </div>

                    {/* Document Checklist */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Document Checklist
                      </h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={checklist.idFront}
                            onChange={(e) =>
                              setChecklist({
                                ...checklist,
                                idFront: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-900">ID Card Front</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={checklist.idBack}
                            onChange={(e) =>
                              setChecklist({
                                ...checklist,
                                idBack: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-900">ID Card Back</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={checklist.proofOfAddress}
                            onChange={(e) =>
                              setChecklist({
                                ...checklist,
                                proofOfAddress: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-900">
                            Proof of Address
                          </span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={checklist.additional}
                            onChange={(e) =>
                              setChecklist({
                                ...checklist,
                                additional: e.target.checked,
                              })
                            }
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-gray-900">
                            Additional Documents
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Applicant Info (40%) */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Applicant Information
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Entity Type
                          </p>
                          {getEntityBadge(kycItem.entityType)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Full Name
                          </p>
                          <p className="font-medium text-gray-900">
                            {kycItem.full_name ||
                              (kycItem.entityType === "member" ? kycItem.user?.profile?.full_name : "") ||
                              "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Phone</p>
                          <p className="font-medium text-gray-900">
                            {kycItem.user?.phone || kycItem.phone || "-"}
                          </p>
                        </div>
                        {kycItem.user?.email && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Email</p>
                            <p className="font-medium text-gray-900">
                              {kycItem.user.email}
                            </p>
                          </div>
                        )}
                        {/* Entity-specific fields */}
                        {kycItem.entityType === "member" && kycItem.account_number && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Account Number
                            </p>
                            <p className="font-medium text-gray-900 font-mono">
                              {kycItem.account_number}
                            </p>
                          </div>
                        )}
                        {(kycItem.entityType === "agent" || kycItem.entityType === "super_agent") && kycItem.code && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              {kycItem.entityType === "agent" ? "Agent" : "Super-Agent"} Code
                            </p>
                            <p className="font-medium text-gray-900 font-mono">
                              {kycItem.code}
                            </p>
                          </div>
                        )}
                        {(kycItem.entityType === "agent" || kycItem.entityType === "super_agent") && kycItem.mpesa_phone && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              M-Pesa Phone
                            </p>
                            <p className="font-medium text-gray-900">
                              {kycItem.mpesa_phone}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Submission Date
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(kycItem.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Admin Notes
                      </h3>
                      <textarea
                        value={kycNotes}
                        onChange={(e) => setKycNotes(e.target.value)}
                        placeholder="Add notes or comments about this KYC review..."
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 bg-white px-6 py-4 shrink-0 flex items-center justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleFlag}
                    className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <FiAlertCircle className="w-4 h-4" />
                    Flag
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <FiXCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default KYCReviewModal;
