/**
 * AgentModal - Redesigned with vertical tabs and clean UI
 * Comprehensive agent management with inline editing
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import {
  PiUserDuotone,
  PiUsersDuotone,
  PiCurrencyDollarDuotone,
} from "react-icons/pi";
import { FiDollarSign, FiSettings } from "react-icons/fi";
import {
  TbUserStar,
  TbUpload,
  TbFile,
  TbTrash,
  TbDownload,
} from "react-icons/tb";

import HorizontalTabs from "../shared/HorizontalTabs";
import EditableField from "../shared/EditableField";
import SecuritySection from "../shared/SecuritySection";
import NotificationModal from "../ui/NotificationModal";
import DocumentViewer from "../shared/DocumentViewer";
import DocumentUploadModal from "../ui/DocumentUploadModal";

import { Agent } from "../../services/agentsService";
import {
  updateAgent,
  updateAgentKYC,
  toggleAgentStatus,
  resetAgentPassword,
  getAgentCommissionHistory,
} from "../../services/agentsService";
import { getMembersByAgent } from "../../services/membersService";
import {
  listDocuments,
  uploadDocument as uploadDocApi,
  getDocumentBlobUrl,
  downloadDocumentBlob,
  deleteDocument as deleteDoc,
} from "../../services/documentsService";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
  onUpdate?: () => void;
}

const AgentModal: React.FC<AgentModalProps> = ({
  isOpen,
  onClose,
  agent,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [docs, setDocs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [commissionsLoading, setCommissionsLoading] = useState(false);
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
    { id: "profile", label: "Profile", icon: <PiUserDuotone /> },
    { id: "members", label: "Members", icon: <PiUsersDuotone /> },
    {
      id: "commissions",
      label: "Commissions",
      icon: <PiCurrencyDollarDuotone />,
    },
    { id: "settings", label: "Settings", icon: <FiSettings /> },
  ];

  // Load agent data when modal opens
  useEffect(() => {
    if (isOpen && agent) {
      loadAgentData();
    }
  }, [isOpen, agent]);

  const loadAgentData = async () => {
    if (!agent) return;

    try {
      // Load members
      await loadMembers();

      // Load commissions
      await loadCommissions();
    } catch (error) {
      console.error("Error loading agent data:", error);
    }
  };

  useEffect(() => {
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
    if (isOpen && agent) fetchDocs();
  }, [isOpen, agent?.id]);

  const loadMembers = async () => {
    if (!agent) return;

    try {
      const agentMembers = await getMembersByAgent(agent.id);
      setMembers(agentMembers);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const loadCommissions = async () => {
    if (!agent) return;

    setCommissionsLoading(true);
    try {
      const data = await getAgentCommissionHistory(agent.id);
      setCommissions(data.commissions || []);
    } catch (error) {
      console.error("Error loading commissions:", error);
    } finally {
      setCommissionsLoading(false);
    }
  };

  const handleFieldUpdate = async (field: string, value: string | number) => {
    if (!agent) return;

    try {
      await updateAgent(agent.id, { [field]: value });
      onUpdate?.();
    } catch (error: any) {
      throw error;
    }
  };

  const handleUploadDoc = async (file: File, type: string) => {
    const newDoc = await uploadDocApi("agent", agent!.id, file, type);
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
    if (!agent) return;

    try {
      const tempPassword = Math.random().toString(36).slice(-8);
      await resetAgentPassword(agent.id, tempPassword);

      setNotification({
        isOpen: true,
        type: "success",
        title: "Password Reset",
        message: `Password has been reset successfully. Temporary password: ${tempPassword}. This has been sent to their email.`,
        onConfirm: undefined,
      });
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Reset Failed",
        message: error.response?.data?.error || "Failed to reset password",
        onConfirm: undefined,
      });
    }
  };

  const handleStatusToggle = async (_userId: string, newStatus: string) => {
    if (!agent) return;

    await toggleAgentStatus(agent.id, newStatus as "active" | "inactive");
    onUpdate?.();
  };

  const handleKYCUpdate = async (
    _userId: string,
    status: string,
    reason?: string
  ) => {
    if (!agent) return;

    try {
      await updateAgentKYC(agent.id, status, reason);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString();
  };

  if (!isOpen || !agent) return null;

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
                    <div className="">
                      <TbUserStar size={40} className="text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {agent.full_name || "Agent"}
                      </h2>
                      <p className="text-sm text-gray-600">{agent.code}</p>
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
                    {activeTab === "profile" && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Agent Profile
                        </h3>

                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EditableField
                            label="Full Name"
                            value={agent.full_name || ""}
                            onSave={(value) =>
                              handleFieldUpdate("full_name", value)
                            }
                            required
                          />
                          <EditableField
                            label="Phone Number"
                            value={agent.user?.phone || ""}
                            type="tel"
                            onSave={(value) =>
                              handleFieldUpdate("phone", value)
                            }
                            format={formatPhoneNumber}
                            required
                          />
                          <EditableField
                            label="Email Address"
                            value={agent.user?.email || ""}
                            type="email"
                            onSave={(value) =>
                              handleFieldUpdate("email", value)
                            }
                          />
                          <EditableField
                            label="Agent Code"
                            value={agent.code}
                            disabled
                            onSave={async () => {}}
                          />
                        </div>

                        {/* Financial Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <EditableField
                            label="M-Pesa Phone"
                            value={agent.user?.phone || ""}
                            type="tel"
                            onSave={(value) =>
                              handleFieldUpdate("phone", value)
                            }
                            format={formatPhoneNumber}
                          />
                          <EditableField
                            label="Bank Details"
                            value="Not available"
                            type="textarea"
                            onSave={(value) =>
                              handleFieldUpdate("bank_details", value)
                            }
                          />
                        </div>

                        {/* Super-Agent Assignment */}
                        {agent.super_agent && (
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                              <PiUsersDuotone className="w-5 h-5 mr-2 text-purple-600" />
                              Assigned Super-Agent
                            </h4>
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Super-Agent Name
                                  </label>
                                  <div className="px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200">
                                    {agent.super_agent.full_name || "N/A"}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Super-Agent Code
                                  </label>
                                  <div className="px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200 font-mono">
                                    {agent.super_agent.code}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Super-Agent Phone
                                  </label>
                                  <div className="px-3 py-2 bg-white text-gray-900 rounded-lg border border-gray-200">
                                    {agent.super_agent.user?.phone || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Statistics */}
                        <div className="border-t border-gray-200 pt-6">
                          <div className="flex items-center space-x-2 mb-4">
                            <FiDollarSign className="w-5 h-5 text-green-600" />
                            <h4 className="text-md font-semibold text-gray-900">
                              Agent Statistics
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <PiUsersDuotone className="w-6 h-6 text-blue-600" />
                              </div>
                              <p className="text-sm font-medium text-blue-700 mb-1">
                                Total Members
                              </p>
                              <p className="text-3xl font-bold text-blue-900">
                                {agent.memberCount || 0}
                              </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-2">
                                <FiDollarSign className="w-6 h-6 text-green-600" />
                              </div>
                              <p className="text-sm font-medium text-green-700 mb-1">
                                Commission Balance
                              </p>
                              <p className="text-3xl font-bold text-green-900">
                                KSh{" "}
                                {(
                                  agent.commissionBalance || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Documents Section */}
                        <div className="border-t border-gray-200 pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                              <TbFile className="w-5 h-5 mr-2 text-green-600" />
                              Documents
                            </h4>
                            <button
                              onClick={() => setShowUploadDocs(true)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all"
                            >
                              <TbUpload className="w-4 h-4" /> Upload Document
                            </button>
                          </div>
                          {docsLoading ? (
                            <div className="text-sm text-gray-500">
                              Loading...
                            </div>
                          ) : docs.length > 0 ? (
                            <div className="space-y-2">
                              {docs.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 hover:shadow-sm transition-all"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                      <TbFile className="w-5 h-5 text-green-600" />
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
                              <p className="text-sm text-gray-500">
                                No documents uploaded
                              </p>
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
                          onDocumentUploaded={(d) =>
                            setDocs((prev) => [d, ...prev])
                          }
                          onUpload={handleUploadDoc}
                        />
                      </div>
                    )}

                    {activeTab === "members" && (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <PiUsersDuotone className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Agent Members
                          </h3>
                        </div>

                        {members.length > 0 ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                  <PiUsersDuotone className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-sm font-medium text-blue-700 mb-1">
                                  Total Members
                                </p>
                                <p className="text-3xl font-bold text-blue-900">
                                  {members.length}
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                  <PiUserDuotone className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="text-sm font-medium text-green-700 mb-1">
                                  Active Members
                                </p>
                                <p className="text-3xl font-bold text-green-900">
                                  {
                                    members.filter(
                                      (m) => m.user?.status === "active"
                                    ).length
                                  }
                                </p>
                              </div>
                              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-2">
                                  <FiSettings className="w-6 h-6 text-amber-600" />
                                </div>
                                <p className="text-sm font-medium text-amber-700 mb-1">
                                  Pending KYC
                                </p>
                                <p className="text-3xl font-bold text-amber-900">
                                  {
                                    members.filter(
                                      (m) => m.kyc_status === "pending"
                                    ).length
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      Name
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      Phone
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      KYC Status
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      Joined
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {members.map((member, index) => (
                                    <tr
                                      key={index}
                                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                    >
                                      <td className="py-3 px-4 text-gray-900 font-medium">
                                        {member.full_name}
                                      </td>
                                      <td className="py-3 px-4 text-gray-600">
                                        {member.phone}
                                      </td>
                                      <td className="py-3 px-4">
                                        <span
                                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            member.kyc_status === "approved"
                                              ? "bg-green-100 text-green-800 "
                                              : member.kyc_status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : member.kyc_status ===
                                                    "rejected"
                                                  ? "bg-red-100 text-red-800 "
                                                  : "bg-blue-100 text-blue-800 "
                                          }`}
                                        >
                                          {member.kyc_status}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-gray-600">
                                        {formatDate(member.created_at)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <PiUsersDuotone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No members registered yet</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "commissions" && (
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2 mb-4">
                          <PiCurrencyDollarDuotone className="w-5 h-5 text-green-600" />
                          <h3 className="text-lg font-semibold text-gray-900">
                            Commission Details
                          </h3>
                        </div>

                        {/* Commission Summary */}
                        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-6 border border-green-200 shadow-lg">
                          <div className="flex items-center space-x-2 mb-4">
                            <FiDollarSign className="w-6 h-6 text-green-600" />
                            <h4 className="text-xl font-bold text-green-900">
                              Commission Balance
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white bg-opacity-60 rounded-lg p-4">
                              <p className="text-sm font-medium text-green-700 mb-2">
                                Current Balance
                              </p>
                              <p className="text-4xl font-bold text-green-900">
                                KSh{" "}
                                {(
                                  agent.commissionBalance || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div className="bg-white bg-opacity-60 rounded-lg p-4">
                              <p className="text-sm font-medium text-green-700 mb-2">
                                Total Earned
                              </p>
                              <p className="text-3xl font-bold text-green-900">
                                KSh{" "}
                                {(
                                  agent.commissionBalance || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Commission History */}
                        <div className="border-t border-gray-200 pt-6">
                          <div className="flex items-center space-x-2 mb-4">
                            <FiDollarSign className="w-5 h-5 text-green-600" />
                            <h4 className="text-md font-semibold text-gray-900">
                              Commission History
                            </h4>
                          </div>
                          {commissionsLoading ? (
                            <div className="text-center py-8 text-gray-500">
                              <p>Loading commission history...</p>
                            </div>
                          ) : commissions.length > 0 ? (
                            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      Date
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      Member
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      Payment
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      Commission
                                    </th>
                                    <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {commissions.map(
                                    (commission: any, index: number) => (
                                      <tr
                                        key={index}
                                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                      >
                                        <td className="py-3 px-4 text-gray-600">
                                          {formatDate(commission.date)}
                                        </td>
                                        <td className="py-3 px-4 text-gray-900 font-medium">
                                          {commission.member_name}
                                        </td>
                                        <td className="py-3 px-4 text-gray-600">
                                          KSh{" "}
                                          {commission.payment_amount.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-green-900 font-bold">
                                          KSh{" "}
                                          {commission.amount.toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4">
                                          <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                              commission.status === "disbursed"
                                                ? "bg-green-100 text-green-800 "
                                                : commission.status ===
                                                    "pending"
                                                  ? "bg-yellow-100 text-yellow-800"
                                                  : "bg-red-100 text-red-800 "
                                            }`}
                                          >
                                            {commission.status}
                                          </span>
                                        </td>
                                      </tr>
                                    )
                                  )}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
                              <FiDollarSign className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                              <p className="text-sm text-gray-500">
                                No commission history available
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "settings" && (
                      <SecuritySection
                        userType="agent"
                        userId={agent.user?.id || agent.id}
                        userStatus={agent.user?.status || "active"}
                        kycStatus={agent.kyc_status}
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
        showCancel={
          notification.type === "confirm" || notification.type === "delete"
        }
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </>
  );
};

export default AgentModal;
