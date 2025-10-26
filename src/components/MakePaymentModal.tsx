/**
 * Make Payment Modal Component
 * Allows members to make payments via STK Push or manual M-Pesa
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import {
  TbArrowRight,
  TbPhone,
  TbLoader2,
  TbCheck,
  TbAlertCircle,
  TbRefresh,
} from "react-icons/tb";
import { api } from "../services/api";
import { checkPaymentStatus } from "../services/paymentService";
import NotificationModal from "./ui/NotificationModal";
import MpesaIcon from "./ui/MpesaIcon";

interface MakePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  premiumAmount: number;
  userPhone?: string;
}

/**
 * Normalize phone number to international format (+254XXXXXXXXX)
 */
const normalizePhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  let cleaned = phone.replace(/\D/g, "");

  // Handle different formats
  if (cleaned.startsWith("07") || cleaned.startsWith("01")) {
    // Convert 07XXXXXXXX or 01XXXXXXXX to +254XXXXXXXX
    cleaned = "+254" + cleaned.substring(1);
  } else if (cleaned.startsWith("254")) {
    // Convert 254XXXXXXXX to +254XXXXXXXX
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    // Add + if missing
    cleaned = "+" + cleaned;
  }

  return cleaned;
};

/**
 * Validate phone number format
 */
const isValidPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  // Kenyan phone number validation
  return /^\+254[0-9]{9}$/.test(normalized);
};

const MakePaymentModal: React.FC<MakePaymentModalProps> = ({
  isOpen,
  onClose,
  memberId,
  premiumAmount,
  userPhone = "",
}) => {
  const [amount, setAmount] = useState(premiumAmount);
  const [phoneNumber, setPhoneNumber] = useState(userPhone);
  const [loading, setLoading] = useState(false);
  const [instructions, setInstructions] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Multi-state payment status
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "waiting" | "success" | "error" | "timeout"
  >("idle");
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [mpesaReceiptNumber, setMpesaReceiptNumber] = useState<string | null>(
    null
  );
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [timerInterval, setTimerInterval] = useState<any>(null);

  // Notification modal state
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "info" as
      | "info"
      | "success"
      | "error"
      | "warning"
      | "confirm"
      | "delete",
    title: "",
    message: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount(premiumAmount);
      setPhoneNumber(userPhone);
      setError(null);
      setPaymentStatus("idle");
      setTimeRemaining(60);
      setMpesaReceiptNumber(null);
      setPaymentId(null);

      // Clear any existing timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [isOpen, premiumAmount, userPhone]);

  // Fetch manual payment instructions on open
  useEffect(() => {
    if (isOpen && !instructions) {
      const fetchInstructions = async () => {
        try {
          const response = await api.get(`/payments/instructions/${memberId}`);
          setInstructions(response.data);
        } catch (error: any) {
          console.error("Failed to load payment instructions:", error);
          // Silently fail for instructions - not critical for STK Push
        }
      };
      fetchInstructions();
    }
  }, [isOpen, memberId, instructions]);

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    setError(null);
  };

  const validateForm = (): boolean => {
    if (amount < premiumAmount) {
      setError(`Amount must be at least KShs ${premiumAmount}`);
      return false;
    }

    if (!phoneNumber.trim()) {
      setError("Phone number is required for STK Push");
      return false;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Please enter a valid Kenyan phone number");
      return false;
    }

    return true;
  };

  const handleSTKPush = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setPaymentStatus("processing");

    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      const response = await api.post("/payments/initiate", {
        memberId,
        amount,
        phoneNumber: normalizedPhone,
      });

      // Store payment ID and start polling
      setPaymentId(response.data.transactionId || response.data.paymentId);
      setPaymentStatus("waiting");
      setTimeRemaining(60);

      // Start countdown timer
      startCountdownTimer();

      // Start polling
      if (response.data.transactionId || response.data.paymentId) {
        pollPaymentStatus(
          response.data.transactionId || response.data.paymentId
        );
      } else {
        // Fallback: just show waiting state
        setTimeout(() => {
          setPaymentStatus("timeout");
        }, 60000);
      }
    } catch (error: any) {
      setPaymentStatus("error");
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Payment failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startCountdownTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerInterval(null);
          setPaymentStatus("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const pollPaymentStatus = async (paymentId: string) => {
    try {
      const maxAttempts = 6; // 60 seconds at 10 second intervals
      let attempts = 0;

      const poll = async () => {
        if (attempts >= maxAttempts || paymentStatus === "success") {
          if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
          }
          return;
        }

        attempts++;
        const result = await checkPaymentStatus(paymentId);

        if (result.success && result.status === "completed") {
          setPaymentStatus("success");
          setMpesaReceiptNumber(result.payment?.mpesa_transaction_id || null);
          if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
          }
        } else if (result.status === "failed") {
          setPaymentStatus("error");
          setError("Payment failed. Please try again.");
          if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
          }
        } else if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setPaymentStatus("timeout");
          if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
          }
        }
      };

      poll();
    } catch (error) {
      console.error("Polling error:", error);
      setPaymentStatus("timeout");
    }
  };

  const handleTryAgain = () => {
    setPaymentStatus("idle");
    setError(null);
    setMpesaReceiptNumber(null);
    setTimeRemaining(60);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[5px] flex items-center justify-center z-100000 p-2.5 md:p-4 lg:p-6"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh]"
            >
              {/* Header */}

              <div className=" px-4 lg:px-6 py-3 lg:py-5 border-b border-gray-200 dark:border-gray-600">
                {" "}
                <div className="flex items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[1.05rem] md:text-lg lg:text-xl font-semibold text-secondary-700 dark:text-gray-100 mb-1">
                      Pay your premium via M-Pesa
                    </h3>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="text-gray-600 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700/40"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 lg:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {paymentStatus === "idle" && (
                  <>
                    {error && (
                      <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                        <p className="text-sm font-medium">{error}</p>
                      </div>
                    )}

                    {/* Amount input */}
                    <div className="mb-3">
                      <label className="block text-[0.8rem] md:text-sm font- text-gray-700 dark:text-gray-300 mb-2">
                        Payment Amount *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-sm md:text-[0.9rem] text-gray-500 dark:text-gray-400 font-bold">
                            KShs
                          </span>
                        </div>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => {
                            setAmount(parseFloat(e.target.value) || 0);
                            setError(null);
                          }}
                          className="input-field w-full pl-16 text-[0.9rem] md:text-base font-semibold font-lexend"
                          min={premiumAmount}
                          step="1"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Minimum: KShs {premiumAmount.toLocaleString()}. You can
                        pay for multiple periods.
                      </p>
                    </div>

                    {/* Phone Number Input */}
                    <div className="mb-4">
                      <label className="block text-[0.8rem] md:text-sm font- text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MpesaIcon variant="green" width={54} height={18} />
                        </div>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="0712345678 or +254712345678"
                          className="input-field w-full pl-20 text-[0.9rem] md:text-base font-semibold font-lexend"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        You will receive a payment prompt on your phone to enter
                        your PIN
                      </p>
                    </div>

                    {/* STK Push Payment Button */}
                    <button
                      onClick={handleSTKPush}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 lg:py-3.5 rounded-xl font-semibold text-[0.9rem]text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mb-6"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay KShs {amount.toLocaleString()}</span>
                          <TbArrowRight className="w-[1.1rem] h-[1.1rem]" />
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400 font-semibold">
                          OR
                        </span>
                      </div>
                    </div>

                    {/* Manual Payment Instructions */}
                    {instructions && (
                      <div className="mb-0.5 border border-primary-200 dark:border-primary-700 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-primary-600  ">
                            Pay manually to the following paybill and Acc/No.
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">
                              Paybill No:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 font-mono font-bold">
                              {instructions.paybillNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">
                              Account No:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 font-mono">
                              Your ID Number
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-300 min-w-[100px]">
                              Amount:
                            </span>
                            <span className="text-gray-900 dark:text-gray-100 font-bold">
                              KShs {amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {paymentStatus === "processing" && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-12 md:h-16 w-12 md:w-16 border-b-[3px] border-secondary-600 mx-auto mb-4 lg:mb-6" />
                    <h4 className="text-base md:text-lg font-semibold text-gray-500 dark:text-white mb-1 md:mb-2">
                      Processing Payment
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
                      Please wait while we process your payment...
                    </p>
                  </div>
                )}

                {paymentStatus === "waiting" && (
                  <div className="flex flex-col items-center py-6 w-full">
                    <TbLoader2 className="w-10 h-10 text-slate-400 animate-spin mb-2" />

                    <h3 className="text-lg sm:text-xl font-semibold text-slate-500  mb-2">
                      Payment In Progress
                    </h3>

                    <div className="max-w-xl">
                      <p className="text-sm sm:text-base text-center text-gray-600 dark:text-gray-300 mb-3">
                        An M-Pesa prompt has been sent to your phone number -{" "}
                        <span className="font-medium font-lexend text-slate-500">
                          {phoneNumber}
                        </span>
                      </p>

                      {/* Timer Display */}
                      <div className="mb-4 p-1">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="text-center">
                            <div className="text-sm lg:text-[0.95rem] font-bold text-slate-600  font-mono">
                              {" "}
                              {formatTimeRemaining(timeRemaining)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full flex items-center justify-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">
                          Waiting for confirmation
                        </span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-300"></span>
                        <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-pulse delay-600"></span>
                      </div>
                    </div>
                  </div>
                )}

                {paymentStatus === "success" && (
                  <div className="flex flex-col items-center w-full">
                    <div className="relative w-16 h-16 sm:w-18 mb-3 rounded-full flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center">
                        <TbCheck className="h-10 w-10 text-secondary-700" />
                      </div>
                      <motion.svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                      >
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="47"
                          fill="none"
                          stroke="#15803d"
                          strokeWidth="4"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </motion.svg>
                    </div>

                    <h3 className="text-lg md:text-xl font-semibold text-secondary-700  mb-2">
                      Payment Successful!
                    </h3>

                    {/* {mpesaReceiptNumber && ( */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="flex items-center gap-2">
                          <p className="text-[0.7rem] md:text-xs font-sans text-gray-500 dark:text-gray-400">
                            M-Pesa Receipt
                          </p>
                          <p className="text-base font-semibold text-secondary-700 dark:text-secondary-500">
                            "TLRKF34567"
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* )} */}

                    <button
                      onClick={onClose}
                      className="w-full px-4 py-2.5 border border-primary-600 rounded-lg text-sm font-semibold text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      Close
                    </button>
                  </div>
                )}

                {paymentStatus === "error" && (
                  <div className="space-y-5">
                    <div className="text-center">
                      <div className="flex items-center justify-center mx-auto mb-2 lg:mb-4">
                        <TbAlertCircle className="w-12 lg:w-14 h-12 lg:h-14 text-red-600 dark:text-red-400" />
                      </div>
                      <h4 className="text-[1.1rem] lg:text-lg font-semibold text-red-700  mb-4">
                        Payment Failed
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                        {error ||
                          "Your payment could not be processed. Please try again."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleTryAgain}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-[0.8rem] lg:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300"
                      >
                        <TbRefresh className="mr-3 h-5 w-5" />
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {paymentStatus === "timeout" && (
                  <div className="space-y-3.5">
                    <div className="text-center">
                      <div className="flex items-center justify-center mx-auto mb-2">
                        <TbAlertCircle className="w-12 lg:w-14 h-12 lg:h-14 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h4 className="text-[1.1rem] lg:text-lg font-semibold text-amber-700 dark:text-white mb-4">
                        Payment Timeout
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                        The payment request has timed out. If you received an
                        M-Pesa confirmation message, the payment may have been
                        processed. Please check your payment history.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <button
                        onClick={handleTryAgain}
                        className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-[0.8rem] lg:text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-300"
                      >
                        <TbRefresh className="mr-3 h-5 w-5" />
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={
          notification.type === "success" || notification.type === "error"
        }
        autoCloseDelay={notification.type === "success" ? 3000 : 5000}
      />
    </>
  );
};

export default MakePaymentModal;
