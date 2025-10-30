import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FiX, FiUpload, FiFile } from "react-icons/fi";
import { FaXmark } from "react-icons/fa6";
import api from "../services/api";

const registerAgentSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    mpesa_phone: z
      .string()
      .regex(/^\+254[0-9]{9}$/, "M-Pesa phone must be in format +254XXXXXXXXX"),
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
    id_number: z.string().min(5, "ID number must be at least 5 characters"),
    kra_pin: z
      .string()
      .min(5, "KRA PIN must be at least 5 characters")
      .optional()
      .or(z.literal("")),
    bank_name: z.string().optional(),
    bank_account_number: z.string().optional(),
    bank_branch: z.string().optional(),
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

      // Create agent - use mpesa_phone for both phone and mpesa_phone
      const registerData = {
        phone: data.mpesa_phone, // Use mpesa_phone as phone
        email: data.email || undefined,
        password: data.password,
        full_name: data.full_name,
        mpesa_phone: data.mpesa_phone,
        id_number: data.id_number,
        kra_pin: data.kra_pin || undefined,
        bank_details:
          Object.keys(bankDetails).length > 0 ? bankDetails : undefined,
        kyc_documents: uploadedDocuments,
        // Set kyc_status: "pending" by default, backend will change to "under_review" if documents exist
      };

      await api.post("/agents", registerData);

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
    _type: "id" | "kra"
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

  const handleInputChange = (fieldName: keyof RegisterAgentFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      register(fieldName).onChange(e);
      clearErrors(fieldName);
      if (error) {
        setError("");
      }
    };
  };

  return (
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
            className="w-[900px] h-[calc(100vh-20px)] bg-white shadow-2xl overflow-hidden rounded-3xl"
          >
            {/* Header */}
            <div className="px-4 md:px-6 pt-4 relative">
              <div className="relative flex flex-col sm:flex-row justify-between items-start gap-3 sm:items-center z-10 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="bg-linear-to-br from-purple-500 to-purple-600 p-2 sm:p-3 rounded-xl shadow-lg shrink-0">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
                    <h2 className="text-gray-900 font-semibold text-base sm:text-xl font-lexend">
                      Register New Agent
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm font-lexend hidden sm:block">
                      Add a new agent to your network
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="absolute top-0 right-0 text-red-500 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-100 shrink-0"
                  title="Close"
                >
                  <FaXmark size={20} />
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
                        : currentStep > 2
                          ? "bg-purple-400 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-180px)]"
            >
              <div className="overflow-y-auto flex-1 px-4 md:px-6 py-5">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-2 md:px-3 lg:px-4 py-3 rounded-lg">
                    <p className="text-xs lg:text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <h2 className="text-base md:text-[1.1rem] lg:text-xl font-semibold text-secondary-700 mb-2 md:mb-3">
                        Basic Information
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            {...register("full_name")}
                            onChange={handleInputChange("full_name")}
                            className={`input-field ${errors.full_name ? "input-error" : ""}`}
                            placeholder="Enter full name"
                          />
                          {errors.full_name && (
                            <p className="text-red-500 text-xs lg:text-sm mt-1">
                              {errors.full_name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            M-Pesa Phone Number *
                          </label>
                          <input
                            type="tel"
                            placeholder="+254712345678"
                            {...register("mpesa_phone")}
                            onChange={handleInputChange("mpesa_phone")}
                            className={`input-field ${errors.mpesa_phone ? "input-error" : ""}`}
                          />
                          {errors.mpesa_phone && (
                            <p className="text-red-500 text-xs lg:text-sm mt-1">
                              {errors.mpesa_phone.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Email (Optional)
                          </label>
                          <input
                            type="email"
                            {...register("email")}
                            onChange={handleInputChange("email")}
                            className={`input-field ${errors.email ? "input-error" : ""}`}
                            placeholder="email@example.com"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs lg:text-sm mt-1">
                              {errors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Password Section */}
                      <div className="-mx-1.5 lg:mx-0 border border-gray-200 rounded-xl p-3.5 lg:p-4 space-y-3">
                        <h3 className="font-semibold text-primary-700">
                          Create Account Password
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Password *
                            </label>
                            <input
                              type="password"
                              {...register("password")}
                              onChange={handleInputChange("password")}
                              className={`input-field ${errors.password ? "input-error" : ""}`}
                            />
                            {errors.password && (
                              <p className="text-red-500 text-xs lg:text-sm mt-1">
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
                              onChange={handleInputChange("confirm_password")}
                              className={`input-field ${errors.confirm_password ? "input-error" : ""}`}
                            />
                            {errors.confirm_password && (
                              <p className="text-red-500 text-xs lg:text-sm mt-1">
                                {errors.confirm_password.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-3 text-sm md:text-[0.9rem] lg:text-base">
                        <button
                          type="button"
                          onClick={handleClose}
                          disabled={isLoading}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors border border-gray-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const fields: (keyof RegisterAgentFormData)[] = [
                              "full_name",
                              "mpesa_phone",
                              "password",
                              "confirm_password",
                            ];
                            const isValid = await trigger(fields);
                            if (isValid) {
                              setCurrentStep(2);
                              setError("");
                            } else {
                              setError(
                                "Please fill in all required fields before proceeding."
                              );
                            }
                          }}
                          className="flex-1 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform shadow-lg"
                        >
                          Next: KYC Documents & Payment Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: KYC Documents & Payment Details */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h2 className="text-base md:text-[1.1rem] lg:text-xl font-semibold text-secondary-700 mb-2 md:mb-3">
                        KYC Documents & Payment Details
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            ID Number *
                          </label>
                          <input
                            type="text"
                            {...register("id_number")}
                            onChange={handleInputChange("id_number")}
                            className={`input-field ${errors.id_number ? "input-error" : ""}`}
                            placeholder="12345678"
                          />
                          {errors.id_number && (
                            <p className="text-red-500 text-xs lg:text-sm mt-1">
                              {errors.id_number.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            KRA PIN (Optional)
                          </label>
                          <input
                            type="text"
                            {...register("kra_pin")}
                            onChange={handleInputChange("kra_pin")}
                            className={`input-field ${errors.kra_pin ? "input-error" : ""}`}
                            placeholder="A123456789B"
                          />
                          {errors.kra_pin && (
                            <p className="text-red-500 text-xs lg:text-sm mt-1">
                              {errors.kra_pin.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bank Details (Optional) */}
                      <div className="-mx-1.5 lg:mx-0 border border-gray-200 rounded-xl p-3.5 lg:p-4 bg-gray-50">
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
                              onChange={handleInputChange("bank_name")}
                              className="input-field"
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
                              onChange={handleInputChange("bank_account_number")}
                              className="input-field"
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
                              onChange={handleInputChange("bank_branch")}
                              className="input-field"
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
                        <div className="-mx-1.5 lg:mx-0 border-2 border-dashed border-gray-300 rounded-xl p-3.5 lg:p-4 hover:border-purple-400 transition-colors">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            ID Card / Passport *
                          </label>
                          <div className="flex items-center gap-3 flex-wrap">
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
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer flex items-center gap-2 text-sm"
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
                              <div className="flex-1 min-w-[200px]">
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
                        <div className="-mx-1.5 lg:mx-0 border-2 border-dashed border-gray-300 rounded-xl p-3.5 lg:p-4 hover:border-purple-400 transition-colors">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            KRA PIN Certificate (Optional)
                          </label>
                          <div className="flex items-center gap-3 flex-wrap">
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
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer flex items-center gap-2 text-sm"
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
                                <div className="flex-1 min-w-[200px]">
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

                      <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-3 text-sm md:text-[0.9rem] lg:text-base">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(1);
                            setError("");
                          }}
                          disabled={isLoading}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors border border-gray-300 disabled:opacity-50"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading || !idDocument}
                          className="flex-1 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <div className="spinner mr-2"></div>
                              Registering...
                            </div>
                          ) : (
                            "Complete Registration"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterAgentModal;
