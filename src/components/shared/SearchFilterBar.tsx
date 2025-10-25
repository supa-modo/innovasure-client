/**
 * Search Filter Bar Component
 * Reusable search and filter controls
 */

import { useState, useEffect } from "react";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  filterValues?: Record<string, string>;
  onFilterChange?: (filters: Record<string, string>) => void;
  onClearFilters?: () => void;
  onExport?: () => void;
  showExport?: boolean;
  placeholder?: string;
  className?: string;
}

const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  onExport,
  showExport = false,
  placeholder = "Search...",
  className = "",
}: SearchFilterBarProps) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearchChange]);

  const hasActiveFilters = Object.values(filterValues).some(
    (value) => value !== ""
  );

  const handleClearFilters = () => {
    setDebouncedSearch("");
    onClearFilters?.();
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 ${className}`}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={debouncedSearch}
            onChange={(e) => setDebouncedSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <select
            key={filter.key}
            value={filterValues[filter.key] || ""}
            onChange={(e) =>
              onFilterChange?.({
                ...filterValues,
                [filter.key]: e.target.value,
              })
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <FiX className="w-4 h-4" />
            Clear
          </button>
        )}

        {/* Export Button */}
        {showExport && onExport && (
          <button
            onClick={onExport}
            className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2"
          >
            <FiFilter className="w-4 h-4" />
            Export
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilterBar;
