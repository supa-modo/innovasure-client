/**
 * Payout Manual Entry Modal
 * Allows admins to record manual payout transactions for failed commission payouts
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiSave, FiAlertCircle } from "react-icons/fi";
import { PayoutDetail } from "../../services/settlementService";

interface PayoutManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  payout: PayoutDetail | null;
  onSubmit: (details: {
    transactionRef: string;
    transactionDate: string;
    phone: string;
    notes?: string;
  }) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const PayoutManualEntryModal: React.FC<PayoutManualEntryModalProps> = ({
  isOpen,
  onClose,
  payout,
  onSubmit,
  formatCurrency,
}) => {
  const [formData, setFormData] = useState({
    transactionRef: "",
    transactionDate: new Date().toISOString().split("T")[0],
    phone: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update phone when payout changes
  React.useEffect(() => {
    if (payout) {
      setFormData((prev) => ({
        ...prev,
        phone: payout.beneficiary_phone || "",
      }));
    }
  }, [payout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.transactionRef.trim()) {
      setError("Transaction reference is required");
      return;
    }

    if (!formData.transactionDate) {
      setError("Transaction date is required");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        transactionRef: "",
        transactionDate: new Date().toISOString().split("T")[0],
        phone: payout?.beneficiary_phone || "",
        notes: "",
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record manual payout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !payout) return null;

  return (
    <AnimatePresence>
      {isOpen && payout && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 font-lexend"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-primary-600">
                Record Manual Payout
              </h3>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-2 hover:bg-gray-100 disabled:opacity-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Beneficiary Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Beneficiary:</span>
                  <span className="font-semibold text-gray-900">
                    {payout.beneficiary_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {payout.beneficiary_type.replace("_", "-")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(Number(payout.amount))}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Transaction Reference */}
              <div>
                <label
                  htmlFor="transactionRef"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Transaction Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="transactionRef"
                  value={formData.transactionRef}
                  onChange={(e) =>
                    setFormData({ ...formData, transactionRef: e.target.value })
                  }
                  placeholder="e.g., QAB12CD3EF"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Transaction Date */}
              <div>
                <label
                  htmlFor="transactionDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="transactionDate"
                  value={formData.transactionDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionDate: e.target.value,
                    })
                  }
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="254XXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  disabled={isSubmitting}
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional information about this manual payout..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                  disabled={isSubmitting}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2.5 text-sm border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Record Payout
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PayoutManualEntryModal;

