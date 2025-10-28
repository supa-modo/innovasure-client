/**
 * User Management Modal
 * Comprehensive modal for creating members, agents, and super-agents
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit3, FiSearch, FiFileText, FiTrash2 } from "react-icons/fi";
import { TbUserStar } from "react-icons/tb";
import { PiUserDuotone, PiUsersThreeDuotone } from "react-icons/pi";
import { MdLocationOn, MdBusiness } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri";
import { FaXmark } from "react-icons/fa6";
import { api } from "../../services/api";
import NotificationModal from "../ui/NotificationModal";
import FileUpload from "../shared/FileUpload";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  mode?: "add" | "edit";
  userType?: "member" | "agent" | "super_agent";
  onSave?: (data: any) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  user,
  mode = "add",
  userType = "member",
  onSave,
}) => {
  const [formData, setFormData] = useState({
    // Basic Info
    full_name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Personal Details
    id_number: "",
    kra_pin: "",
    date_of_birth: "",
    gender: "",
    address: "",
    next_of_kin: {
      name: "",
      phone: "",
      relationship: "",
      id_number: "",
    },

    // Role-specific fields
    agent_id: "",
    super_agent_id: "",
    mpesa_phone: "",
    bank_details: "",

    // Status
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [availableSuperAgents, setAvailableSuperAgents] = useState<any[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);

  // Search states
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [superAgentSearchTerm, setSuperAgentSearchTerm] = useState("");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [showSuperAgentDropdown, setShowSuperAgentDropdown] = useState(false);
  const [filteredAgents, setFilteredAgents] = useState<any[]>([]);
  const [filteredSuperAgents, setFilteredSuperAgents] = useState<any[]>([]);

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

  // Initialize form data
  useEffect(() => {
    if (user && mode === "edit") {
      // Parse next_of_kin if it's a string (JSON)
      let parsedNextOfKin = {
        name: "",
        phone: "",
        relationship: "",
        id_number: "",
      };
      
      if (user.next_of_kin) {
        if (typeof user.next_of_kin === "string") {
          try {
            parsedNextOfKin = JSON.parse(user.next_of_kin);
          } catch {
            // Keep defaults if parsing fails
          }
        } else {
          parsedNextOfKin = user.next_of_kin as any;
        }
      }
      
      setFormData({
        full_name: user.full_name || user.user?.profile?.full_name || "",
        phone: user.phone || user.user?.phone || "",
        email: user.email || user.user?.email || "",
        password: "",
        confirmPassword: "",
        id_number: user.id_number_encrypted || "",
        kra_pin: user.kra_pin_encrypted || "",
        date_of_birth: user.date_of_birth
          ? new Date(user.date_of_birth).toISOString().split("T")[0]
          : "",
        gender: user.gender || "",
        address: typeof user.address === "string" 
          ? user.address 
          : user.address 
            ? JSON.stringify(user.address)
            : "",
        next_of_kin: parsedNextOfKin,
        agent_id: user.agent_id || "",
        super_agent_id: user.super_agent_id || "",
        mpesa_phone: user.mpesa_phone || "",
        bank_details:
          typeof user.bank_details === "string"
            ? user.bank_details
            : JSON.stringify(user.bank_details || {}),
        status: user.user?.status || "active",
      });

      if (user.kyc_documents) {
        setUploadedDocuments(user.kyc_documents);
      }
    } else {
      // Reset form for new user
      setFormData({
        full_name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        id_number: "",
        kra_pin: "",
        date_of_birth: "",
        gender: "",
        address: "",
        next_of_kin: {
          name: "",
          phone: "",
          relationship: "",
          id_number: "",
        },
        agent_id: "",
        super_agent_id: "",
        mpesa_phone: "",
        bank_details: "",
        status: "active",
      });
      setUploadedDocuments([]);
    }
    setErrors({});
  }, [user, mode, userType]);

  // Fetch available agents and super-agents
  useEffect(() => {
    if (userType === "member") {
      fetchAvailableAgents();
    } else if (userType === "agent") {
      fetchAvailableSuperAgents();
    }
  }, [userType]);

  // Filter agents based on search
  useEffect(() => {
    if (agentSearchTerm.trim() === "") {
      setFilteredAgents(availableAgents);
    } else {
      const filtered = availableAgents.filter((agent) => {
        const searchLower = agentSearchTerm.toLowerCase();
        return (
          agent.user?.profile?.full_name?.toLowerCase().includes(searchLower) ||
          agent.code?.toLowerCase().includes(searchLower) ||
          agent.user?.phone?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredAgents(filtered);
    }
  }, [agentSearchTerm, availableAgents]);

  // Filter super-agents based on search
  useEffect(() => {
    if (superAgentSearchTerm.trim() === "") {
      setFilteredSuperAgents(availableSuperAgents);
    } else {
      const filtered = availableSuperAgents.filter((superAgent) => {
        const searchLower = superAgentSearchTerm.toLowerCase();
        return (
          superAgent.user?.profile?.full_name
            ?.toLowerCase()
            .includes(searchLower) ||
          superAgent.code?.toLowerCase().includes(searchLower) ||
          superAgent.user?.phone?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredSuperAgents(filtered);
    }
  }, [superAgentSearchTerm, availableSuperAgents]);

  const fetchAvailableAgents = async () => {
    try {
      const response = await api.get("/agents?limit=1000&kyc_status=approved");
      setAvailableAgents(response.data.agents || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchAvailableSuperAgents = async () => {
    try {
      const response = await api.get(
        "/super-agents?limit=1000&kyc_status=approved"
      );
      setAvailableSuperAgents(response.data.superAgents || []);
    } catch (error) {
      console.error("Error fetching super-agents:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear related errors when field changes
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAgentSelect = (agent: any) => {
    setFormData((prev) => ({ ...prev, agent_id: agent.id }));
    setAgentSearchTerm(`${agent.user?.profile?.full_name} - ${agent.code}`);
    setShowAgentDropdown(false);
  };

  const handleSuperAgentSelect = (superAgent: any) => {
    setFormData((prev) => ({ ...prev, super_agent_id: superAgent.id }));
    setSuperAgentSearchTerm(
      `${superAgent.user?.profile?.full_name} - ${superAgent.code}`
    );
    setShowSuperAgentDropdown(false);
  };

  const handleDocumentUpload = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post(
          `/${userType}s/${user?.id || "temp"}/kyc-documents`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        return {
          key: response.data.document.key,
          filename: file.name,
          uploaded_at: new Date().toISOString(),
        };
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      setUploadedDocuments((prev) => [...prev, ...uploadedDocs]);

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

  const handleDocumentDelete = async (docKey: string) => {
    try {
      await api.delete(`/${userType}s/${user?.id}/kyc-documents/${docKey}`);
      setUploadedDocuments((prev) => prev.filter((doc) => doc.key !== docKey));

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
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.full_name.trim())
      newErrors.full_name = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.id_number.trim())
      newErrors.id_number = "ID number is required";

    // Phone number format validation
    if (formData.phone && !/^\+254\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be in format +254XXXXXXXXX";
    }

    // Email validation (if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation for new users
    if (mode === "add") {
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 6)
        newErrors.password = "Password must be at least 6 characters";
      else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    // Next of Kin validation (only for members)
    if (userType === "member") {
      if (!formData.next_of_kin.name?.trim()) {
        newErrors.next_of_kin_name = "Next of kin name is required";
      }
      if (!formData.next_of_kin.phone?.trim()) {
        newErrors.next_of_kin_phone = "Next of kin phone is required";
      } else if (!/^\+254\d{9}$/.test(formData.next_of_kin.phone)) {
        newErrors.next_of_kin_phone = "Phone number must be in format +254XXXXXXXXX";
      }
      if (!formData.next_of_kin.relationship?.trim()) {
        newErrors.next_of_kin_relationship = "Next of kin relationship is required";
      }
      if (!formData.next_of_kin.id_number?.trim()) {
        newErrors.next_of_kin_id_number = "Next of kin ID number is required";
      }
    }

    // Role-specific validation
    if (userType === "member" && !formData.agent_id) {
      newErrors.agent_id = "Agent selection is required for members";
    }
    if (userType === "agent" && !formData.super_agent_id) {
      newErrors.super_agent_id = "Super-agent selection is required for agents";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      let submitData = {
        ...formData,
        phone: formData.phone.startsWith("+254")
          ? formData.phone
          : `+254${formData.phone.replace(/^0/, "")}`,
        mpesa_phone: formData.mpesa_phone || formData.phone,
        address: formData.address || {},
        next_of_kin: formData.next_of_kin,
        bank_details: formData.bank_details,
      };

      // Remove password fields if editing and no password change
      if (mode === "edit" && !formData.password) {
        const { password, confirmPassword, ...dataWithoutPasswords } =
          submitData;
        submitData = dataWithoutPasswords as any;
      }

      if (mode === "add") {
        // Convert userType to correct API path format
        const apiPath = userType === "super_agent" ? "super-agents" : `${userType}s`;
        const response = await api.post(`/${apiPath}`, submitData);
        setNotification({
          isOpen: true,
          type: "success",
          title: "Success",
          message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} created successfully`,
          onConfirm: undefined,
        });
      } else {
        // Convert userType to correct API path format
        const apiPath = userType === "super_agent" ? "super-agents" : `${userType}s`;
        const response = await api.put(`/${apiPath}/${user.id}`, submitData);
        setNotification({
          isOpen: true,
          type: "success",
          title: "Success",
          message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} updated successfully`,
          onConfirm: undefined,
        });
      }

      if (onSave) onSave(submitData);
      onClose();
    } catch (error: any) {
      console.error(`Error ${mode === "add" ? "creating" : "updating"} ${userType}:`, error);
      
      // Extract user-friendly error message
      let errorMessage = `Failed to ${mode} ${userType}`;
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: errorMessage,
        onConfirm: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getRoleIcon = (type: string) => {
    switch (type) {
      case "member":
        return <PiUserDuotone size={40} className="text-blue-600" />;
      case "agent":
        return <TbUserStar size={40} className="text-green-600" />;
      case "super_agent":
        return <PiUsersThreeDuotone size={40} className="text-purple-600" />;
      default:
        return <PiUserDuotone size={40} className="text-blue-600" />;
    }
  };

  const getRoleDescription = (type: string) => {
    switch (type) {
      case "member":
        return "Insurance policyholders who pay premiums";
      case "agent":
        return "Field agents who register and manage members";
      case "super_agent":
        return "Regional managers who oversee agents";
      default:
        return "";
    }
  };

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
              <div className="px-6 pt-4 relative">
                <div className="relative flex justify-between items-start z-10 pb-4 border-b border-gray-200">
                  <div className="flex items-center p-1.5">
                    <div className="mr-4">{getRoleIcon(userType)}</div>
                    <div className="ml-2 flex items-center gap-2">
                      <h2 className="text-gray-900 font-semibold text-xl font-lexend">
                        {mode === "edit"
                          ? `Edit ${userType.charAt(0).toUpperCase() + userType.slice(1)}`
                          : `Add New ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
                      </h2>
                      <div className="w-0.5 h-4 ml-3 bg-gray-600  rounded-full"></div>
                      <p className="text-gray-600 text-sm font-lexend">
                        {getRoleDescription(userType)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-red-500 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-100"
                    title="Close"
                  >
                    <FaXmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-130px)]"
              >
                <div className="overflow-y-auto flex-1 px-6 py-5">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <PiUserDuotone className="w-5 h-5 mr-2 text-blue-600" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) =>
                              handleInputChange("full_name", e.target.value)
                            }
                            className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.full_name
                                ? "border-red-500"
                                : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Enter full name"
                          />
                          {errors.full_name && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.full_name}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.phone
                                ? "border-red-500"
                                : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="+254700000000"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address{" "}
                            <span className="text-gray-500">(Optional)</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.email
                                ? "border-red-500"
                                : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Enter email address"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.id_number}
                            onChange={(e) =>
                              handleInputChange("id_number", e.target.value)
                            }
                            className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.id_number
                                ? "border-red-500"
                                : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Enter ID number"
                          />
                          {errors.id_number && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.id_number}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <MdLocationOn className="w-5 h-5 mr-2 text-green-600" />
                        Personal Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender
                          </label>
                          <select
                            value={formData.gender}
                            onChange={(e) =>
                              handleInputChange("gender", e.target.value)
                            }
                            className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) =>
                              handleInputChange("date_of_birth", e.target.value)
                            }
                            className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            KRA PIN
                          </label>
                          <input
                            type="text"
                            value={formData.kra_pin}
                            onChange={(e) =>
                              handleInputChange("kra_pin", e.target.value)
                            }
                            className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="Enter KRA PIN"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Address
                          </label>
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) =>
                              handleInputChange("address", e.target.value)
                            }
                            className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="Enter address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Next of Kin Section (Only for Members) */}
                    {userType === "member" && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Next of Kin Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.next_of_kin.name}
                              onChange={(e) =>
                                handleInputChange("next_of_kin", {
                                  ...formData.next_of_kin,
                                  name: e.target.value,
                                })
                              }
                              className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                                errors.next_of_kin_name
                                  ? "border-red-500"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                              placeholder="Enter next of kin name"
                            />
                            {errors.next_of_kin_name && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.next_of_kin_name}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={formData.next_of_kin.phone}
                              onChange={(e) =>
                                handleInputChange("next_of_kin", {
                                  ...formData.next_of_kin,
                                  phone: e.target.value,
                                })
                              }
                              className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                                errors.next_of_kin_phone
                                  ? "border-red-500"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                              placeholder="+254700000000"
                            />
                            {errors.next_of_kin_phone && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.next_of_kin_phone}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Relationship <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={formData.next_of_kin.relationship}
                              onChange={(e) =>
                                handleInputChange("next_of_kin", {
                                  ...formData.next_of_kin,
                                  relationship: e.target.value,
                                })
                              }
                              className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                                errors.next_of_kin_relationship
                                  ? "border-red-500"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                            >
                              <option value="">Select Relationship</option>
                              <option value="spouse">Spouse</option>
                              <option value="parent">Parent</option>
                              <option value="child">Child</option>
                              <option value="sibling">Sibling</option>
                              <option value="other">Other</option>
                            </select>
                            {errors.next_of_kin_relationship && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.next_of_kin_relationship}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ID Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.next_of_kin.id_number}
                              onChange={(e) =>
                                handleInputChange("next_of_kin", {
                                  ...formData.next_of_kin,
                                  id_number: e.target.value,
                                })
                              }
                              className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                                errors.next_of_kin_id_number
                                  ? "border-red-500"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                              placeholder="Enter ID number"
                            />
                            {errors.next_of_kin_id_number && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.next_of_kin_id_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Role-Specific Fields */}
                    {userType === "member" && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-blue-600  mb-4 flex items-center">
                          <TbUserStar className="w-5 h-5 mr-2 text-blue-600" />
                          Agent Assignment
                        </h3>
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select Agent <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={agentSearchTerm}
                              onChange={(e) => {
                                setAgentSearchTerm(e.target.value);
                                setShowAgentDropdown(true);
                              }}
                              onFocus={() => setShowAgentDropdown(true)}
                              onBlur={() =>
                                setTimeout(
                                  () => setShowAgentDropdown(false),
                                  200
                                )
                              }
                              placeholder="Search by agent name or code..."
                              className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                                errors.agent_id
                                  ? "border-red-500"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>

                          {showAgentDropdown && filteredAgents.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredAgents.map((agent) => (
                                <div
                                  key={agent.id}
                                  onClick={() => handleAgentSelect(agent)}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-sm text-gray-900">
                                        {agent.user?.profile?.full_name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Code: {agent.code}
                                      </div>
                                    </div>
                                    <div className="text-sm text-gray-500 ">
                                      {agent.user?.phone}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {errors.agent_id && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.agent_id}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {userType === "agent" && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-purple-600 mb-4 flex items-center">
                          <PiUsersThreeDuotone className="w-5 h-5 mr-2 text-purple-600" />
                          Super-Agent Assignment
                        </h3>
                        <div className="relative">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Super-Agent{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={superAgentSearchTerm}
                              onChange={(e) => {
                                setSuperAgentSearchTerm(e.target.value);
                                setShowSuperAgentDropdown(true);
                              }}
                              onFocus={() => setShowSuperAgentDropdown(true)}
                              onBlur={() =>
                                setTimeout(
                                  () => setShowSuperAgentDropdown(false),
                                  200
                                )
                              }
                              placeholder="Search by super-agent name or code..."
                              className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                                errors.super_agent_id
                                  ? "border-red-500"
                                  : "border-gray-300 focus:border-blue-500"
                              }`}
                            />
                            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>

                          {showSuperAgentDropdown &&
                            filteredSuperAgents.length > 0 && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredSuperAgents.map((superAgent) => (
                                  <div
                                    key={superAgent.id}
                                    onClick={() =>
                                      handleSuperAgentSelect(superAgent)
                                    }
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-semibold text-sm text-gray-900">
                                          {superAgent.user?.profile?.full_name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Code: {superAgent.code}
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-500 ">
                                        {superAgent.user?.phone}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          {errors.super_agent_id && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.super_agent_id}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Financial Details */}
                    {(userType === "agent" || userType === "super_agent") && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <MdBusiness className="w-5 h-5 mr-2 text-green-600" />
                          Financial Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              M-Pesa Phone
                            </label>
                            <input
                              type="tel"
                              value={formData.mpesa_phone}
                              onChange={(e) =>
                                handleInputChange("mpesa_phone", e.target.value)
                              }
                              className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                              placeholder="+254700000000"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bank Details
                            </label>
                            <textarea
                              value={formData.bank_details}
                              onChange={(e) =>
                                handleInputChange(
                                  "bank_details",
                                  e.target.value
                                )
                              }
                              className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                              placeholder="Enter bank details (JSON format)"
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Document Upload */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <FiFileText className="w-5 h-5 mr-2 text-orange-600" />
                        KYC Documents
                      </h3>

                      <FileUpload
                        onUpload={handleDocumentUpload}
                        acceptedTypes={[
                          ".pdf",
                          ".jpg",
                          ".jpeg",
                          ".png",
                          ".doc",
                          ".docx",
                        ]}
                        maxSize={5 * 1024 * 1024}
                        multiple={true}
                      />

                      {uploadedDocuments.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Uploaded Documents
                          </h4>
                          <div className="space-y-2">
                            {uploadedDocuments.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center">
                                  <FiFileText className="w-4 h-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-700">
                                    {doc.filename}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDocumentDelete(doc.key)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Password Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {mode === "edit"
                          ? "Change Password (Optional)"
                          : "Password"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {mode === "edit" ? "New Password" : "Password"}{" "}
                            {mode === "add" && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                              handleInputChange("password", e.target.value)
                            }
                            className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.password
                                ? "border-red-500"
                                : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder={
                              mode === "edit"
                                ? "Leave blank to keep current password"
                                : "Enter password"
                            }
                          />
                          {errors.password && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.password}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {mode === "edit"
                              ? "Confirm New Password"
                              : "Confirm Password"}{" "}
                            {mode === "add" && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.target.value
                              )
                            }
                            className={`w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.confirmPassword
                                ? "border-red-500"
                                : "border-gray-300 focus:border-blue-500"
                            }`}
                            placeholder="Confirm password"
                          />
                          {errors.confirmPassword && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="border-t border-gray-200 bg-white px-6 py-4">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 text-sm bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : mode === "edit" ? (
                        <FiEdit3 className="mr-2 h-4 w-4" />
                      ) : (
                        <RiUserAddLine className="mr-2 h-4 w-4" />
                      )}
                      {loading
                        ? "Saving..."
                        : mode === "edit"
                          ? `Update ${userType.charAt(0).toUpperCase() + userType.slice(1)}`
                          : `Create ${userType.charAt(0).toUpperCase() + userType.slice(1)}`}
                    </button>
                  </div>
                </div>
              </form>
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

export default UserManagementModal;
