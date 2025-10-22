import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { requestPasswordReset } from "../services/passwordService";
import { FaCheck } from "react-icons/fa";
import { TbArrowBack, TbIdBadge2 } from "react-icons/tb";

const ForgotPassword: React.FC = () => {
  const [idNumber, setIdNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await requestPasswordReset({ id_number: idNumber });
      setMessage(result.message);
      setSuccess(true);
    } catch (err: any) {
      // Extract user-friendly error message from API response
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to send reset code";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 lg:p-7 border border-white/20">
              <div className="text-center mb-3 lg:mb-5">
                <div className="mx-auto h-14 w-14 rounded-full bg-green-200 flex items-center justify-center mb-4">
                  <FaCheck className="h-7 w-7 text-green-600" />
                </div>

                <p className="text-gray-700 text-[0.93rem] lg:text-base">
                  {message}
                </p>
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div className="-mx-1 lg:mx-0 border p-3 lg:p-4 rounded-lg">
                  <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-start">
                      <div className="h-6 w-6 rounded-full bg-primary-200 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        <span className="text-xs font-medium font-lexend text-primary-600">
                          1
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Check your registered phone for the 6-digit password
                        reset code or
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-primary-200 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        <span className="text-xs font-medium font-lexend text-primary-600">
                          2
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Check your registered email for the same code
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-primary-200 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        <span className="text-xs font-medium font-lexend text-primary-600">
                          3
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Enter the code on the next page
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-primary-200 flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        <span className="text-xs font-medium font-lexend text-primary-600">
                          4
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Create a new password
                      </p>
                    </div>
                  </div>
                </div>

                <div className="">
                  <Link
                    to="/verify-reset-code"
                    state={{ id_number: idNumber }}
                    className="w-full bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-[0.9rem] lg:text-base text-white font-medium py-2.5 lg:py-3 px-4 rounded-lg transition-colors duration-300 flex justify-center"
                  >
                    Enter Reset Code
                  </Link>
                  <Link
                    to="/login"
                    className="justify-center flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mt-4"
                  >
                    <TbArrowBack className="mr-2 h-[1.1rem] w-[1.1rem]" />
                    Back to Login
                  </Link>
                </div>
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

          {/* Forgot Password Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 lg:p-7 border border-white/20">
            <div className="text-center mb-3 lg:mb-5">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
              <h2 className="text-2xl lg:text-3xl font-bold text-secondary-700 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600 text-[0.9rem] lg:text-base">
                Enter your ID number to get a password reset code
              </p>
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
                  <p className="text-[0.85rem] lg:text-[0.9rem] font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-2 lg:space-y-3">
              {/* ID Number */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <TbIdBadge2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="id_number"
                    name="id_number"
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="pl-12 input-field"
                    placeholder="Enter your ID number"
                  />
                </div>
                <p className="mt-2 text-xs lg:text-[0.8rem] text-gray-500">
                  We'll send a 6-digit code to your registered phone and email
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-[0.9rem] lg:text-base text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Sending Code...
                  </div>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="mx-4 mt-4 md:mt-5 lg:mt-6 text-center border-t pt-4 pb-1 lg:pb-0">
              <p className="text-gray-600 text-[0.9rem]">
                Remember your account password?{" "}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700  font-semibold underline underline-offset-4 transition-colors"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
