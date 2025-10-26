/**
 * StatusBadge Component
 * Reusable badge for displaying payment and compliance status
 */

import React from "react";

type PaymentStatus = "paid" | "due_today" | "overdue" | "upcoming";

interface StatusBadgeProps {
  type: "payment" | "compliance";
  status?: PaymentStatus;
  complianceRate?: number;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  complianceRate,
  className = "",
}) => {
  if (type === "payment" && status) {
    const colors = {
      paid: "bg-green-100 text-green-800 border-green-200",
      upcoming: "bg-blue-100 text-blue-800 border-blue-200",
      due_today: "bg-yellow-100 text-yellow-800 border-yellow-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
    };

    const labels = {
      paid: "Paid",
      upcoming: "Upcoming",
      due_today: "Due Today",
      overdue: "Overdue",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colors[status]} ${className}`}
      >
        {labels[status]}
      </span>
    );
  }

  if (type === "compliance" && complianceRate !== undefined) {
    let colors: string;
    let label: string;

    if (complianceRate >= 90) {
      colors = "bg-green-100 text-green-800 border-green-200";
      label = "Excellent";
    } else if (complianceRate >= 70) {
      colors = "bg-yellow-100 text-yellow-800 border-yellow-200";
      label = "Good";
    } else {
      colors = "bg-red-100 text-red-800 border-red-200";
      label = "Needs Attention";
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colors} ${className}`}
      >
        {complianceRate}% - {label}
      </span>
    );
  }

  return null;
};

export default StatusBadge;
