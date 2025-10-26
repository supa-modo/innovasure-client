/**
 * Commission Breakdown Modal
 * Shows detailed commission breakdown for agents and super-agents
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import {
  PiUserDuotone,
  PiUsersThreeDuotone,
  PiCurrencyDollarDuotone,
} from "react-icons/pi";
import DataTable from "../DataTable";

interface CommissionBreakdown {
  agents: Array<{
    id: string;
    full_name: string;
    phone: string;
    payments: number;
    commission: number;
  }>;
  super_agents: Array<{
    id: string;
    full_name: string;
    phone: string;
    agents: number;
    commission: number;
  }>;
}

interface CommissionBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  commissionBreakdown: CommissionBreakdown;
  formatCurrency: (amount: number) => string;
}

const CommissionBreakdownModal: React.FC<CommissionBreakdownModalProps> = ({
  isOpen,
  onClose,
  commissionBreakdown,
  formatCurrency,
}) => {
  if (!isOpen || !commissionBreakdown) return null;

  // Define columns for agent breakdown table
  const agentColumns = [
    {
      header: "Agent Name",
      cell: (row: any) => (
        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm font-semibold capitalize text-gray-700 dark:text-white">
              {row.full_name ||
                `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
                "Unknown Agent"}
            </p>
            <p className="text-xs font-semibold text-gray-500/80 dark:text-gray-400">
              {row.phone || "N/A"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Payments",
      cell: (row: any) => (
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            {row.payments}
          </span>
        </div>
      ),
    },
    {
      header: "Commission",
      cell: (row: any) => (
        <div>
          <span className="text-sm font-semibold capitalize text-green-600 dark:text-green-400">
            {formatCurrency(row.commission)}
          </span>
        </div>
      ),
    },
  ];

  // Define columns for super-agent breakdown table
  const superAgentColumns = [
    {
      header: "Super-Agent Name",
      cell: (row: any) => (
        <div className="flex items-center space-x-2">
          <div>
            <p className="text-sm font-semibold capitalize text-gray-700 dark:text-white">
              {row.full_name ||
                `${row.first_name || ""} ${row.last_name || ""}`.trim() ||
                "Unknown Super-Agent"}
            </p>
            <p className="text-xs font-semibold text-gray-500/80 dark:text-gray-400">
              {row.phone || "N/A"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Agents",
      cell: (row: any) => (
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            {row.agents}
          </span>
        </div>
      ),
    },
    {
      header: "Commission",
      cell: (row: any) => (
        <div>
          <span className="text-sm font-semibold capitalize text-green-600 dark:text-green-400">
            {formatCurrency(row.commission)}
          </span>
        </div>
      ),
    },
  ];

  const totalAgentCommissions = commissionBreakdown.agents.reduce(
    (sum, agent) => sum + agent.commission,
    0
  );

  const totalSuperAgentCommissions = commissionBreakdown.super_agents.reduce(
    (sum, superAgent) => sum + superAgent.commission,
    0
  );

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && commissionBreakdown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] flex items-start justify-end z-50 p-3"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, x: "100%", scale: 1 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: "100%", scale: 1 }}
            transition={{
              x: { duration: 0.4, ease: "easeInOut" },
              opacity: { duration: 0.4, ease: "easeInOut" },
            }}
            className="w-[70%] h-[calc(100vh-20px)] bg-white dark:bg-gray-800 shadow-2xl overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Commission Breakdown
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40 rounded-2xl p-6 border border-gray-300 dark:border-gray-500/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Agent Commissions
                        </p>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                          {formatCurrency(totalAgentCommissions)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {commissionBreakdown.agents.length} agents
                        </p>
                      </div>
                      <div className="bg-gray-500/20 rounded-full p-3">
                        <PiUserDuotone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40 rounded-2xl p-6 border border-gray-300 dark:border-gray-500/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Super-Agent Commissions
                        </p>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                          {formatCurrency(totalSuperAgentCommissions)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {commissionBreakdown.super_agents.length} super-agents
                        </p>
                      </div>
                      <div className="bg-gray-500/20 rounded-full p-3">
                        <PiUsersThreeDuotone className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40 rounded-2xl p-6 border border-gray-300 dark:border-gray-500/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Total Commissions
                        </p>
                        <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                          {formatCurrency(
                            totalAgentCommissions + totalSuperAgentCommissions
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Combined total
                        </p>
                      </div>
                      <div className="bg-gray-500/20 rounded-full p-3">
                        <PiCurrencyDollarDuotone className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tables */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Agent Commissions Table */}
                  <div>
                    <h4 className="px-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                      Agent Commissions
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full">
                        {commissionBreakdown.agents.length}
                      </span>
                    </h4>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {commissionBreakdown.agents.length > 0 ? (
                        <DataTable
                          columns={agentColumns}
                          rows={commissionBreakdown.agents}
                          showCheckboxes={false}
                          tableLoading={false}
                        />
                      ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <PiUserDuotone className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                            No agent commissions
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No agent commissions for this settlement
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Super-Agent Commissions Table */}
                  <div>
                    <h4 className="px-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-4">
                      Super-Agent Commissions
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                        {commissionBreakdown.super_agents.length}
                      </span>
                    </h4>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {commissionBreakdown.super_agents.length > 0 ? (
                        <DataTable
                          columns={superAgentColumns}
                          rows={commissionBreakdown.super_agents}
                          showCheckboxes={false}
                          tableLoading={false}
                        />
                      ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                          <PiUsersThreeDuotone className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                          <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                            No super-agent commissions
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No super-agent commissions for this settlement
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-4 flex-shrink-0">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommissionBreakdownModal;
