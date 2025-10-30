import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "../services/authService";
import Step1PersonalInfo from "./register/Step1PersonalInfo";
import Step2Dependants from "./register/Step2Dependants";
import Step3PlanSelection from "./register/Step3PlanSelection";
import Step4AgentPassword from "./register/Step4AgentPassword";
import { FaXmark } from "react-icons/fa6";

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
  id_number: string;
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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError("");

      // Validate that all dependants have id_number
      if (dependants.length > 0) {
        const invalidDependant = dependants.find(
          (dep) => !dep.id_number || dep.id_number.trim() === ""
        );
        if (invalidDependant) {
          setError(
            "All dependants must have an ID Number or Birth Certificate Number"
          );
          setIsLoading(false);
          return;
        }
      }

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

      await registerUser(registerData);

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
            className="w-[900px] h-[calc(100vh-20px)] bg-white shadow-2xl overflow-hidden rounded-3xl "
          >
            {/* Header */}
            <div className="px-4 md:px-6 pt-4 relative">
              <div className="relative flex flex-col sm:flex-row justify-between items-start gap-3 sm:items-center z-10 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="bg-linear-to-br from-blue-500 to-blue-600 p-2 sm:p-3 rounded-xl shadow-lg shrink-0">
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
                      Register New Member
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm font-lexend hidden sm:block">
                      Add a new member to your portfolio
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="absolute top-0 right-0  text-red-500 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-100 shrink-0"
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
              className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-180px)]"
            >
              <div className="overflow-y-auto flex-1 px-4 md:px-6 py-5">
                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-2 md:px-3 lg:px-4 py-3 rounded-lg">
                    <p className="text-xs lgtext-sm">{error}</p>
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
                      onNext={async () => {
                        const fields: (keyof RegisterFormData)[] = [
                          "full_name",
                          "phone",
                          "id_number",
                          "date_of_birth",
                          "gender",
                          "address",
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
                      onNext={async () => {
                        const fields: (keyof RegisterFormData)[] = [
                          "next_of_kin",
                        ];
                        const isValid = await trigger(fields);

                        // Additionally validate that all dependants have id_number
                        if (dependants.length > 0) {
                          const invalidDependant = dependants.find(
                            (dep) =>
                              !dep.id_number || dep.id_number.trim() === ""
                          );
                          if (invalidDependant || !isValid) {
                            setError(
                              "Please fill in all required fields for dependants and next of kin before proceeding."
                            );
                            return;
                          }
                        }

                        if (isValid) {
                          setCurrentStep(3);
                          setError("");
                        } else {
                          setError(
                            "Please fill in all required fields before proceeding."
                          );
                        }
                      }}
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
                      onNext={() => {
                        if (selectedPlan) {
                          setCurrentStep(4);
                          setError("");
                        } else {
                          setError(
                            "Please select an insurance plan before proceeding."
                          );
                        }
                      }}
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
                      onSubmit={async () => {
                        const fields: (keyof RegisterFormData)[] = [
                          "agent_code",
                          "password",
                          "confirm_password",
                        ];
                        const isValid = await trigger(fields);
                        if (isValid && agentInfo) {
                          handleSubmit(onSubmit)();
                        } else {
                          setError(
                            "Please complete all required fields and verify your agent code before proceeding."
                          );
                        }
                      }}
                    />
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

export default RegisterMemberModal;
