/**
 * Member Details Modal
 * Comprehensive member management with tabs
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiEdit,
  FiSave,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import DocumentViewer from "../shared/DocumentViewer";
import FileUpload from "../shared/FileUpload";
import NotificationModal from "../ui/NotificationModal";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  updateMember,
  updateKYCStatus,
} from "../../services/membersService";
import { Member } from "../../services/membersService";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onUpdate?: () => void;
}

const MemberModal = ({
  isOpen,
  onClose,
  member,
  onUpdate,
}: MemberModalProps) => {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
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

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    date_of_birth: "",
    gender: "",
    id_number: "",
    kra_pin: "",
    next_of_kin: "",
  });

  useEffect(() => {
    if (member) {
      setFormData({
        full_name: member.full_name || "",
        phone: member.phone || "",
        address: member.address || "",
        date_of_birth: member.date_of_birth || "",
        gender: member.gender || "",
        id_number: member.id_number_encrypted || "",
        kra_pin: member.kra_pin_encrypted || "",
        next_of_kin:
          typeof member.next_of_kin === "string"
            ? member.next_of_kin
            : JSON.stringify(member.next_of_kin) || "",
      });
      loadDocuments();
    }
  }, [member]);

  const loadDocuments = async () => {
    if (!member) return;
    try {
      const docs = await getDocuments(member.id);
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
    }
  };

  const handleSave = async () => {
    if (!member) return;

    setLoading(true);
    try {
      await updateMember(member.id, formData);
      setIsEditing(false);
      setNotification({
        isOpen: true,
        type: "success",
        title: "Profile Updated",
        message: "Member profile has been updated successfully.",
        onConfirm: undefined,
      });
      onUpdate?.();
    } catch (err: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message:
          err.response?.data?.error || "Failed to update member profile.",
        onConfirm: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKYCAction = async (
    action: "approved" | "rejected" | "flagged"
  ) => {
    if (!member) return;

    setNotification({
      isOpen: true,
      type: action === "approved" ? "confirm" : "warning",
      title:
        action === "approved"
          ? "Approve KYC"
          : action === "rejected"
            ? "Reject KYC"
            : "Flag KYC",
      message:
        action === "approved"
          ? "Are you sure you want to approve this member's KYC?"
          : action === "rejected"
            ? "Please provide a reason for rejection."
            : "Please provide a reason for flagging.",
      onConfirm: async () => {
        try {
          await updateKYCStatus(member.id, action);
          setNotification({
            isOpen: true,
            type: "success",
            title: "KYC Updated",
            message: `Member KYC has been ${action} successfully.`,
            onConfirm: undefined,
          });
          onUpdate?.();
        } catch (err: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Update Failed",
            message:
              err.response?.data?.error || "Failed to update KYC status.",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handleUpload = async (files: File[]) => {
    if (!member) return;

    try {
      for (const file of files) {
        await uploadDocument(member.id, file);
      }
      await loadDocuments();
      setNotification({
        isOpen: true,
        type: "success",
        title: "Upload Successful",
        message: `${files.length} document(s) uploaded successfully.`,
        onConfirm: undefined,
      });
    } catch (err: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Upload Failed",
        message: err.response?.data?.error || "Failed to upload documents.",
        onConfirm: undefined,
      });
    }
  };

  const handleDeleteDocument = (key: string) => {
    if (!member) return;

    setNotification({
      isOpen: true,
      type: "delete",
      title: "Delete Document",
      message: "Are you sure you want to delete this document?",
      onConfirm: async () => {
        try {
          await deleteDocument(member.id, key);
          await loadDocuments();
          setNotification({
            isOpen: true,
            type: "success",
            title: "Document Deleted",
            message: "Document has been deleted successfully.",
            onConfirm: undefined,
          });
        } catch (err: any) {
          setNotification({
            isOpen: true,
            type: "error",
            title: "Delete Failed",
            message: err.response?.data?.error || "Failed to delete document.",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const getKYCBadge = (status: string) => {
    const badges: Record<string, { icon: any; color: string; text: string }> = {
      pending: {
        icon: FiEdit,
        color: "bg-yellow-100 text-yellow-800",
        text: "Pending",
      },
      under_review: {
        icon: FiAlertCircle,
        color: "bg-blue-100 text-blue-800",
        text: "Under Review",
      },
      approved: {
        icon: FiCheckCircle,
        color: "bg-green-100 text-green-800",
        text: "Approved",
      },
      rejected: {
        icon: FiXCircle,
        color: "bg-red-100 text-red-800",
        text: "Rejected",
      },
      flagged: {
        icon: FiAlertCircle,
        color: "bg-orange-100 text-orange-800",
        text: "Flagged",
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}
      >
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  if (!isOpen || !member) return null;

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "subscription", label: "Subscription" },
    { id: "dependants", label: "Dependants" },
    { id: "documents", label: "Documents" },
    { id: "activity", label: "Activity" },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[5px] flex items-center justify-center z-100000 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {member.full_name}
                    </h2>
                    <p className="text-blue-100 font-mono text-sm">
                      {member.account_number}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white hover:text-gray-200 transition-colors p-1"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  {getKYCBadge(member.kyc_status)}
                  <span className="text-sm text-blue-100">
                    Joined {new Date(member.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex gap-1 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab.id
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Basic Information
                        </h3>
                        {!isEditing ? (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                          >
                            <FiEdit className="w-4 h-4" />
                            Edit
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              disabled={loading}
                              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                              <FiSave className="w-4 h-4" />
                              Save
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.full_name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  full_name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900">{member.full_name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900">{member.phone}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                          </label>
                          {isEditing ? (
                            <select
                              value={formData.gender}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  gender: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select...</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          ) : (
                            <p className="text-gray-900">
                              {member.gender || "-"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth
                          </label>
                          {isEditing ? (
                            <input
                              type="date"
                              value={formData.date_of_birth}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  date_of_birth: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900">
                              {member.date_of_birth
                                ? new Date(
                                    member.date_of_birth
                                  ).toLocaleDateString()
                                : "-"}
                            </p>
                          )}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          {isEditing ? (
                            <textarea
                              value={formData.address}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  address: e.target.value,
                                })
                              }
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900">{member.address}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* KYC Management */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        KYC Management
                      </h3>
                      <div className="flex items-center gap-3">
                        {getKYCBadge(member.kyc_status)}
                        {member.kyc_status !== "approved" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleKYCAction("approved")}
                              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleKYCAction("rejected")}
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <FiXCircle className="w-4 h-4" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleKYCAction("flagged")}
                              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                            >
                              <FiAlertCircle className="w-4 h-4" />
                              Flag
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Agent Info */}
                    {member.agent && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Agent Information
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Agent</p>
                          <p className="font-medium text-gray-900">
                            {member.agent.user?.profile?.full_name || "N/A"} (
                            {member.agent.code})
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "subscription" && (
                  <div className="space-y-6">
                    {member.subscription ? (
                      <div
                        key={member.subscription.id}
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {member.subscription.plan?.name || "No Plan"}
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <p className="text-sm text-gray-600">
                              Premium Amount
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              KSh{" "}
                              {member.subscription.plan?.premium_amount?.toLocaleString() ||
                                "0"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Next Due Date
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                              {member.subscription.next_due_date
                                ? new Date(
                                    member.subscription.next_due_date
                                  ).toLocaleDateString()
                                : "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No active subscription
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "dependants" && (
                  <div className="space-y-4">
                    {member.dependants && member.dependants.length > 0 ? (
                      member.dependants.map((dep: any) => (
                        <div
                          key={dep.id}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {dep.full_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {dep.relationship}
                              </p>
                            </div>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No dependants
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-6">
                    <FileUpload onUpload={handleUpload} />
                    <div className="space-y-3">
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FiEdit className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {doc.filename}
                              </p>
                              <p className="text-sm text-gray-500">
                                Uploaded{" "}
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                setViewingDocument({
                                  url: doc.url,
                                  filename: doc.filename,
                                  type: doc.filename.includes(".pdf")
                                    ? "pdf"
                                    : "image",
                                })
                              }
                              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.key)}
                              className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="space-y-4">
                    <p className="text-gray-500 text-center py-8">
                      Activity log coming soon
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default MemberModal;
