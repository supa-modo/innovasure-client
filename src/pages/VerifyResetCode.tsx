import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import OtpInput from "react-otp-input";
import {
  verifyResetCode,
  requestPasswordReset,
} from "../services/passwordService";

const VerifyResetCode: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const idNumber = location.state?.id_number;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!idNumber) {
      navigate("/forgot-password");
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [idNumber, navigate]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const result = await verifyResetCode({ id_number: idNumber, code });
      if (result.valid) {
        navigate("/reset-password", { state: { id_number: idNumber, code } });
      } else {
        setError("Invalid or expired code");
      }
    } catch (err: any) {
      // Extract user-friendly error message from API response
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to verify code";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);

    try {
      await requestPasswordReset({ id_number: idNumber });
      setTimeLeft(15 * 60);
      setCanResend(false);
    } catch (err: any) {
      // Extract user-friendly error message from API response
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to resend code";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!idNumber) {
    return null;
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

          {/* Verify Code Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 md:p-6 lg:p-7 border border-white/20">
            <div className="text-center mb-5 lg:mb-5">
              <Link
                to="/forgot-password"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Previous Page
              </Link>

              <p className="text-gray-600 text-[0.93rem] lg:text-base">
                Enter the 6-digit code sent to your registered phone and email
                below
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
              {/* OTP Input */}
              <div>
                <div className="flex justify-center font-lexend font-medium text-gray-600">
                  <OtpInput
                    value={code}
                    onChange={setCode}
                    numInputs={6}
                    renderInput={(props) => (
                      <input
                        {...props}
                        style={{
                          width: "3rem",
                          height: "3.2rem",
                          margin: "0 0.25rem",
                          fontSize: "1.25rem",
                          borderRadius: "0.5rem",
                          border: "2px solid #d1d5db",
                          textAlign: "center",
                          outline: "none",
                        }}
                      />
                    )}
                    shouldAutoFocus={true}
                  />
                </div>
              </div>

              {/* Timer */}
              <div className="text-center">
                {timeLeft > 0 ? (
                  <p className="text-sm text-gray-600">
                    Code expires in{" "}
                    <span className="font-medium text-red-600">
                      {formatTime(timeLeft)}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">Code has expired</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-[0.9rem] lg:text-base text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify Code"
                )}
              </button>

              {/* Resend Button */}
              {canResend && (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-[0.9rem] lg:text-base font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="animate-spin h-4 w-4 mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiRefreshCw className="h-4 w-4 mr-2" />
                      Resend Code
                    </>
                  )}
                </button>
              )}
            </form>

            {/* Back to Login Link */}
            <div className="mx-4 mt-4 md:mt-5 lg:mt-6 text-center border-t pt-4 pb-1 lg:pb-0">
              <p className="text-gray-600 text-[0.9rem]">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={!canResend || loading}
                  className="text-primary-600 hover:text-primary-700 font-semibold transition-colors disabled:text-gray-400"
                >
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyResetCode;
