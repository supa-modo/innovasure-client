import React from "react";
import { FiCopy, FiTrash2 } from "react-icons/fi";
import { PiChecksBold, PiUsersThreeDuotone } from "react-icons/pi";
import { TbEdit } from "react-icons/tb";
import ToggleSwitch from "../ui/ToggleSwitch";

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  premium_amount: number;
  premium_frequency: "daily" | "weekly" | "monthly" | "annual";
  coverage_amount: number;
  coverage_details: {
    benefits?: string[];
    limitations?: string[];
    terms?: string;
  };
  portions: {
    agent_commission: { type: "fixed" | "percent"; value: number };
    super_agent_commission: { type: "fixed" | "percent"; value: number };
    insurance_share: { type: "fixed" | "percent"; value: number };
    admin_share: { type: "fixed" | "percent"; value: number };
  };
  grace_period_days: number;
  is_active: boolean;
  subscriberCount?: number;
}

interface InsurancePlanCardProps {
  plan: InsurancePlan;
  onPlanAction: (
    action: "view" | "edit" | "duplicate" | "delete",
    planId: string
  ) => void;
  onToggleStatus: (planId: string, isActive: boolean) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const getFrequencyLabel = (frequency: string) => {
  const labels: Record<string, string> = {
    daily: "per day",
    weekly: "per week",
    monthly: "per month",
    annual: "per year",
  };
  return labels[frequency] || frequency;
};

const InsurancePlanCard: React.FC<InsurancePlanCardProps> = ({
  plan,
  onPlanAction,
  onToggleStatus,
}) => {
  const benefits = plan.coverage_details?.benefits || [];

  return (
    <div
      className={`rounded-3xl border-2 p-6 shadow-card hover:shadow-float transition-all duration-300 hover:border-primary-400 relative flex flex-col h-full bg-white border-gray-200 ${
        !plan.is_active ? "opacity-75" : ""
      }`}
    >
      {/* Card Header - Three Part Layout */}
      <div className="relative pb-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Members Count */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-linear-to-r from-blue-100 to-blue-50 rounded-full border border-blue-200/50">
            <PiUsersThreeDuotone className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">
              {plan.subscriberCount?.toLocaleString() || 0} Members
            </span>
          </div>

          {/* Right Side - Status Toggle */}
          <div className="flex items-center space-x-2">
            <span
              className={`text-[0.8rem] font-semibold px-3 ${
                plan.is_active ? "text-green-600" : "text-red-600"
              }`}
            >
              {plan.is_active ? "Active" : "Inactive"}
            </span>
            <ToggleSwitch
              checked={plan.is_active}
              onChange={() => onToggleStatus(plan.id, !plan.is_active)}
              size="default"
              variant={plan.is_active ? "success" : "secondary"}
              title={`Toggle ${plan.is_active ? "inactive" : "active"} status`}
            />
          </div>
        </div>
      </div>

      {/* Center - Plan Name */}
      <div className="flex-1 mb-4">
        <h3 className="text-xl font-bold text-secondary-600 leading-tight mb-2">
          {plan.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
      </div>

      {/* Pricing and Coverage Info */}
      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-2 text-3xl font-extrabold text-primary-600 mb-2">
          <span>{formatCurrency(plan.premium_amount)}</span>
          <div className="text-sm text-gray-500">
            {getFrequencyLabel(plan.premium_frequency)}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <div className="text-sm font-semibold text-gray-500">
            {formatCurrency(plan.coverage_amount)} Coverage
          </div>
          <div className="w-1 h-1 bg-secondary-500 rounded-full"></div>
          <div className="text-sm font-semibold text-gray-500">
            {plan.grace_period_days} Days Grace
          </div>
        </div>
      </div>

      {/* Commissions Breakdown */}
      <div className="w-full border rounded-lg p-4 mb-4 bg-slate-50 border-primary-100/70">
        <h4 className="text-xs font-semibold text-gray-600 mb-2">
          Commission Structure
        </h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">Agent:</span>
            <span className="font-semibold text-gray-900">
              {plan.portions.agent_commission.type === "fixed"
                ? formatCurrency(plan.portions.agent_commission.value)
                : `${plan.portions.agent_commission.value}%`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Super Agent:</span>
            <span className="font-semibold text-gray-900">
              {plan.portions.super_agent_commission.type === "fixed"
                ? formatCurrency(plan.portions.super_agent_commission.value)
                : `${plan.portions.super_agent_commission.value}%`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Insurance:</span>
            <span className="font-semibold text-gray-900">
              {plan.portions.insurance_share.type === "fixed"
                ? formatCurrency(plan.portions.insurance_share.value)
                : `${plan.portions.insurance_share.value}%`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Admin:</span>
            <span className="font-semibold text-gray-900">
              {plan.portions.admin_share.type === "fixed"
                ? formatCurrency(plan.portions.admin_share.value)
                : `${plan.portions.admin_share.value}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      {benefits.length > 0 && (
        <div className="w-full border rounded-lg p-4 mb-6 bg-slate-50 border-primary-100/70">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">
            Coverage Benefits
          </h4>
          <div className="space-y-2">
            {benefits.slice(0, 3).map((benefit, index) => (
              <div key={index} className="flex items-start text-sm">
                <PiChecksBold
                  size={16}
                  className="mt-0.5 text-success-600 mr-2 shrink-0"
                />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
            {benefits.length > 3 && (
              <div className="flex items-center text-sm pl-5">
                <span className="text-blue-500 font-semibold">
                  +{benefits.length - 3} more benefits
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPlanAction("view", plan.id)}
            className="flex-1 px-4 py-3 text-white text-sm font-medium rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 bg-linear-to-r from-primary-600 to-primary-600/90 hover:from-primary-700/80 hover:to-primary-700"
            title="View plan details"
          >
            View Details
          </button>
          <button
            onClick={() => onPlanAction("edit", plan.id)}
            className="p-3 bg-white/80 backdrop-blur-sm text-slate-600 rounded-[0.7rem] border border-slate-200/60 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
            title="Edit plan"
          >
            <TbEdit size={14} />
          </button>
          <button
            onClick={() => onPlanAction("duplicate", plan.id)}
            className="p-3 bg-white/80 backdrop-blur-sm text-slate-600 rounded-[0.7rem] border border-slate-200/60 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all duration-300 shadow-sm hover:shadow-md"
            title="Duplicate plan"
          >
            <FiCopy size={14} />
          </button>
          <button
            onClick={() => onPlanAction("delete", plan.id)}
            className="p-3 bg-white/80 backdrop-blur-sm text-slate-600 rounded-[0.7rem] border border-slate-200/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300 shadow-sm hover:shadow-md"
            title="Delete plan"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsurancePlanCard;
