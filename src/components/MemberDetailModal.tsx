import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaXmark } from "react-icons/fa6";
import { FiPhone, FiHash } from "react-icons/fi";
import { MemberWithStatus } from "../services/dashboardService";

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberWithStatus | null;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  if (!member) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "due_today":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Header */}
              <div className="bg-linear-to-br from-blue-600 to-blue-700 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">
                      Member Details
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Account: {member.account_number}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/20"
                    title="Close"
                  >
                    <FaXmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${getStatusColor(
                      member.paymentStatus
                    )}`}
                  >
                    {member.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <h3 className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-3">
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="pb-2 border-b border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Full Name</p>
                        <p className="text-sm font-semibold text-blue-900">
                          {member.full_name}
                        </p>
                      </div>
                      <div className="pb-2 border-b border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                        <div className="flex items-center gap-2">
                          <FiPhone className="w-4 h-4 text-blue-400" />
                          <p className="text-sm font-semibold text-blue-900">
                            {member.phone}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Account Number</p>
                        <div className="flex items-center gap-2">
                          <FiHash className="w-4 h-4 text-blue-400" />
                          <p className="text-sm font-mono font-semibold text-blue-900">
                            {member.account_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  {member.subscription && (
                    <div className="p-4 bg-linear-to-br from-emerald-50 to-white rounded-xl border border-emerald-100">
                      <h3 className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-3">
                        Subscription Details
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Plan Name</p>
                          <p className="text-sm font-semibold text-emerald-900">
                            {member.subscription.plan?.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Premium Amount</p>
                          <p className="text-sm font-semibold text-emerald-900">
                            KSh{" "}
                            {member.subscription.plan?.premium_amount?.toLocaleString()}
                            /{member.subscription.plan?.premium_frequency || "period"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Next Due Date</p>
                          <p className="text-sm font-semibold text-emerald-900">
                            {formatDate(member.subscription.next_due_date)}
                          </p>
                        </div>
                        {member.subscription.last_payment_date && (
                          <div className="pt-2 border-t border-emerald-100">
                            <p className="text-xs text-gray-500 mb-1">Last Payment</p>
                            <p className="text-sm font-semibold text-emerald-900">
                              {formatDate(member.subscription.last_payment_date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* KYC Status */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                      KYC Status
                    </h3>
                    <span
                      className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
                        member.kyc_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : member.kyc_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {member.kyc_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MemberDetailModal;

