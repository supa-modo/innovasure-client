/**
 * HorizontalTabs Component
 * Reusable horizontal tab navigation for modals
 */

import React from "react";
import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface HorizontalTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const HorizontalTabs: React.FC<HorizontalTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div
      className={`border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex space-x-1 px-6 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-colors relative ${
              activeTab === tab.id
                ? "text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-t border-l border-r border-gray-200 dark:border-gray-600"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {tab.icon && <span className="mr-2 text-base">{tab.icon}</span>}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HorizontalTabs;
