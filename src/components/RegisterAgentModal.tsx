import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiX, FiUpload, FiFile } from "react-icons/fi";
import api from "../services/api";

const registerAgentSchema = z
  .object({
    phone: z
      .string()
      .regex(/^\+254[0-9]{9}$/, "Phone must be in format +254XXXXXXXXX"),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must include uppercase, lowercase, number, and special character"
      ),
    confirm_password: z.string(),
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    mpesa_phone: z
      .string()
      .regex(/^\+254[0-9]{9}$/, "M-Pesa phone must be in format +254XXXXXXXXX"),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    bank_branch: z.string().optional(),
    id_number: z.string().min(5, "ID number must be at least 5 characters"),
    kra_pin: z
      .string()
      .min(5, "KRA PIN must be at least 5 characters")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type RegisterAgentFormData = z.infer<typeof registerAgentSchema>;

interface RegisterAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RegisterAgentModal: React.FC<RegisterAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [kraDocument, setKraDocument] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    id: number;
    kra: number;
  }>({ id: 0, kra: 0 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    clearErrors,
    reset,
  } = useForm<RegisterAgentFormData>({
    resolver: zodResolver(registerAgentSchema),
  });

  // Validation functions for each step
  const validateStep1 = async () => {
    const fields: (keyof RegisterAgentFormData)[] = [
      "phone",
      "email",
      "password",
      "confirm_password",
      "full_name",
    ];
    const isValid = await trigger(fields);
    return isValid;
  };

  const validateStep2 = async () => {
    const fields: (keyof RegisterAgentFormData)[] = [
      "mpesa_phone",
      "id_number",
      "kra_pin",
    ];
    const isValid = await trigger(fields);
    return isValid && idDocument !== null;
  };

  const onSubmit = async (data: RegisterAgentFormData) => {
    try {
      setIsLoading(true);
      setError("");

      // Upload documents to S3
      const uploadedDocuments: string[] = [];

      if (idDocument) {
        const formData = new FormData();
        formData.append("document", idDocument);
        formData.append("document_type", "id_card");
        formData.append("description", "Agent ID Card");

        const uploadResponse = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress((prev) => ({ ...prev, id: percentCompleted }));
          },
        });

        uploadedDocuments.push(uploadResponse.data.key);
      }

      if (kraDocument) {
        const formData = new FormData();
        formData.append("document", kraDocument);
        formData.append("document_type", "other");
        formData.append("description", "Agent KRA PIN Certificate");

        const uploadResponse = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress((prev) => ({ ...prev, kra: percentCompleted }));
          },
        });

        uploadedDocuments.push(uploadResponse.data.key);
      }

      // Build bank details
      const bankDetails: any = {};
      if (data.bank_name) bankDetails.bank_name = data.bank_name;
      if (data.bank_account_number)
        bankDetails.account_number = data.bank_account_number;
      if (data.bank_branch) bankDetails.branch = data.bank_branch;

      // Create agent
      const registerData = {
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        full_name: data.full_name,
        mpesa_phone: data.mpesa_phone,
        bank_details:
          Object.keys(bankDetails).length > 0 ? bankDetails : undefined,
        kyc_documents: uploadedDocuments,
      };

      const response = await api.post("/agents", registerData);

      // Reset form and close modal
      reset();
      setIdDocument(null);
      setKraDocument(null);
      setUploadProgress({ id: 0, kra: 0 });
      setCurrentStep(1);
      setError("");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setIdDocument(null);
      setKraDocument(null);
      setUploadProgress({ id: 0, kra: 0 });
      setCurrentStep(1);
      setError("");
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleFileChange = (
    file: File | null,
    setter: (file: File | null) => void,
    type: "id" | "kra"
  ) => {
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("File size must be less than 5MB");
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("File must be PDF, JPG, or PNG");
        return;
      }
      setter(file);
      setError("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 bg-black/50 backdrop-blur-[5px] flex items-center justify-center z-100000 p-2.5 md:p-4 lg:p-6"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 px-6 py-5 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    Register New Agent
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Add a new agent to your network
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-gray-600 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700/40 disabled:opacity-50"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-medium ${
                      currentStep === 1
                        ? "bg-purple-600 text-white"
                        : currentStep > 1
                          ? "bg-purple-400 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    1
                  </div>
                  <div className="w-12 h-1 bg-gray-200"></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-medium ${
                      currentStep === 2
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-primary-700 mb-4">
                      Basic Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          {...register("full_name")}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                            errors.full_name ? "border-red-500" : ""
                          }`}
                          placeholder="Enter full name"
                        />
                        {errors.full_name && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.full_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="+254712345678"
                          {...register("phone")}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                            errors.phone ? "border-red-500" : ""
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          {...register("email")}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                            errors.email ? "border-red-500" : ""
                          }`}
                          placeholder="email@example.com"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          {...register("password")}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                            errors.password ? "border-red-500" : ""
                          }`}
                        />
                        {errors.password && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          {...register("confirm_password")}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                            errors.confirm_password ? "border-red-500" : ""
                          }`}
                        />
                        {errors.confirm_password && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.confirm_password.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const isValid = await validateStep1();
                          if (isValid) {
                            setCurrentStep(2);
                            setError("");
                          } else {
                            setError(
                              "Please fill in all required fields before proceeding."
                            );
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Next: KYC Documents
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: KYC Documents */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-primary-700 mb-4">
                      KYC Documents & Payment Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          M-Pesa Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="+254712345678"
                          {...register("mpesa_phone")}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                            errors.mpesa_phone ? "border-red-500" : ""
                          }`}
                        />
                        {errors.mpesa_phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.mpesa_phone.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID Number *
                        </label>
                        <input
                          type="text"
                          {...register("id_number")}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                            errors.id_number ? "border-red-500" : ""
                          }`}
                          placeholder="12345678"
                        />
                        {errors.id_number && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.id_number.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          KRA PIN (Optional)
                        </label>
                        <input
                          type="text"
                          {...register("kra_pin")}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 ${
                            errors.kra_pin ? "border-red-500" : ""
                          }`}
                          placeholder="A123456789B"
                        />
                        {errors.kra_pin && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.kra_pin.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bank Details (Optional) */}
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Bank Details (Optional - for alternative payouts)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            {...register("bank_name")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            placeholder="e.g., Equity Bank"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Account Number
                          </label>
                          <input
                            type="text"
                            {...register("bank_account_number")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Account number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Branch
                          </label>
                          <input
                            type="text"
                            {...register("bank_branch")}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Branch name"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Upload KYC Documents *
                      </h3>

                      {/* ID Document */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-purple-400 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID Card / Passport *
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileChange(
                                e.target.files?.[0] || null,
                                setIdDocument,
                                "id"
                              )
                            }
                            className="hidden"
                            id="id-document"
                          />
                          <label
                            htmlFor="id-document"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer flex items-center gap-2"
                          >
                            <FiUpload className="w-4 h-4" />
                            Upload
                          </label>
                          {idDocument && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiFile className="w-4 h-4" />
                              <span>{idDocument.name}</span>
                            </div>
                          )}
                          {uploadProgress.id > 0 && uploadProgress.id < 100 && (
                            <div className="flex-1">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-600 h-2 rounded-full transition-all"
                                  style={{ width: `${uploadProgress.id}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* KRA Document */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-purple-400 transition-colors">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          KRA PIN Certificate (Optional)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileChange(
                                e.target.files?.[0] || null,
                                setKraDocument,
                                "kra"
                              )
                            }
                            className="hidden"
                            id="kra-document"
                          />
                          <label
                            htmlFor="kra-document"
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer flex items-center gap-2"
                          >
                            <FiUpload className="w-4 h-4" />
                            Upload
                          </label>
                          {kraDocument && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiFile className="w-4 h-4" />
                              <span>{kraDocument.name}</span>
                            </div>
                          )}
                          {uploadProgress.kra > 0 &&
                            uploadProgress.kra < 100 && (
                              <div className="flex-1">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-purple-600 h-2 rounded-full transition-all"
                                    style={{ width: `${uploadProgress.kra}%` }}
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(1);
                          setError("");
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !idDocument}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Registering...</span>
                          </div>
                        ) : (
                          "Complete Registration"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterAgentModal;
