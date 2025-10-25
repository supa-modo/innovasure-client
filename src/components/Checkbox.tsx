import React from "react";
import { FaCheck } from "react-icons/fa6";

interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "success" | "danger";
  [key: string]: any;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  className = "",
  size = "md",
  variant = "primary",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center cursor-pointer transition-all duration-200";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  const checkboxSizeClasses = {
    sm: "w-4 h-4",
    md: "w-[1.2rem] md:w-5 h-[1.2rem] md:h-5",
    lg: "w-6 h-6",
  };

  const variantClasses = {
    primary: checked
      ? "bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500"
      : "bg-white border-primary-400 dark:bg-gray-700 dark:border-gray-600",
    secondary: checked
      ? "bg-red-600 border-red-600 dark:bg-red-500 dark:border-red-500"
      : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600",
    success: checked
      ? "bg-green-600 border-green-600 dark:bg-green-500 dark:border-green-500"
      : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600",
    danger: checked
      ? "bg-red-600 border-red-600 dark:bg-red-500 dark:border-red-500"
      : "bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600",
  };

  const iconSizeClasses = {
    sm: "w-3 h-3",
    md: "w-3 md:w-3.5 h-3 md:h-3.5",
    lg: "w-5 h-5",
  };

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`${baseClasses} ${disabledClasses} ${className}`}
      onClick={handleClick}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {}} // We handle the change via onClick
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <div
          className={`
            ${checkboxSizeClasses[size]} 
            ${variantClasses[variant]}
            border-2 rounded-[0.35rem] md:rounded-md flex items-center justify-center transition-all duration-200
            hover:shadow-md focus:outline-none focus:ring-1 focus:ring-offset-1
            ${
              checked
                ? "focus:ring-primary-500 dark:focus:ring-primary-400 border-primary-500/80 dark:border-primary-400"
                : "focus:ring-gray-500 dark:focus:ring-gray-400 border-gray-400/80 dark:border-gray-600"
            }
            ${disabled ? "opacity-50" : ""}
          `}
        >
          {checked && (
            <FaCheck
              className={`${iconSizeClasses[size]} text-white dark:text-white`}
            />
          )}
        </div>
      </div>
      {label && (
        <label className={`ml-3 dark:text-gray-300 select-none`}>{label}</label>
      )}
    </div>
  );
};

export default Checkbox;
