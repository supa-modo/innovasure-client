import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { register as registerUser } from "../services/authService";
import { useAuthStore } from "../store/authStore";

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

  const addDependant = () => {
    setDependants([
      ...dependants,
      {
        full_name: "",
        relationship: "spouse",
        date_of_birth: "",
        is_covered: false,
      },
    ]);
  };

  const removeDependant = (index: number) => {
    setDependants(dependants.filter((_, i) => i !== index));
  };

  const updateDependant = (
    index: number,
    field: keyof Dependant,
    value: any
  ) => {
    const updated = [...dependants];
    updated[index] = { ...updated[index], [field]: value };
    setDependants(updated);
  };

  // Agent validation will be implemented when backend API is ready
  // For now, we'll use a mock validation
  const validateAgentCode = async (agentCode: string) => {
    // Mock validation - replace with actual API call
    if (agentCode.length >= 3) {
      setAgentInfo({ name: "John Doe Agent", code: agentCode });
      return true;
    } else {
      setError("Invalid agent code. Please check and try again.");
      return false;
    }
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
        // Member-specific data
        full_name: data.full_name,
        id_number: data.id_number || undefined,
        kra_pin: data.kra_pin || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender || undefined,
        address: data.address,
        next_of_kin: data.next_of_kin,
        dependants: dependants.length > 0 ? dependants : undefined,
        selected_plan: selectedPlan || undefined,
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
        <div className="min-h-full flex flex-col py-8 px-4">
          <div className="max-w-4xl mx-auto w-full flex-1">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <img
                  src="/logo.png"
                  alt="Innovasure Logo"
                  className="h-16 w-auto mx-auto"
                />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 text-shadow">
                Innovasure
              </h1>
              <p className="text-white/90 text-lg text-shadow">
                Member Registration
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep === 1
                      ? "bg-primary-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  1
                </div>
                <div className="w-12 h-1 bg-white/30"></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep === 2
                      ? "bg-primary-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  2
                </div>
                <div className="w-12 h-1 bg-white/30"></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep === 3
                      ? "bg-primary-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  3
                </div>
                <div className="w-12 h-1 bg-white/30"></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep === 4
                      ? "bg-primary-600 text-white"
                      : "bg-white/30 text-white"
                  }`}
                >
                  4
                </div>
              </div>
            </div>

            {/* Registration Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Personal Information & Address */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Personal Information & Address
                    </h2>

                    {/* Row 1: Full Name and ID Number */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          {...register("full_name")}
                          className={`input-field ${errors.full_name ? "input-error" : ""}`}
                        />
                        {errors.full_name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.full_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ID Number (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="12345678"
                          {...register("id_number")}
                          className={`input-field ${errors.id_number ? "input-error" : ""}`}
                        />
                        {errors.id_number && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.id_number.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Phone and Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          placeholder="+254712345678"
                          {...register("phone")}
                          className={`input-field ${errors.phone ? "input-error" : ""}`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">
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
                          className={`input-field ${errors.email ? "input-error" : ""}`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Gender, Date of Birth, and KRA PIN */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender (Optional)
                        </label>
                        <select
                          {...register("gender")}
                          className={`input-field ${errors.gender ? "input-error" : ""}`}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.gender.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of Birth (Optional)
                        </label>
                        <input
                          type="date"
                          {...register("date_of_birth")}
                          className={`input-field ${errors.date_of_birth ? "input-error" : ""}`}
                        />
                        {errors.date_of_birth && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.date_of_birth.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          KRA PIN (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="A123456789B"
                          {...register("kra_pin")}
                          className={`input-field ${errors.kra_pin ? "input-error" : ""}`}
                        />
                        {errors.kra_pin && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.kra_pin.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Address Section - Full Width */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Address Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Town *
                          </label>
                          <input
                            type="text"
                            {...register("address.town")}
                            className={`input-field ${errors.address?.town ? "input-error" : ""}`}
                          />
                          {errors.address?.town && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.address.town.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            County *
                          </label>
                          <input
                            type="text"
                            {...register("address.county")}
                            className={`input-field ${errors.address?.county ? "input-error" : ""}`}
                          />
                          {errors.address?.county && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.address.county.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                    >
                      Next: Dependants & Next of Kin
                    </button>
                  </div>
                )}

                {/* Step 2: Dependants & Next of Kin */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Dependants & Next of Kin
                    </h2>
                    <p className="text-gray-600 text-sm mb-4">
                      Add family members who will be covered under your
                      insurance plan.
                    </p>

                    {dependants.map((dependant, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-900">
                            Dependant {index + 1}
                          </h3>
                          <button
                            type="button"
                            onClick={() => removeDependant(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="space-y-4">
                          {/* Name and Relationship */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                placeholder="Full Name"
                                value={dependant.full_name}
                                onChange={(e) =>
                                  updateDependant(
                                    index,
                                    "full_name",
                                    e.target.value
                                  )
                                }
                                className="input-field"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Relationship
                              </label>
                              <select
                                value={dependant.relationship}
                                onChange={(e) =>
                                  updateDependant(
                                    index,
                                    "relationship",
                                    e.target.value
                                  )
                                }
                                className="input-field"
                              >
                                <option value="spouse">Spouse</option>
                                <option value="child">Child</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>

                          {/* Date of Birth and Coverage */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date of Birth
                              </label>
                              <input
                                type="date"
                                value={dependant.date_of_birth}
                                onChange={(e) =>
                                  updateDependant(
                                    index,
                                    "date_of_birth",
                                    e.target.value
                                  )
                                }
                                className="input-field"
                              />
                            </div>

                            <div className="flex items-end">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={dependant.is_covered}
                                  onChange={(e) =>
                                    updateDependant(
                                      index,
                                      "is_covered",
                                      e.target.checked
                                    )
                                  }
                                  className="rounded"
                                />
                                <span className="text-sm text-gray-700">
                                  Include in coverage
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addDependant}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors border border-gray-300"
                    >
                      + Add Dependant
                    </button>

                    {/* Next of Kin Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Next of Kin Information
                      </h3>

                      <div className="space-y-4">
                        {/* Name and Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              {...register("next_of_kin.name")}
                              className={`input-field ${errors.next_of_kin?.name ? "input-error" : ""}`}
                            />
                            {errors.next_of_kin?.name && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.next_of_kin.name.message}
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
                              {...register("next_of_kin.phone")}
                              className={`input-field ${errors.next_of_kin?.phone ? "input-error" : ""}`}
                            />
                            {errors.next_of_kin?.phone && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.next_of_kin.phone.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Relationship and ID Number */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Relationship *
                            </label>
                            <select
                              {...register("next_of_kin.relationship")}
                              className={`input-field ${errors.next_of_kin?.relationship ? "input-error" : ""}`}
                            >
                              <option value="">Select Relationship</option>
                              <option value="spouse">Spouse</option>
                              <option value="parent">Parent</option>
                              <option value="child">Child</option>
                              <option value="sibling">Sibling</option>
                              <option value="other">Other</option>
                            </select>
                            {errors.next_of_kin?.relationship && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.next_of_kin.relationship.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              ID Number (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="12345678"
                              {...register("next_of_kin.id_number")}
                              className={`input-field ${errors.next_of_kin?.id_number ? "input-error" : ""}`}
                            />
                            {errors.next_of_kin?.id_number && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.next_of_kin.id_number.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-300"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                      >
                        Next: Agent Code & Plan
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Insurance Plan Selection */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Select Insurance Plan
                    </h2>

                    {/* Plan Selection */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Choose Your Insurance Plan
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        Choose an insurance plan that suits your needs. Plans
                        will be available after registration.
                      </p>

                      <div className="grid gap-4">
                        {/* Placeholder Plans */}
                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedPlan === "daily"
                              ? "border-primary-600 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPlan("daily")}
                        >
                          <h3 className="font-semibold text-gray-900">
                            Daily Plan
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            KSh 20/day
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            Coverage: KSh 50,000
                          </p>
                        </div>

                        <div
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedPlan === "monthly"
                              ? "border-primary-600 bg-primary-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPlan("monthly")}
                        >
                          <h3 className="font-semibold text-gray-900">
                            Monthly Plan
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">
                            KSh 500/month
                          </p>
                          <p className="text-gray-500 text-xs mt-2">
                            Coverage: KSh 100,000
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 mt-4">
                        * You can select or change your plan after registration
                      </p>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-300"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(4)}
                        className="flex-1 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                      >
                        Next: Agent Code & Password
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Agent Code & Password */}
                {currentStep === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Agent Code & Create Password
                    </h2>

                    {/* Agent Code Section */}
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <h3 className="font-medium text-gray-900">
                        Agent Information
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Enter the agent code provided by your insurance agent.
                      </p>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Agent Code *
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="e.g., AG123456"
                            {...register("agent_code")}
                            className={`flex-1 input-field ${errors.agent_code ? "input-error" : ""}`}
                            onChange={(e) => {
                              register("agent_code").onChange(e);
                              if (e.target.value.length >= 3) {
                                validateAgentCode(e.target.value);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const agentCode = document.querySelector(
                                'input[name="agent_code"]'
                              ) as HTMLInputElement;
                              if (agentCode?.value) {
                                validateAgentCode(agentCode.value);
                              }
                            }}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Verify
                          </button>
                        </div>
                        {errors.agent_code && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.agent_code.message}
                          </p>
                        )}
                      </div>

                      {agentInfo && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <p className="text-green-800 text-sm">
                            <strong>Agent Found:</strong> {agentInfo.name}
                          </p>
                          <p className="text-green-700 text-xs mt-1">
                            Code: {agentInfo.code}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Password Section */}
                    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <h3 className="font-medium text-gray-900">
                        Create Account Password
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          {...register("password")}
                          className={`input-field ${errors.password ? "input-error" : ""}`}
                        />
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">
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
                          className={`input-field ${errors.confirm_password ? "input-error" : ""}`}
                        />
                        {errors.confirm_password && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.confirm_password.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-300"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !agentInfo}
                        className="flex-1 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
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
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center border-t pt-6">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
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
