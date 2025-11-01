import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";
import Step1PersonalInfo from "../components/register/Step1PersonalInfo";
import Step2Dependants from "../components/register/Step2Dependants";
import Step3PlanSelection from "../components/register/Step3PlanSelection";
import Step4AgentPassword from "../components/register/Step4AgentPassword";

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

const Register = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
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

    // Additionally validate that all dependants have id_number
    if (dependants.length > 0) {
      const invalidDependant = dependants.find(
        (dep) => !dep.id_number || dep.id_number.trim() === ""
      );
      if (invalidDependant) {
        return false;
      }
    }

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
        // Member-specific data
        full_name: data.full_name,
        id_number: data.id_number,
        kra_pin: data.kra_pin || undefined,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address,
        next_of_kin: data.next_of_kin,
        dependants: dependants.length > 0 ? dependants : undefined,
        plan_id: selectedPlan, // Send plan_id instead of selected_plan string
        agent_code: data.agent_code,
      };

      const response = await registerUser(registerData);

      // Save auth data to store
      setAuth(response.user, response.accessToken, response.refreshToken);

      // Redirect to member dashboard
      navigate("/dashboard/member");
    } catch (err: any) {
      console.error("Registration error:", err);

      // Extract error message from various possible error formats
      const errorMessage =
        err.message || // Error thrown from authService (already extracted message)
        err.response?.data?.error || // Direct axios error response
        err.response?.data?.details || // Alternative error field
        "Registration failed. Please try again.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepSubmit = () => {
    if (currentStep === 4) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="h-screen overflow-hidden relative">
      {/* Background Image for All Screens */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg1.jpg')" }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary-900/70 via-primary-800/60 to-primary-700/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen overflow-y-auto">
        <div className="min-h-full flex flex-col py-12 px-2 md:px-4">
          <div className="max-w-4xl mx-auto w-full flex-1">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <img
                  src="/logo.png"
                  alt="Innovasure Logo"
                  className="h-12 lg:h-16 w-auto mx-auto"
                />
              </div>
              <p className="text-white/90 text-xl md:text-2xl lg:text-3xl font-bold text-shadow">
                Member Registration
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep === 1
                      ? "bg-secondary-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  1
                </div>
                <div className="w-12 h-1 bg-white/30"></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep === 2
                      ? "bg-secondary-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  2
                </div>
                <div className="w-12 h-1 bg-white/30"></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep === 3
                      ? "bg-secondary-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  3
                </div>
                <div className="w-12 h-1 bg-white/30"></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep === 4
                      ? "bg-secondary-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  4
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 lg:p-8 border border-white/20">
              {error && (
                <div className="bg-red-50 border border-red-300 font-medium text-sm md:text-[0.9rem] lg:text-base text-red-600 px-4 py-2 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <span className="">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step Components */}
                {currentStep === 1 && (
                  <Step1PersonalInfo
                    register={register}
                    errors={errors}
                    clearError={() => setError("")}
                    clearErrors={clearErrors}
                    onNext={async () => {
                      const isValid = await validateStep1();
                      if (isValid) {
                        setCurrentStep(2);
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
                    onBack={() => setCurrentStep(1)}
                    onNext={async () => {
                      const isValid = await validateStep2();
                      if (isValid) {
                        setCurrentStep(3);
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
                    onBack={() => setCurrentStep(2)}
                    onNext={() => {
                      const isValid = validateStep3();
                      if (isValid) {
                        setCurrentStep(4);
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
                    onBack={() => setCurrentStep(3)}
                    onSubmit={async () => {
                      const isValid = await validateStep4();
                      if (isValid) {
                        handleStepSubmit();
                      } else {
                        setError(
                          "Please complete all required fields and verify your agent code before proceeding."
                        );
                      }
                    }}
                  />
                )}
              </form>

              {/* Login Link */}
              <div className="mt-6 lg:mt-8 text-center mx-4 lg:mx-8 border-t pb-3 md:pb-1 lg:pb-0 pt-4 lg:pt-6">
                <p className="text-gray-600 text-sm md:text-[0.9rem] lg:text-base">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700  font-semibold underline underline-offset-4 transition-colors"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
