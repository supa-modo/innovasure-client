import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "../services/authService";
import { FiX } from "react-icons/fi";
import Step1PersonalInfo from "./register/Step1PersonalInfo";
import Step2Dependants from "./register/Step2Dependants";
import Step3PlanSelection from "./register/Step3PlanSelection";
import Step4AgentPassword from "./register/Step4AgentPassword";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    phone: z
      .string()
      .regex(/^\+254[0-9]{9}$/, "Phone must be in format +254XXXXXXXXX"),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    id_number: z
      .string()
      .min(5, "ID number must be at least 5 characters")
      .regex(
        /^[0-9]{5,12}$/,
        "ID number must contain only numbers and be 5-12 digits"
      ),
    kra_pin: z
      .string()
      .min(5, "KRA PIN must be at least 5 characters")
      .optional()
      .or(z.literal("")),
    date_of_birth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Gender is required",
    }),
    address: z.object({
      town: z.string().min(1, "Town is required"),
      county: z.string().min(1, "County is required"),
    }),
    next_of_kin: z.object({
      name: z.string().min(2, "Next of kin name is required"),
      phone: z
        .string()
        .regex(/^\+254[0-9]{9}$/, "Phone must be in format +254XXXXXXXXX"),
      relationship: z.string().min(1, "Relationship is required"),
      id_number: z
        .string()
        .min(5, "ID number must be at least 5 characters")
        .regex(
          /^[0-9]{5,12}$/,
          "ID number must contain only numbers and be 5-12 digits"
        ),
    }),
    agent_code: z.string().min(1, "Agent code is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        "Password must include uppercase, lowercase, number, and special character"
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface Dependant {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  is_covered: boolean;
}

interface RegisterMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RegisterMemberModal: React.FC<RegisterMemberModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [agentInfo, setAgentInfo] = useState<{
    name: string;
    code: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    clearErrors,
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Validation functions for each step
  const validateStep1 = async () => {
    const fields: (keyof RegisterFormData)[] = [
      "full_name",
      "phone",
      "id_number",
      "date_of_birth",
      "gender",
      "address",
    ];
    const isValid = await trigger(fields);
    return isValid;
  };

  const validateStep2 = async () => {
    const fields: (keyof RegisterFormData)[] = ["next_of_kin"];
    const isValid = await trigger(fields);
    return isValid;
  };

  const validateStep3 = () => {
    return selectedPlan !== "";
  };

  const validateStep4 = async () => {
    const fields: (keyof RegisterFormData)[] = [
      "agent_code",
      "password",
      "confirm_password",
    ];
    const isValid = await trigger(fields);
    return isValid && agentInfo !== null;
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError("");

      const registerData = {
        role: "member" as const,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        full_name: data.full_name,
        id_number: data.id_number,
        kra_pin: data.kra_pin || undefined,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address,
        next_of_kin: data.next_of_kin,
        dependants: dependants.length > 0 ? dependants : undefined,
        plan_id: selectedPlan,
        agent_code: data.agent_code,
      };

      const response = await registerUser(registerData);

      // Reset form and close modal
      reset();
      setDependants([]);
      setSelectedPlan("");
      setAgentInfo(null);
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

  const handleStepSubmit = async () => {
    if (currentStep === 4) {
      handleSubmit(onSubmit)();
    } else {
      // Handle navigation to next step based on current step
      let isValid = false;

      if (currentStep === 1) {
        isValid = await validateStep1();
        if (isValid) {
          setCurrentStep(2);
          setError("");
        } else {
          setError("Please fill in all required fields before proceeding.");
        }
      } else if (currentStep === 2) {
        isValid = await validateStep2();
        if (isValid) {
          setCurrentStep(3);
          setError("");
        } else {
          setError("Please fill in all required fields before proceeding.");
        }
      } else if (currentStep === 3) {
        isValid = validateStep3();
        if (isValid) {
          setCurrentStep(4);
          setError("");
        } else {
          setError("Please select an insurance plan before proceeding.");
        }
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setDependants([]);
      setSelectedPlan("");
      setAgentInfo(null);
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
            className="w-[900px] h-[calc(100vh-20px)] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="px-6 pt-4 relative">
              <div className="relative flex justify-between items-start z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center p-1.5">
                  <div className="mr-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
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
                  </div>
                  <div className="ml-2 flex items-center gap-2">
                    <h2 className="text-gray-900 dark:text-white font-semibold text-xl font-lexend">
                      Register New Member
                    </h2>
                    <div className="w-0.5 h-4 ml-3 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-lexend">
                      Add a new member to your portfolio
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-red-500 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-100"
                  title="Close"
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
                        ? "bg-blue-600 text-white"
                        : currentStep > 1
                          ? "bg-blue-400 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    1
                  </div>
                  <div className="w-12 h-1 bg-gray-200"></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-medium ${
                      currentStep === 2
                        ? "bg-blue-600 text-white"
                        : currentStep > 2
                          ? "bg-blue-400 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <div className="w-12 h-1 bg-gray-200"></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-medium ${
                      currentStep === 3
                        ? "bg-blue-600 text-white"
                        : currentStep > 3
                          ? "bg-blue-400 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    3
                  </div>
                  <div className="w-12 h-1 bg-gray-200"></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-medium ${
                      currentStep === 4
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    4
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-130px)]"
            >
              <div className="overflow-y-auto flex-1 px-6 py-5">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Step Components */}
                  {currentStep === 1 && (
                    <Step1PersonalInfo
                      register={register}
                      errors={errors}
                      clearError={() => setError("")}
                      clearErrors={clearErrors}
                      onNext={() => {}} // Navigation handled by footer button
                    />
                  )}

                  {currentStep === 2 && (
                    <Step2Dependants
                      register={register}
                      errors={errors}
                      dependants={dependants}
                      setDependants={setDependants}
                      clearError={() => setError("")}
                      clearErrors={clearErrors}
                      onBack={() => {
                        setCurrentStep(1);
                        setError("");
                      }}
                      onNext={() => {}} // Navigation handled by footer button
                    />
                  )}

                  {currentStep === 3 && (
                    <Step3PlanSelection
                      selectedPlan={selectedPlan}
                      setSelectedPlan={setSelectedPlan}
                      onBack={() => {
                        setCurrentStep(2);
                        setError("");
                      }}
                      onNext={() => {}} // Navigation handled by footer button
                    />
                  )}

                  {currentStep === 4 && (
                    <Step4AgentPassword
                      register={register}
                      errors={errors}
                      agentInfo={agentInfo}
                      setAgentInfo={setAgentInfo}
                      setError={setError}
                      isLoading={isLoading}
                      clearError={() => setError("")}
                      clearErrors={clearErrors}
                      onBack={() => {
                        setCurrentStep(3);
                        setError("");
                      }}
                      onSubmit={() => {}} // Navigation handled by footer button
                    />
                  )}
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-4">
                <div className="flex justify-between">
                  <div className="flex space-x-3">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentStep(currentStep - 1);
                          setError("");
                        }}
                        className="px-6 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold"
                      >
                        Back
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-6 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleStepSubmit}
                      disabled={isLoading}
                      className="px-6 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <svg
                          className="mr-2 h-4 w-4"
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
                      )}
                      {isLoading
                        ? "Processing..."
                        : currentStep === 4
                          ? "Complete Registration"
                          : "Next Step"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterMemberModal;
