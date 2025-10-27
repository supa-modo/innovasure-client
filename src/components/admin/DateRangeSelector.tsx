import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DateRangeSelectorProps {
  onRangeChange: (days: number) => void;
  selectedDays: number;
}

const presets = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 12 months", days: 365 },
  { label: "Custom", days: 0 },
];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  onRangeChange,
  selectedDays,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedPreset = presets.find((p) => p.days === selectedDays);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center space-x-2 font-medium text-gray-700 transition-colors"
      >
        <span>📅</span>
        <span>{selectedPreset?.label || `${selectedDays} days`}</span>
        <span className="text-gray-400">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[180px]"
          >
            {presets.map((preset) => (
              <button
                key={preset.days}
                onClick={() => {
                  if (preset.days > 0) {
                    onRangeChange(preset.days);
                    setIsOpen(false);
                  }
                  // Custom date picker can be implemented here
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  selectedDays === preset.days
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default DateRangeSelector;
