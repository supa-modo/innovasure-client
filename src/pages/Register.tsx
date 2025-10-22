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
      .optional()
      .or(z.literal("")),
    kra_pin: z
      .string()
      .min(5, "KRA PIN must be at least 5 characters")
      .optional()
      .or(z.literal("")),
    date_of_birth: z.string().optional().or(z.literal("")),
    gender: z.enum(["male", "female", "other"]).optional(),
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
        .optional()
        .or(z.literal("")),
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError("");

      const registerData = {
        role: "member" as const,
        phone: data.phone,
        email: data.email || undefined,
        password: data.password,
        // Member-specific data
        full_name: data.full_name,
        id_number: data.id_number || undefined,
        kra_pin: data.kra_pin || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender || undefined,
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
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
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
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step Components */}
                {currentStep === 1 && (
                  <Step1PersonalInfo
                    register={register}
                    errors={errors}
                    onNext={() => setCurrentStep(2)}
                  />
                )}

                {currentStep === 2 && (
                  <Step2Dependants
                    register={register}
                    errors={errors}
                    dependants={dependants}
                    setDependants={setDependants}
                    onBack={() => setCurrentStep(1)}
                    onNext={() => setCurrentStep(3)}
                  />
                )}

                {currentStep === 3 && (
                  <Step3PlanSelection
                    selectedPlan={selectedPlan}
                    setSelectedPlan={setSelectedPlan}
                    onBack={() => setCurrentStep(2)}
                    onNext={() => setCurrentStep(4)}
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
                    onBack={() => setCurrentStep(3)}
                    onSubmit={handleStepSubmit}
                  />
                )}
              </form>

              {/* Login Link */}
              <div className="mt-6 lg:mt-8 text-center mx-4 lg:mx-8 border-t pb-3 md:pb-1 lg:pb-0 pt-4 lg:pt-6">
                <p className="text-gray-600 text-[0.9rem] lg:text-base">
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
