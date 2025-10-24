/**
 * StatCard Component
 * Reusable card for displaying statistics with optional gradient and icon
 */

import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  bgColor = "bg-white",
  textColor = "text-gray-900",
  className = "",
}) => {
  const cardClasses = gradient
    ? `${gradient} text-white`
    : `${bgColor} ${textColor}`;

  return (
    <div
      className={`rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-lg ${cardClasses} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={`text-sm font-medium mb-2 ${gradient ? "text-white/80" : "text-gray-600"}`}
          >
            {title}
          </p>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p
              className={`text-xs ${gradient ? "text-white/70" : "text-gray-500"}`}
            >
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`p-3 rounded-xl ${gradient ? "bg-white/20" : "bg-gray-100"}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
