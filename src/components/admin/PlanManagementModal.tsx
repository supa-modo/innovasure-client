import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit3 } from "react-icons/fi";
import { PiShieldDuotone, PiCurrencyDollarDuotone } from "react-icons/pi";
import { MdDescription } from "react-icons/md";
import { FaXmark } from "react-icons/fa6";
import { RiAddLine } from "react-icons/ri";
import { useForm } from "react-hook-form";
import NotificationModal from "../ui/NotificationModal";
import {
  InsurancePlan,
  CreatePlanData,
  createPlan,
  updatePlan,
} from "../../services/insurancePlansService";

interface PlanManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: InsurancePlan | null;
  mode: "add" | "edit";
  onSave: (data: any) => void;
}

interface PlanFormData extends CreatePlanData {}

const PlanManagementModal: React.FC<PlanManagementModalProps> = ({
  isOpen,
  onClose,
  plan,
  mode = "add",
  onSave,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PlanFormData>();

  const [loading, setLoading] = useState(false);
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
    onConfirm: undefined as (() => void) | undefined,
  });

  // Initialize form data
  useEffect(() => {
    if (plan && mode === "edit") {
      // Populate form with plan data
      setValue("name", plan.name);
      setValue("description", plan.description);
      setValue("premium_amount", plan.premium_amount);
      setValue("premium_frequency", plan.premium_frequency);
      setValue("coverage_amount", plan.coverage_amount);
      setValue("grace_period_days", plan.grace_period_days);
      setValue("is_active", plan.is_active);
      setValue("coverage_details", plan.coverage_details);
      setValue("portions", plan.portions);
    } else {
      // Reset form for new plan
      reset({
        name: "",
        description: "",
        premium_amount: 0,
        premium_frequency: "daily",
        coverage_amount: 0,
        grace_period_days: 3,
        is_active: true,
        coverage_details: { benefits: [], limitations: [], terms: "" },
        portions: {
          agent_commission: { type: "fixed", value: 0 },
          super_agent_commission: { type: "fixed", value: 0 },
          insurance_share: { type: "percent", value: 75 },
          admin_share: { type: "percent", value: 0 },
        },
      });
    }
  }, [plan, mode, setValue, reset]);

  const onSubmit = async (data: PlanFormData) => {
    setLoading(true);
    try {
      if (mode === "edit" && plan) {
        // Update existing plan
        const updated = await updatePlan(plan.id, data);
        setNotification({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "Insurance plan updated successfully",
          onConfirm: undefined,
        });
        onSave(updated);
      } else {
        // Create new plan
        const newPlan = await createPlan(data);
        setNotification({
          isOpen: true,
          type: "success",
          title: "Success",
          message: "Insurance plan created successfully",
          onConfirm: undefined,
        });
        onSave(newPlan);
      }
      onClose();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: "error",
        title: "Error",
        message: error.response?.data?.error || `Failed to ${mode} plan`,
        onConfirm: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const closeModal = () => {
    onClose();
    reset();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] flex items-start justify-end z-50 p-3 font-lexend"
            onClick={handleBackdropClick}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-[900px] h-[calc(100vh-20px)] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="px-6 pt-4 relative">
                <div className="relative flex justify-between items-start z-10 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center p-1.5">
                    <div className="mr-4">
                      <PiShieldDuotone size={40} className="text-blue-600" />
                    </div>
                    <div className="ml-2 flex items-center gap-2">
                      <h2 className="text-gray-900 dark:text-white font-semibold text-xl font-lexend">
                        {mode === "edit"
                          ? "Edit Insurance Plan"
                          : "Create New Insurance Plan"}
                      </h2>
                      <div className="w-0.5 h-4 ml-3 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-lexend">
                        Manage insurance coverage and premium structure
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-red-500 hover:text-red-500 transition-colors rounded-full p-1 hover:bg-red-100"
                    title="Close"
                  >
                    <FaXmark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-130px)]"
              >
                <div className="overflow-y-auto flex-1 px-6 py-5">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <PiShieldDuotone className="w-5 h-5 mr-2 text-blue-600" />
                        Basic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Plan Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("name", {
                              required: "Plan name is required",
                            })}
                            type="text"
                            className={`w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.name
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                            }`}
                            placeholder="e.g., Daily Basic Coverage"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <textarea
                            {...register("description")}
                            rows={3}
                            className="w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="Brief description of the plan"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Premium Amount (KES){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("premium_amount", {
                              required: "Premium amount is required",
                              valueAsNumber: true,
                              min: {
                                value: 1,
                                message: "Amount must be positive",
                              },
                            })}
                            type="number"
                            step="0.01"
                            className={`w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.premium_amount
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                            }`}
                            placeholder="20.00"
                          />
                          {errors.premium_amount && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.premium_amount.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Frequency <span className="text-red-500">*</span>
                          </label>
                          <select
                            {...register("premium_frequency", {
                              required: "Frequency is required",
                            })}
                            className="w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="annual">Annual</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Coverage Amount (KES){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            {...register("coverage_amount", {
                              required: "Coverage amount is required",
                              valueAsNumber: true,
                              min: {
                                value: 1,
                                message: "Amount must be positive",
                              },
                            })}
                            type="number"
                            step="0.01"
                            className={`w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors ${
                              errors.coverage_amount
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600 focus:border-blue-500"
                            }`}
                            placeholder="50000.00"
                          />
                          {errors.coverage_amount && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.coverage_amount.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Grace Period (Days)
                          </label>
                          <input
                            {...register("grace_period_days", {
                              valueAsNumber: true,
                            })}
                            type="number"
                            min="0"
                            className="w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                          />
                        </div>

                        <div className="flex items-center">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              {...register("is_active")}
                              type="checkbox"
                              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Active Plan
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Coverage Details */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <MdDescription className="w-5 h-5 mr-2 text-green-600" />
                        Coverage Details
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Benefits (JSON Format)
                          </label>
                          <textarea
                            {...register("coverage_details.benefits")}
                            rows={3}
                            className="w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder='["Medical expenses", "Accident coverage", "Emergency services"]'
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Limitations (JSON Format)
                          </label>
                          <textarea
                            {...register("coverage_details.limitations")}
                            rows={3}
                            className="w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder='["Pre-existing conditions", "Cosmetic procedures"]'
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Terms & Conditions
                          </label>
                          <textarea
                            {...register("coverage_details.terms")}
                            rows={4}
                            className="w-full font-lexend text-sm bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="Enter terms and conditions..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Commission Structure */}
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <PiCurrencyDollarDuotone className="w-5 h-5 mr-2 text-purple-600" />
                        Commission Structure
                      </h3>
                      <div className="space-y-4">
                        {[
                          "agent_commission",
                          "super_agent_commission",
                          "insurance_share",
                          "admin_share",
                        ].map((key) => (
                          <div
                            key={key}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                              {key
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                            <div>
                              <select
                                {...register(`portions.${key}.type` as any)}
                                className="w-full font-lexend text-sm bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-500 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                              >
                                <option value="fixed">Fixed (KES)</option>
                                <option value="percent">Percentage (%)</option>
                              </select>
                            </div>
                            <div>
                              <input
                                {...register(`portions.${key}.value` as any, {
                                  required: "Value is required",
                                  valueAsNumber: true,
                                  min: {
                                    value: 0,
                                    message: "Must be non-negative",
                                  },
                                })}
                                type="number"
                                step="0.01"
                                className="w-full font-lexend text-sm bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 font-medium rounded-lg border border-gray-300 dark:border-gray-500 px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-4">
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : mode === "edit" ? (
                        <FiEdit3 className="mr-2 h-4 w-4" />
                      ) : (
                        <RiAddLine className="mr-2 h-4 w-4" />
                      )}
                      {loading
                        ? "Saving..."
                        : mode === "edit"
                          ? "Update Plan"
                          : "Create Plan"}
                    </button>
                  </div>
                </div>
              </form>
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
        onConfirm={notification.onConfirm}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </>
  );
};

export default PlanManagementModal;
