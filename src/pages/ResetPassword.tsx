import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { resetPassword } from "../services/passwordService";
import { FaCheck, FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id_number, code } = location.state || {};

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
    };
  };

  const passwordValidation = validatePassword(formData.new_password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!id_number || !code) {
      setError("Missing ID number or code");
      setLoading(false);
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!passwordValidation.isValid) {
      setError("Password does not meet requirements");
      setLoading(false);
      return;
    }

    try {
      await resetPassword({
        id_number,
        code,
        new_password: formData.new_password,
      });
      setSuccess(true);
    } catch (err: any) {
      // Extract user-friendly error message from API response
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to reset password";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!id_number || !code) {
    navigate("/forgot-password");
    return null;
  }

  if (success) {
    return (
      <div className="h-screen overflow-hidden relative">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg1.jpg')" }}
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary-900/70 via-primary-800/60 to-primary-700/50"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-screen flex items-center justify-center p-4 overflow-y-auto">
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

            {/* Success Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-3 md:p-4 border border-white/20">
              <div className="text-center mb-3 lg:mb-5">
                <div className="mx-auto h-14 w-14 rounded-full bg-green-200 flex items-center justify-center mb-4">
                  <FaCheck className="h-7 w-7 text-green-600" />
                </div>
                <h2 className="text-[1.3rem] md:text-2xl lg:text-3xl font-bold text-secondary-700 mb-2">
                  Password Reset Successfully
                </h2>
                <p className="text-gray-600 text-[0.85rem] md:text-sm lg:text-[0.95rem] lg:text-base">
                  Your password has been updated. You can now sign in with your
                  new password.
                </p>
              </div>

              <div className="mt-4 lg:mt-8">
                <Link
                  to="/login"
                  className="w-full bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-sm md:text-[0.9rem] lg:text-base text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 flex justify-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg1.jpg')" }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary-900/70 via-primary-800/60 to-primary-700/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex items-center justify-center p-4 overflow-y-auto">
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

          {/* Reset Password Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 lg:p-7 border border-white/20">
            <div className="text-center mt-3 mb-3 lg:mb-5">
              {/* <Link
                to="/verify-reset-code"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link> */}
              <h2 className="text-[1.3rem] md:text-2xl lg:text-3xl font-bold text-secondary-700 mb-1">
                Create a New Password
              </h2>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 lg:px-4 py-2 rounded-lg mb-4 lg:mb-6">
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
                  <p className="text-[0.82rem] md:text-[0.85rem] lg:text-[0.9rem] font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-3">
              {/* New Password */}
              <div>
                <label
                  htmlFor="new_password"
                  className="block pl-2 text-[0.8rem] lg:text-sm font-medium text-gray-500 mb-0.5 lg:mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new_password"
                    name="new_password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.new_password}
                    onChange={handleChange}
                    className="pr-12 input-field"
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {formData.new_password && (
                  <div className="mt-2 space-y-1">
                    <div className="space-y-1">
                      <div
                        className={`flex items-center text-xs ${passwordValidation.minLength ? "text-green-700" : "text-gray-500"}`}
                      >
                        <FiCheck
                          className={`mr-1 h-3 w-3 ${passwordValidation.minLength ? "text-green-700" : "text-gray-400"}`}
                        />
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center text-xs ${passwordValidation.hasUpperCase ? "text-green-700" : "text-gray-500"}`}
                      >
                        <FiCheck
                          className={`mr-1 h-3 w-3 ${passwordValidation.hasUpperCase ? "text-green-700" : "text-gray-400"}`}
                        />
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center text-xs ${passwordValidation.hasLowerCase ? "text-green-700" : "text-gray-500"}`}
                      >
                        <FiCheck
                          className={`mr-1 h-3 w-3 ${passwordValidation.hasLowerCase ? "text-green-700" : "text-gray-400"}`}
                        />
                        One lowercase letter
                      </div>
                      <div
                        className={`flex items-center text-xs ${passwordValidation.hasNumbers ? "text-green-700" : "text-gray-500"}`}
                      >
                        <FiCheck
                          className={`mr-1 h-3 w-3 ${passwordValidation.hasNumbers ? "text-green-700" : "text-gray-400"}`}
                        />
                        One number
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block pl-2 text-[0.8rem] lg:text-sm font-medium text-gray-500 mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="pr-12 input-field"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {formData.confirm_password &&
                  formData.new_password !== formData.confirm_password && (
                    <p className="mt-1 text-xs text-red-600">
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !passwordValidation.isValid ||
                  formData.new_password !== formData.confirm_password
                }
                className="w-full bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-sm md:text-[0.9rem] lg:text-base text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mx-4 mt-4 md:mt-5 lg:mt-6 text-center border-t pt-4 pb-1 lg:pb-0">
              <p className="text-gray-600 text-[0.83rem] md:text-sm lg:text-[0.9rem]">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
