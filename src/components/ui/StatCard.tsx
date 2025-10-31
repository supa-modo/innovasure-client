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
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
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
  trend,
  trendValue = "",
}) => {
  const cardClasses = gradient
    ? `${gradient} text-white`
    : `${bgColor} ${textColor}`;

  return (
    <div
      className={`rounded-2xl shadow-sm border border-gray-600 px-6 lg:px-4 py-3 transition-all duration-200 hover:shadow-lg ${cardClasses} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={`text-sm font-semibold mb-2 ${gradient ? "text-white/80" : "text-gray-600"}`}
          >
            {title}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-[1.3rem] md:text-2xl lg:text-3xl font-bold font-lexend mb-1">{value}</p>
            {subtitle && (
              <p
                className={`text-xs ${gradient ? "text-white/70" : "text-gray-500"}`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {trend && trendValue && (
            <div
              className={`text-xs flex items-center gap-1 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-600"}`}
            >
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && <div className="p-2">{icon}</div>}
      </div>
    </div>
  );
};

export default StatCard;
