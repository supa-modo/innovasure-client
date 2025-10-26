/**
 * Manual Transaction Modal
 * Allows admin to record manual payment transactions for failed payouts
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertCircle } from "react-icons/fi";

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: {
    transactionRef: string;
    transactionDate: string;
    phone?: string;
    notes?: string;
  }) => void;
  amount: number;
  loading?: boolean;
}

const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  amount,
  loading = false,
}) => {
  const [transactionRef, setTransactionRef] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{
    transactionRef?: string;
    transactionDate?: string;
    phone?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: typeof errors = {};
    if (!transactionRef.trim()) {
      newErrors.transactionRef = "Transaction reference is required";
    }
    if (!transactionDate) {
      newErrors.transactionDate = "Transaction date is required";
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onConfirm({
      transactionRef: transactionRef.trim(),
      transactionDate,
      phone: phone.trim(),
      notes: notes.trim(),
    });
  };

  const handleClose = () => {
    setTransactionRef("");
    setTransactionDate(new Date().toISOString().split("T")[0]);
    setPhone("");
    setNotes("");
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Record Manual Transaction
              </h3>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Amount Display */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  KShs {amount.toLocaleString()}
                </p>
              </div>

              {/* Transaction Reference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter transaction reference"
                  className="input-field"
                  disabled={loading}
                />
                {errors.transactionRef && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.transactionRef}
                  </p>
                )}
              </div>

              {/* Transaction Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transaction Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="input-field"
                  disabled={loading}
                />
                {errors.transactionDate && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.transactionDate}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254..."
                  className="input-field"
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={3}
                  className="input-field"
                  disabled={loading}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  {loading ? "Recording..." : "Record Transaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ManualTransactionModal;
