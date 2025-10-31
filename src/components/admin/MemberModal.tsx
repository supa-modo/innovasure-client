/**
 * MemberModal - Redesigned with vertical tabs and clean UI
 * Comprehensive member management with inline editing
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import { PiUserDuotone, PiUsersDuotone } from "react-icons/pi";
import { FiTrash2, FiCreditCard, FiLock } from "react-icons/fi";
import { TbUserStar, TbUpload, TbFile, TbTrash, TbDownload } from "react-icons/tb";

import HorizontalTabs from "../shared/HorizontalTabs";
import EditableField from "../shared/EditableField";
import SecuritySection from "../shared/SecuritySection";
import NotificationModal from "../ui/NotificationModal";
import DocumentViewer from "../shared/DocumentViewer";
import DocumentUploadModal from "../ui/DocumentUploadModal";

import { Member } from "../../services/membersService";
import {
  updateMember,
  updateKYCStatus,
} from "../../services/membersService";
import { getMemberPaymentHistory } from "../../services/paymentService";
import {
  listDocuments,
  uploadDocument as uploadDocApi,
  getDocumentBlobUrl,
  downloadDocumentBlob,
  deleteDocument as deleteDoc,
} from "../../services/documentsService";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onUpdate?: () => void;
}

const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [docs, setDocs] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [showUploadDocs, setShowUploadDocs] = useState(false);
  const [viewer, setViewer] = useState<{
    open: boolean;
    url: string;
    filename: string;
    type: "pdf" | "image" | "unknown";
  }>({ open: false, url: "", filename: "", type: "unknown" });

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

  const tabs = [
    { id: "personal", label: "Personal Info", icon: <PiUserDuotone /> },
    { id: "subscription", label: "Subscription", icon: <FiCreditCard /> },
    { id: "dependants", label: "Dependants", icon: <PiUsersDuotone /> },
    { id: "security", label: "Security", icon: <FiLock /> },
  ];

  // Load member data when modal opens
  useEffect(() => {
    if (isOpen && member) {
      loadMemberData();
    }
  }, [isOpen, member]);

  const loadMemberData = async () => {
    if (!member) return;

    try {
      // Load payment history
      await loadPaymentHistory();
    } catch (error) {
      console.error("Error loading member data:", error);
    }
  };

  useEffect(() => {
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
    if (isOpen && member) fetchDocs();
  }, [isOpen, member?.id]);

  const loadPaymentHistory = async () => {
    if (!member) return;

    try {
      const history = await getMemberPaymentHistory(member.id);
      setPaymentHistory(history.payments || []);
    } catch (error) {
      console.error("Error loading payment history:", error);
    }
  };

  const handleFieldUpdate = async (field: string, value: string | number) => {
    if (!member) return;

    try {
      await updateMember(member.id, { [field]: value });
      onUpdate?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleUploadDoc = async (file: File, type: string) => {
    const newDoc = await uploadDocApi("member", member!.id, file, type);
    setDocs((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const openViewer = async (doc: any) => {
    const blobUrl = await getDocumentBlobUrl(doc.id);
    const ext = (doc.file_name?.split(".").pop() || "").toLowerCase();
    const isImg = ["jpg", "jpeg", "png"].includes(ext);
    const isPdf = ext === "pdf";
    setViewer({
      open: true,
      url: blobUrl,
      filename: doc.file_name,
      type: isImg ? "image" : isPdf ? "pdf" : "unknown",
    });
  };

  const downloadDoc = async (doc: any) => {
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

  const handlePasswordReset = async (_userId: string) => {
    // This would need to be implemented in the backend
    // For now, we'll show a placeholder
    throw new Error("Password reset not implemented yet");
  };

  const handleStatusToggle = async (_userId: string, _newStatus: string) => {
    // This would need to be implemented in the backend
    // For now, we'll show a placeholder
    throw new Error("Status toggle not implemented yet");
  };

  const handleKYCUpdate = async (_userId: string, status: string, reason?: string) => {
    if (!member) return;

    try {
      await updateKYCStatus(member.id, status, reason);
      onUpdate?.();
      
      setNotification({
        isOpen: true,
        type: "success",
        title: "KYC Updated",
        message: `KYC status has been updated to ${status} successfully.`,
        onConfirm: undefined,
      });
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: error.response?.data?.error || "Failed to update KYC status",
        onConfirm: undefined,
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPhoneNumber = (value: string | number) => {
    const phone = String(value);
    if (!phone) return "";
    return phone.startsWith("+254") ? phone : `+254${phone}`;
  };

  const formatDate = (value: string | number) => {
    const dateString = String(value);
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen || !member) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] flex items-start justify-end z-50 p-3 font-lexend"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-[900px] h-[calc(100vh-20px)] bg-white shadow-2xl overflow-hidden rounded-3xl border border-gray-200"
            >
              {/* Header */}
              <div className="px-6 py-4 relative border-b border-gray-200">
                <div className="relative flex justify-between items-center z-10">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <PiUserDuotone size={32} className="text-blue-600 " />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {member.full_name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {member.account_number}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-100"
                    title="Close"
                  >
                    <FaXmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Horizontal Tabs */}
              <HorizontalTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Content */}
              <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-130px)]">
                <div className="overflow-y-auto flex-1">
                  <div className="p-6">
                    {activeTab === "personal" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Personal Information
                        </h3>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EditableField
                            label="Full Name"
                            value={member.full_name}
                            onSave={(value) =>
                              handleFieldUpdate("full_name", value)
                            }
                            required
                          />
                          <EditableField
                            label="Phone Number"
                            value={member.phone}
                            type="tel"
                            onSave={(value) =>
                              handleFieldUpdate("phone", value)
                            }
                            format={formatPhoneNumber}
                            required
                          />
                          <EditableField
                            label="Email Address"
                            value={member.user?.email || ""}
                            type="email"
                            onSave={(value) =>
                              handleFieldUpdate("email", value)
                            }
                          />
                          <EditableField
                            label="ID Number"
                            value={member.id_number_encrypted || ""}
                            onSave={(value) =>
                              handleFieldUpdate("id_number_encrypted", value)
                            }
                            required
                          />
                          <EditableField
                            label="KRA PIN"
                            value={member.kra_pin_encrypted || ""}
                            onSave={(value) =>
                              handleFieldUpdate("kra_pin_encrypted", value)
                            }
                          />
                          <EditableField
                            label="Date of Birth"
                            value={member.date_of_birth || ""}
                            type="date"
                            onSave={(value) =>
                              handleFieldUpdate("date_of_birth", value)
                            }
                            format={formatDate}
                          />
                          <EditableField
                            label="Gender"
                            value={member.gender || ""}
                            onSave={(value) =>
                              handleFieldUpdate("gender", value)
                            }
                          />
                        </div>

                        {/* Address and Next of Kin */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EditableField
                            label="Address"
                            value={member.address}
                            type="textarea"
                            onSave={(value) =>
                              handleFieldUpdate("address", value)
                            }
                            required
                          />
                          <EditableField
                            label="Next of Kin"
                            value={
                              typeof member.next_of_kin === "string"
                                ? member.next_of_kin
                                : JSON.stringify(member.next_of_kin || {})
                            }
                            type="textarea"
                            onSave={(value) =>
                              handleFieldUpdate("next_of_kin", value)
                            }
                            required
                          />
                        </div>

                        {/* Agent Assignment */}
                        {member.agent && (
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                              <TbUserStar className="w-5 h-5 mr-2 text-blue-600" />
                              Assigned Agent
                            </h4>
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Agent Name
                                  </label>
                                  <div className="px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200">
                                    {member.agent?.full_name ||
                                      "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Agent Code
                                  </label>
                                  <div className="px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200 font-mono">
                                    {member.agent.code}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Agent Phone
                                  </label>
                                  <div className="px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200">
                                    {member.agent.user?.phone || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Documents Section */}
                        <div className="border-t border-gray-200 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                              <TbFile className="w-5 h-5 mr-2 text-blue-600" />
                              Documents
                            </h4>
                            <button
                              onClick={() => setShowUploadDocs(true)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm hover:shadow-md transition-all"
                            >
                              <TbUpload className="w-4 h-4" /> Upload Document
                            </button>
                          </div>
                          {docsLoading ? (
                            <div className="text-sm text-gray-500">Loading...</div>
                          ) : docs.length > 0 ? (
                            <div className="space-y-2">
                              {docs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 hover:shadow-sm transition-all"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                      <TbFile className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {doc.file_name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {doc.document_type || "Document"}
                                      </p>
                                    </div>
                                    {doc.verified && (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openViewer(doc)}
                                      className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => downloadDoc(doc)}
                                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
                                    >
                                      <TbDownload className="w-3.5 h-3.5 mr-1" />
                                      Download
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDoc(doc)}
                                      className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                                    >
                                      <TbTrash className="w-3.5 h-3.5 mr-1" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                              <TbFile className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                              <p className="text-sm text-gray-500">No documents uploaded</p>
                            </div>
                          )}
                        </div>

                        {viewer.open && (
                          <DocumentViewer
                            url={viewer.url}
                            filename={viewer.filename}
                            fileType={viewer.type}
                            onClose={() => {
                              if (viewer.url.startsWith("blob:")) {
                                URL.revokeObjectURL(viewer.url);
                              }
                              setViewer({
                                open: false,
                                url: "",
                                filename: "",
                                type: "unknown",
                              });
                            }}
                          />
                        )}
                        <DocumentUploadModal
                          showUploadModal={showUploadDocs}
                          setShowUploadModal={setShowUploadDocs}
                          onDocumentUploaded={(d) => setDocs((prev) => [d, ...prev])}
                          onUpload={handleUploadDoc}
                        />
                      </div>
                    )}

                    {activeTab === "subscription" && (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <FiCreditCard className="w-5 h-5 text-purple-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Subscription Details
                          </h3>
                        </div>

                        {member.subscription ? (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <h4 className="text-xl font-bold text-gray-900 mb-4">
                              {member.subscription.plan?.name || "No Plan"}
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  Premium Amount
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  KSh{" "}
                                  {member.subscription.plan?.premium_amount?.toLocaleString() ||
                                    "0"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  Coverage Amount
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                  KSh{" "}
                                  {member.subscription.plan?.coverage_amount?.toLocaleString() ||
                                    "0"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  Frequency
                                </p>
                                <p className="text-lg font-semibold text-gray-900 capitalize">
                                  {member.subscription.plan
                                    ?.premium_frequency || "N/A"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600 mb-1">
                                  Next Due Date
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {member.subscription.next_due_date
                                    ? formatDate(
                                        member.subscription.next_due_date
                                      )
                                    : "Not set"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <FiCreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No active subscription</p>
                          </div>
                        )}

                        {/* Payment History */}
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-md font-semibold text-gray-900 mb-4">
                            Payment History
                          </h4>
                          {paymentHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-gray-700">
                                      Date
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Amount
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Method
                                    </th>
                                    <th className="text-left py-2 text-gray-700">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paymentHistory.map((payment, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-100"
                                    >
                                      <td className="py-2 text-gray-900">
                                        {formatDate(payment.received_at)}
                                      </td>
                                      <td className="py-2 text-gray-900">
                                        KSh {payment.amount.toLocaleString()}
                                      </td>
                                      <td className="py-2 text-gray-900 capitalize">
                                        {payment.provider}
                                      </td>
                                      <td className="py-2">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            payment.status === "allocated"
                                              ? "bg-green-100 text-green-800 "
                                              : payment.status === "matched"
                                                ? "bg-blue-100 text-blue-800 "
                                                : payment.status === "pending"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800 "
                                          }`}
                                        >
                                          {payment.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <FiCreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                              <p>No payment history found</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "dependants" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dependants
                        </h3>

                        {member.dependants && member.dependants.length > 0 ? (
                          <div className="space-y-4">
                            {member.dependants.map(
                              (dependant: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {dependant.full_name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        {dependant.relationship}
                                      </p>
                                      {dependant.date_of_birth && (
                                        <p className="text-xs text-gray-500 ">
                                          DOB:{" "}
                                          {formatDate(dependant.date_of_birth)}
                                        </p>
                                      )}
                                    </div>
                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                      <FiTrash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <PiUsersDuotone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No dependants registered</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "security" && (
                      <SecuritySection
                        userType="member"
                        userId={member.user?.id || member.id}
                        userStatus={member.user?.status || "active"}
                        kycStatus={member.kyc_status}
                        onPasswordReset={handlePasswordReset}
                        onStatusToggle={handleStatusToggle}
                        onKYCUpdate={handleKYCUpdate}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-white px-6 py-4 flex-shrink-0">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Close
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
        showCancel={notification.type === "confirm" || notification.type === "delete"}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </>
  );
};

export default MemberModal;
