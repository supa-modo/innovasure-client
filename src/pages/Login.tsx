import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { login } from "../services/authService";
import { useAuthStore } from "../store/authStore";

const loginSchema = z.object({
  phone_or_email: z.string().min(1, "Phone number or ID number is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Attempting login with:", {
        phone_or_email: data.phone_or_email,
        password: "***",
      });

      const response = await login(data);

      console.log("Login successful:", response.user.role);

      // Save auth data to store
      setAuth(response.user, response.accessToken, response.refreshToken);

      // Redirect based on role
      const dashboardMap: Record<string, string> = {
        admin: "/dashboard/admin",
        super_agent: "/dashboard/super-agent",
        agent: "/dashboard/agent",
        member: "/dashboard/member",
      };

      navigate(dashboardMap[response.user.role] || "/dashboard/member");
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);

      // Use the error message from the service, which now provides user-friendly messages
      const errorMessage = err.message || "Sign in failed. Please try again.";
      setError(errorMessage);
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
        <div className="absolute inset-0 bg-linear-to-br from-primary-900/80 via-primary-800/60 to-primary-700/50"></div>
        <div className="absolute inset-0 bg-linear-to-br from-black/20  to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex items-center justify-center p-5 overflow-y-auto">
        <div className="w-full max-w-120">
          {/* Logo/Brand */}
          <div className="text-center mb-6 lg:mb-8">
            <div className="mb-2 md:mb-3 lg:mb-4">
              <img
                src="/logo.png"
                alt="Innovasure Logo"
                className="h-16 w-auto mx-auto"
              />
            </div>
            <p className="text-white/90 text-lg text-shadow">
              Micro-Insurance Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl py-3 px-3 md:p-6 lg:p-7 border border-white/20">
            <div className="text-center mb-4 lg:mb-5">
              <h2 className="text-[1.3rem] md:text-2xl lg:text-3xl font-bold text-secondary-700 mb-1 ">
                Welcome Back !
              </h2>
              <p className="text-gray-600 text-[0.86rem] md:text-sm lg:text-[0.95rem]">
                Sign in to your account to continue
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 lg:px-4 py-2   rounded-lg mb-4 lg:mb-6">
                <div className="flex items-center">
                  <svg
                    className="w-[1.1rem] lg:w-[1.2rem] h-[1.1rem] lg:h-[1.2rem] mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <p className="text-[0.83rem] md:text-[0.85rem] lg:text-[0.9rem] font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-2 lg:space-y-3"
            >
              {/* Phone or Email */}
              <div>
                <label
                  htmlFor="phone_or_email"
                  className="block pl-2 text-[0.8rem] lg:text-sm font-medium text-gray-500 mb-0.5 lg:mb-2"
                >
                  Phone or ID Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    id="phone_or_email"
                    type="text"
                    placeholder="Enter your phone or ID number"
                    {...register("phone_or_email")}
                    className={`pl-12 input-field ${errors.phone_or_email ? "input-error" : ""}`}
                  />
                </div>
                {errors.phone_or_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone_or_email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-0.5 lg:mb-2">
                  <label
                    htmlFor="password"
                    className="block pl-2 text-[0.8rem] lg:text-sm font-medium text-gray-500"
                  >
                    Password
                  </label>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-[0.8rem] lg:text-sm text-secondary-700 hover:text-secondary-800 font-medium transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`pl-12 pr-12 input-field ${errors.password ? "input-error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-sm md:text-[0.9rem] lg:text-base text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none "
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
          {/* Register Link */}
          <div className="mx-4   text-center border-t pt-4 pb-1 lg:pb-0">
            <p className="text-white text-[0.83rem] md:text-sm lg:text-[0.9rem] ">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-secondary-400 hover:text-secondary-300 font-semibold transition-colors"
              >
                Register as Member
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
