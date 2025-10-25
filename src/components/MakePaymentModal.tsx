/**
 * Make Payment Modal Component
 * Allows members to make payments via STK Push or manual M-Pesa
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { TbArrowRight, TbCash, TbPhone } from "react-icons/tb";
import { api } from "../services/api";
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

    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);

      const response = await api.post("/payments/initiate", {
        memberId,
        amount,
        phoneNumber: normalizedPhone,
      });

      setNotification({
        isOpen: true,
        type: "success",
        title: "Payment Initiated",
        message:
          response.data.message ||
          "Please check your phone for the M-Pesa prompt and enter your PIN to complete the payment.",
      });

      // Auto close modal after showing success message
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Payment failed. Please try again.";
      setNotification({
        isOpen: true,
        type: "error",
        title: "Payment Failed",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
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
                    <h3 className="text-lg lg:text-xl font-semibold text-secondary-700 dark:text-gray-100 mb-1">
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
                    Minimum: KShs {premiumAmount.toLocaleString()}. You can pay
                    for multiple periods.
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
              </div>

              {/* Footer
              <div className="px-3 lg:px-6 py-3 lg:py-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div> */}
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
