/**
 * User Management Modal
 * Comprehensive modal for creating members, agents, and super-agents
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit3, FiSearch, FiFileText, FiTrash2 } from "react-icons/fi";
import { TbUpload } from "react-icons/tb";
import { TbUserStar } from "react-icons/tb";
import { PiUserDuotone, PiUsersThreeDuotone } from "react-icons/pi";
import { MdLocationOn, MdBusiness } from "react-icons/md";
import { RiUserAddLine } from "react-icons/ri";
import { FaXmark } from "react-icons/fa6";
import { api } from "../../services/api";
import NotificationModal from "../ui/NotificationModal";
import { getPlans, InsurancePlan } from "../../services/insurancePlansService";
import { uploadDocument } from "../../services/documentsService";

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
    plan_id: "",
    mpesa_phone: "",
    bank_details: {
      bank_name: "",
      account_number: "",
      branch: "",
    },

    // Status
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [availableSuperAgents, setAvailableSuperAgents] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Array<{ file: File; document_type: string }>>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
        full_name:
          user.full_name ||
          (userType === "member" ? user.user?.profile?.full_name : "") ||
          "",
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
        address:
          typeof user.address === "string"
            ? user.address
            : user.address
              ? JSON.stringify(user.address)
              : "",
        next_of_kin: parsedNextOfKin,
        agent_id: user.agent_id || "",
        super_agent_id: user.super_agent_id || "",
        mpesa_phone: user.mpesa_phone || "",
        bank_details: (() => {
          // Parse bank_details if it's a string, otherwise use the object
          let bankData = user.bank_details;
          if (typeof bankData === "string") {
            try {
              bankData = JSON.parse(bankData);
            } catch {
              bankData = {};
            }
          }
          return {
            bank_name: bankData?.bank_name || "",
            account_number: bankData?.account_number || "",
            branch: bankData?.branch || "",
          };
        })(),
        plan_id: user.subscription?.plan_id || user.plan_id || "",
        status: user.user?.status || "active",
      });

      // Note: For edit mode, we don't load existing documents into selectedFiles
      // as those are already uploaded to the server
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
        plan_id: "",
        mpesa_phone: "",
        bank_details: {
          bank_name: "",
          account_number: "",
          branch: "",
        },
        status: "active",
      });
      setSelectedFiles([]);
    }
    setErrors({});
  }, [user, mode, userType]);

  // Fetch available agents, super-agents, and plans
  useEffect(() => {
    if (userType === "member") {
      fetchAvailableAgents();
      fetchAvailablePlans();
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
          agent.full_name?.toLowerCase().includes(searchLower) ||
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
          superAgent.full_name?.toLowerCase().includes(searchLower) ||
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

  const fetchAvailablePlans = async () => {
    try {
      setPlansLoading(true);
      const plans = await getPlans(true); // Fetch only active plans
      setAvailablePlans(plans);
    } catch (error) {
      console.error("Error fetching insurance plans:", error);
      setAvailablePlans([]);
    } finally {
      setPlansLoading(false);
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
    setAgentSearchTerm(`${agent.full_name} - ${agent.code}`);
    setShowAgentDropdown(false);
  };

  const handleSuperAgentSelect = (superAgent: any) => {
    setFormData((prev) => ({ ...prev, super_agent_id: superAgent.id }));
    setSuperAgentSearchTerm(`${superAgent.full_name} - ${superAgent.code}`);
    setShowSuperAgentDropdown(false);
  };

  const handleFilesSelected = async (files: File[]) => {
    // Add files with default document type "other"
    const newFiles = files.map((file) => ({
      file,
      document_type: "other" as const,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFileRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDocumentTypeChange = (index: number, documentType: string) => {
    setSelectedFiles((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, document_type: documentType } : item
      )
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesSelected(files);
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
        newErrors.next_of_kin_phone =
          "Phone number must be in format +254XXXXXXXXX";
      }
      if (!formData.next_of_kin.relationship?.trim()) {
        newErrors.next_of_kin_relationship =
          "Next of kin relationship is required";
      }
      if (!formData.next_of_kin.id_number?.trim()) {
        newErrors.next_of_kin_id_number = "Next of kin ID number is required";
      }
    }

    // Role-specific validation
    if (userType === "member" && !formData.agent_id) {
      newErrors.agent_id = "Agent selection is required for members";
    }
    if (userType === "member" && !formData.plan_id) {
      newErrors.plan_id = "Insurance plan selection is required for members";
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
    let createdRoleId: string | null = null;
    let uploadedDocumentIds: string[] = [];

    try {
      // Normalize phone number
      const normalizedPhone = formData.phone.startsWith("+254")
        ? formData.phone
        : `+254${formData.phone.replace(/^0/, "")}`;

      // Convert bank_details object to JSON if it has any values
      let bankDetailsJson: any = {};
      if (
        formData.bank_details.bank_name ||
        formData.bank_details.account_number ||
        formData.bank_details.branch
      ) {
        // Only include fields that have values
        if (formData.bank_details.bank_name) {
          bankDetailsJson.bank_name = formData.bank_details.bank_name.trim();
        }
        if (formData.bank_details.account_number) {
          bankDetailsJson.account_number = formData.bank_details.account_number.trim();
        }
        if (formData.bank_details.branch) {
          bankDetailsJson.branch = formData.bank_details.branch.trim();
        }
      }

      let submitData: any = {
        ...formData,
        phone: normalizedPhone,
        address: formData.address || {},
        next_of_kin: formData.next_of_kin,
        bank_details: Object.keys(bankDetailsJson).length > 0 ? bankDetailsJson : {},
      };

      // For agents and super-agents, use phone as mpesa_phone (they are the same)
      if (userType === "agent" || userType === "super_agent") {
        submitData.mpesa_phone = normalizedPhone;
        // Remove separate phone field as mpesa_phone is used for both User.phone and Agent/SuperAgent.mpesa_phone
        // The server controller will handle mapping phone to User and mpesa_phone to Agent/SuperAgent
      } else {
        // For members, keep mpesa_phone if provided, otherwise use phone
        submitData.mpesa_phone = formData.mpesa_phone || normalizedPhone;
      }

      // Remove password fields if editing and no password change
      if (mode === "edit" && !formData.password) {
        const { password, confirmPassword, ...dataWithoutPasswords } =
          submitData;
        submitData = dataWithoutPasswords as any;
      }

      if (mode === "add") {
        // STEP 1: Create user/agent/super-agent first
        const apiPath =
          userType === "super_agent" ? "super-agents" : `${userType}s`;
        const createResponse = await api.post(`/${apiPath}`, submitData);
        
        // Extract the created ID from response
        if (userType === "member") {
          createdRoleId = createResponse.data.member?.id;
        } else if (userType === "agent") {
          createdRoleId = createResponse.data.agent?.id;
        } else if (userType === "super_agent") {
          createdRoleId = createResponse.data.superAgent?.id;
        }

        if (!createdRoleId) {
          throw new Error("Failed to get created user ID from response");
        }

        // STEP 2: Upload documents if any were selected
        if (selectedFiles.length > 0) {
          try {
            for (const fileItem of selectedFiles) {
              const uploadedDoc = await uploadDocument(
                userType as any, // owner_type
                createdRoleId, // owner_id (role ID, not user ID)
                fileItem.file,
                fileItem.document_type // use selected document_type
              );
              uploadedDocumentIds.push(uploadedDoc.id);
            }
          } catch (uploadError: any) {
            console.error("Document upload failed:", uploadError);
            
            // STEP 3: Rollback - delete the created user if document upload fails
            try {
              await api.delete(`/${apiPath}/${createdRoleId}`);
              console.log("Rolled back user creation due to document upload failure");
            } catch (rollbackError) {
              console.error("Rollback failed:", rollbackError);
            }
            
            throw new Error(
              `User created but document upload failed: ${uploadError.response?.data?.error || uploadError.message}. User creation has been rolled back.`
            );
          }
        }

        setNotification({
          isOpen: true,
          type: "success",
          title: "Success",
          message: `${userType.charAt(0).toUpperCase() + userType.slice(1)} created successfully${selectedFiles.length > 0 ? ` with ${selectedFiles.length} document(s)` : ""}`,
          onConfirm: undefined,
        });
      } else {
        // Edit mode - just update the user (document handling for edit mode can be added later)
        const apiPath =
          userType === "super_agent" ? "super-agents" : `${userType}s`;
        await api.put(`/${apiPath}/${user.id}`, submitData);
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
      console.error(
        `Error ${mode === "add" ? "creating" : "updating"} ${userType}:`,
        error
      );

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
                            {userType === "agent" || userType === "super_agent"
                              ? "Phone/M-Pesa Number"
                              : "Phone Number"}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleInputChange("phone", value);
                              // For agents/super-agents, also update mpesa_phone
                              if (userType === "agent" || userType === "super_agent") {
                                handleInputChange("mpesa_phone", value);
                              }
                            }}
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
                              Phone Number{" "}
                              <span className="text-red-500">*</span>
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
                              Relationship{" "}
                              <span className="text-red-500">*</span>
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
                      <>
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="font-semibold text-blue-600  mb-4 flex items-center">
                            <TbUserStar className="w-5 h-5 mr-2 text-blue-600" />
                            Agent Assignment
                          </h3>
                          <div className="relative">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Select Agent{" "}
                              <span className="text-red-500">*</span>
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
                                          {agent.user?.full_name}
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

                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="font-semibold text-green-600 mb-4 flex items-center">
                            <MdBusiness className="w-5 h-5 mr-2 text-green-600" />
                            Insurance Plan Selection
                          </h3>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Select Insurance Plan{" "}
                              <span className="text-red-500">*</span>
                            </label>

                            {plansLoading ? (
                              <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                              </div>
                            ) : availablePlans.length === 0 ? (
                              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                                No active insurance plans available at the
                                moment.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availablePlans.map((plan) => (
                                  <div
                                    key={plan.id}
                                    onClick={() =>
                                      handleInputChange("plan_id", plan.id)
                                    }
                                    className={`border-2 rounded-xl px-4 py-3 cursor-pointer transition-all ${
                                      formData.plan_id === plan.id
                                        ? "border-green-600 bg-green-50 shadow-md"
                                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 text-sm">
                                          {plan.name}
                                        </h4>
                                        <p className="text-gray-600 font-lexend font-semibold text-xs mt-1">
                                          KSh{" "}
                                          {plan.premium_amount.toLocaleString()}
                                          /
                                          {plan.premium_frequency === "daily"
                                            ? "day"
                                            : plan.premium_frequency ===
                                                "weekly"
                                              ? "week"
                                              : plan.premium_frequency ===
                                                  "monthly"
                                                ? "month"
                                                : "year"}
                                        </p>
                                        <p className="text-gray-500 text-xs mt-1">
                                          Coverage: KSh{" "}
                                          {plan.coverage_amount.toLocaleString()}
                                        </p>
                                        {plan.description && (
                                          <p className="text-gray-500 text-xs mt-2 line-clamp-2">
                                            {plan.description}
                                          </p>
                                        )}
                                      </div>
                                      {formData.plan_id === plan.id && (
                                        <div className="ml-2 flex-shrink-0">
                                          <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                                            <svg
                                              className="w-3 h-3 text-white"
                                              fill="none"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path d="M5 13l4 4L19 7"></path>
                                            </svg>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {errors.plan_id && (
                              <p className="text-red-500 text-xs mt-2">
                                {errors.plan_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </>
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
                                          {superAgent.full_name}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bank Name
                            </label>
                            <input
                              type="text"
                              value={formData.bank_details.bank_name}
                              onChange={(e) =>
                                handleInputChange("bank_details", {
                                  ...formData.bank_details,
                                  bank_name: e.target.value,
                                })
                              }
                              className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                              placeholder="e.g., KCB, Equity Bank"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Account Number
                            </label>
                            <input
                              type="text"
                              value={formData.bank_details.account_number}
                              onChange={(e) =>
                                handleInputChange("bank_details", {
                                  ...formData.bank_details,
                                  account_number: e.target.value,
                                })
                              }
                              className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                              placeholder="e.g., 1234567890"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Branch
                            </label>
                            <input
                              type="text"
                              value={formData.bank_details.branch}
                              onChange={(e) =>
                                handleInputChange("bank_details", {
                                  ...formData.bank_details,
                                  branch: e.target.value,
                                })
                              }
                              className="w-full font-lexend text-sm bg-gray-50 text-gray-600 font-medium rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                              placeholder="e.g., Nairobi CBD"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          All fields are optional. Bank details are used for commission payouts.
                        </p>
                      </div>
                    )}

                    {/* Document Upload */}
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <FiFileText className="w-5 h-5 mr-2 text-orange-600" />
                        KYC Documents
                      </h3>

                      {/* File Upload Area */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                          isDragging
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:border-blue-400 bg-white"
                        }`}
                      >
                        <FiFileText className={`w-12 h-12 mx-auto mb-3 ${isDragging ? "text-blue-600" : "text-gray-400"}`} />
                        <p className={`font-medium mb-2 ${isDragging ? "text-blue-700" : "text-gray-700"}`}>
                          {isDragging
                            ? "Drop files here"
                            : "Drag and drop files here or click to browse"}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                          Accepted: PDF, Images (JPG, PNG, GIF, WebP, BMP), Documents (Max 5MB each)
                        </p>
                        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                          <TbUpload className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Select Files</span>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,.doc,.docx"
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleFilesSelected(Array.from(e.target.files));
                                e.target.value = ""; // Reset input
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Selected Files List */}
                      {selectedFiles.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">
                            Selected Documents ({selectedFiles.length})
                          </h4>
                          <div className="space-y-3">
                            {selectedFiles.map((fileItem, index) => (
                              <div
                                key={index}
                                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-start gap-3">
                                  <FiFileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-sm font-semibold text-gray-900 truncate">
                                        {fileItem.file.name}
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => handleFileRemove(index)}
                                        className="text-red-500 hover:text-red-700 p-1 shrink-0"
                                      >
                                        <FiTrash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          Document Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                          value={fileItem.document_type}
                                          onChange={(e) =>
                                            handleDocumentTypeChange(index, e.target.value)
                                          }
                                          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                          <option value="id_card">ID Card / National ID</option>
                                          <option value="passport">Passport</option>
                                          <option value="proof_of_address">Proof of Address</option>
                                          <option value="other">Other</option>
                                        </select>
                                      </div>
                                      <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                          File Size
                                        </label>
                                        <p className="text-sm text-gray-700 font-medium">
                                          {(fileItem.file.size / 1024).toFixed(1)} KB
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
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
