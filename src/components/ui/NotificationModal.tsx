import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import {
  TbCheck,
  TbX,
  TbAlertTriangle,
  TbInfoCircle,
  TbTrash,
} from "react-icons/tb";
import { FaExclamation } from "react-icons/fa";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "info" | "success" | "error" | "warning" | "confirm" | "delete";
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
  icon?: React.ComponentType<{ size: number; className?: string }>;
}

const NotificationModal = ({
  isOpen,
  onClose,
  type = "info",
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  showCancel = false,
  autoClose = false,
  autoCloseDelay = 3000,
  icon: CustomIcon,
}: NotificationModalProps) => {
  const [mounted, setMounted] = useState(false);

  // Handle portal mounting
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Auto close effect
  useEffect(() => {
    if (isOpen && autoClose && (type === "success" || type === "info")) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose, type]);

  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CustomIcon || TbCheck,
          iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
          borderColor: "border-emerald-200 dark:border-emerald-700",
          bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
          titleColor: "text-emerald-900 dark:text-emerald-100",
          messageColor: "text-emerald-700 dark:text-emerald-200",
          primaryButton:
            "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800",
        };
      case "error":
        return {
          icon: CustomIcon || TbX,
          iconBg: "bg-gradient-to-br from-red-500 to-red-600",
          borderColor: "border-red-200 dark:border-red-700",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          titleColor: "text-red-900 dark:text-red-100",
          messageColor: "text-red-700 dark:text-red-200",
          primaryButton:
            "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
        };
      case "warning":
        return {
          icon: CustomIcon || TbAlertTriangle,
          iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
          borderColor: "border-amber-200 dark:border-amber-700",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          titleColor: "text-amber-900 dark:text-amber-100",
          messageColor: "text-amber-700 dark:text-amber-200",
          primaryButton:
            "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800",
        };
      case "confirm":
        return {
          icon: CustomIcon || FaExclamation,
          iconBg: "bg-gradient-to-br from-primary-600 to-primary-700",
          borderColor: "border-primary-500 dark:border-primary-800",
          bgColor: "bg-primary-50 dark:bg-primary-900/20",
          titleColor: "text-primary-700 dark:text-primary-200",
          messageColor: "text-primary-700 dark:text-primary-200",
          primaryButton:
            "bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 hover:from-primary-700 hover:to-primary-800",
        };
      case "delete":
        return {
          icon: CustomIcon || TbTrash,
          iconBg: "bg-gradient-to-br from-red-500 to-red-600",
          borderColor: "border-red-200 dark:border-red-700",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          titleColor: "text-red-900 dark:text-red-100",
          messageColor: "text-red-700 dark:text-red-200",
          primaryButton:
            "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
        };
      default: // info
        return {
          icon: CustomIcon || TbInfoCircle,
          iconBg: "bg-gradient-to-br from-gray-500 to-gray-600",
          borderColor: "border-gray-200 dark:border-gray-600",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          titleColor: "text-gray-600 dark:text-gray-300",
          messageColor: "text-gray-500 dark:text-gray-400",
          primaryButton:
            "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !mounted) return null;

  // Create portal content
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 bg-black/50 backdrop-blur-[5px] flex items-center justify-center z-[100000] p-4 lg:p-6"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 ${config.borderColor} overflow-hidden`}
          >
            {/* Header */}
            <div
              className={`${config.bgColor} px-3 md:px-4 lg:px-5 lg:pt-5 pt-3.5 md:pt-5 pb-3 lg:pb-4`}
            >
              <div className="flex items-start gap-4">
                <div className={`${config.iconBg} p-3 rounded-xl shadow-lg`}>
                  <IconComponent size={24} className="text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-base md:text-lg font-bold ${config.titleColor} mb-1`}
                  >
                    {title}
                  </h3>
                  <p
                    className={`text-xs md:text-sm ${config.messageColor} leading-relaxed`}
                  >
                    {message}
                  </p>
                </div>

                {/* Close button (only for non-confirmation modals) */}
                {type !== "confirm" && type !== "delete" && (
                  <button
                    onClick={onClose}
                    className="text-gray-600 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm md:text-base transition-colors rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700/40"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-2 md:gap-3 mt-3 md:mt-6 justify-center">
                {/* Cancel/Secondary Button */}
                {(showCancel || type === "confirm" || type === "delete") && (
                  <button
                    onClick={handleCancel}
                    className="w-full px-5 py-2.5 text-[0.83rem] md:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200"
                  >
                    {cancelText}
                  </button>
                )}

                {/* Primary Button */}
                {type === "confirm" || type === "delete" || onConfirm ? (
                  <button
                    onClick={handleConfirm}
                    className={`w-full px-5 py-2.5 text-[0.83rem] md:text-sm font-semibold text-white rounded-lg transition-all duration-200 shadow-lg ${config.primaryButton}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {type === "delete" ? (
                        <TbTrash size={20} />
                      ) : (
                        <TbCheck size={20} />
                      )}
                      {confirmText}
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className={`w-full px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 shadow-lg ${config.primaryButton}`}
                  >
                    {type === "error" ? "Try Again" : "OK"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render using portal to ensure it's at the root level
  return createPortal(modalContent, document.body);
};

export default NotificationModal;

