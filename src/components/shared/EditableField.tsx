/**
 * EditableField Component
 * Reusable inline editing field component
 */

import React, { useState } from "react";
import { FiEdit3, FiSave, FiX } from "react-icons/fi";

interface EditableFieldProps {
  label: string;
  value: string | number;
  type?: "text" | "email" | "tel" | "number" | "date" | "textarea";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onSave: (value: string | number) => Promise<void>;
  validate?: (value: string) => string | null;
  format?: (value: string | number) => string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  className = "",
  onSave,
  validate,
  format,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    if (disabled) return;
    setEditValue(String(value));
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(String(value));
    setError(null);
  };

  const handleSave = async () => {
    if (loading) return;

    // Validate if validator provided
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Check if value actually changed
    if (editValue === String(value)) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const displayValue = format ? format(value) : String(value);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {isEditing ? (
        <div className="space-y-2">
          {type === "textarea" ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
              rows={3}
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
            />
          )}

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <FiSave className="w-3 h-3" />
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiX className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between group">
          <div className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600">
            {displayValue || (
              <span className="text-gray-500 dark:text-gray-400">
                Not provided
              </span>
            )}
          </div>
          {!disabled && (
            <button
              onClick={handleEdit}
              className="ml-2 p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Edit"
            >
              <FiEdit3 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableField;
