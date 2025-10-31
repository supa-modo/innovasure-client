/**
 * Generate Settlement Modal
 * Modal for selecting a date to generate a new settlement batch
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCalendar, FiLoader } from "react-icons/fi";
import { TbAlertCircle, TbMoneybag } from "react-icons/tb";

interface GenerateSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (date: string) => Promise<void>;
  loading?: boolean;
}

const GenerateSettlementModal: React.FC<GenerateSettlementModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  loading = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");

  // Handle portal mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate date
    if (!selectedDate) {
      setError("Please select a date");
      return;
    }

    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDateObj > today) {
      setError("Cannot generate settlement for future dates");
      return;
    }

    try {
      await onGenerate(selectedDate);
      handleClose();
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const handleClose = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setError("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 bg-black/50 backdrop-blur-[5px] flex items-center justify-center z-100000 p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="max-w-lg w-full bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-blue-50 px-4 lg:px-5 lg:pt-5 pt-3.5 md:pt-5 pb-3 lg:pb-4">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-linear-to-br from-blue-600 to-indigo-600 p-3 rounded-xl shadow-lg flex items-center justify-center">
                  <FiCalendar size={24} className="text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-blue-900  mb-1">
                      Generate Settlement
                    </h3>
                    <button
                      onClick={handleClose}
                      className="text-gray-600  hover:text-gray-700 transition-colors rounded-full p-1 hover:bg-gray-100/40"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                  <p className="text-sm text-blue-700  leading-relaxed">
                    Select a date to create a new settlement batch
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-blue-900  mb-2">
                    Settlement Date *
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setError("");
                    }}
                    max={new Date().toISOString().split("T")[0]}
                    className="input-field text-gray-900 font-medium"
                    required
                    disabled={loading}
                  />
                  {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium">
                      <TbAlertCircle size={16} />
                      <span>{error}</span>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-blue-600 ">
                    Payments made on this date will be included in the
                    settlement
                  </p>
                </div>

                {/* Info Box */}
                <div className="mt-4 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <TbAlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-amber-900 leading-relaxed">
                        <strong>Note:</strong> A new settlement batch will be
                        created for the selected date. If a batch already exists
                        for this date, an error will be returned.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col md:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="w-full px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full px-5 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <TbMoneybag size={20} />
                        Generate Settlement
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render using portal to ensure it's at the root level
  return createPortal(modalContent, document.body);
};

export default GenerateSettlementModal;
