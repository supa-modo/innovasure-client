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
import StatCard from "../ui/StatCard";

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
            <p className="text-sm font-semibold capitalize text-gray-700">
              {row.full_name || "Unknown Agent"}
            </p>
            <p className="text-xs font-semibold text-gray-500/80">
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
          <span className="font-semibold text-gray-600 font-lexend">
            {row.payments}
          </span>
        </div>
      ),
    },
    {
      header: "Commission",
      cell: (row: any) => (
        <div>
          <span className="text-sm font-semibold capitalize text-gray-600">
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
            <p className="text-sm font-semibold capitalize text-gray-700">
              {row.full_name || "Unknown Super-Agent"}
            </p>
            <p className="text-xs font-semibold text-gray-500/80">
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
          <span className="font-semibold text-gray-600 font-lexend">
            {row.agents}
          </span>
        </div>
      ),
    },
    {
      header: "Commission",
      cell: (row: any) => (
        <div>
          <span className="text-sm font-semibold capitalize text-gray-600">
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
          className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] flex items-start justify-end z-50 p-3 font-lexend"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="w-[65%] h-[calc(100vh-20px)] bg-white shadow-2xl overflow-hidden rounded-3xl border border-gray-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                Commission Breakdown
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors rounded-full p-2 hover:bg-gray-100"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Agent Commissions"
                    value={formatCurrency(totalAgentCommissions)}
                    subtitle={`${commissionBreakdown.agents.length} agents`}
                    icon={<PiUserDuotone className="w-8 h-8 text-blue-600" />}
                    bgColor="bg-gradient-to-r from-gray-100 to-gray-200"
                    className="border-gray-300"
                  />

                  <StatCard
                    title="Super-Agent Commissions"
                    value={formatCurrency(totalSuperAgentCommissions)}
                    subtitle={`${commissionBreakdown.super_agents.length} super-agents`}
                    icon={
                      <PiUsersThreeDuotone className="w-8 h-8 text-purple-600" />
                    }
                    bgColor="bg-gradient-to-r from-gray-100 to-gray-200"
                    className="border-gray-300"
                  />

                  <StatCard
                    title="Total Commissions"
                    value={formatCurrency(
                      totalAgentCommissions + totalSuperAgentCommissions
                    )}
                    subtitle="Combined total"
                    icon={
                      <PiCurrencyDollarDuotone className="w-8 h-8 text-green-600" />
                    }
                    bgColor="bg-gradient-to-r from-gray-100 to-gray-200"
                    className="border-gray-300"
                  />
                </div>

                {/* Tables */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Agent Commissions Table */}
                  <div>
                    <div className="bg-white rounded-xl border  overflow-hidden">
                      {commissionBreakdown.agents.length > 0 ? (
                        <DataTable
                          columns={agentColumns}
                          rows={commissionBreakdown.agents}
                          showCheckboxes={false}
                          tableLoading={false}
                        />
                      ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-xl">
                          <PiUserDuotone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="font-medium text-gray-900 mb-2">
                            No agent commissions
                          </h3>
                          <p className="text-gray-500 text-sm">
                            No agent commissions for this settlement
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Super-Agent Commissions Table */}
                  <div>
                    <div className="bg-white rounded-xl border  overflow-hidden">
                      {commissionBreakdown.super_agents.length > 0 ? (
                        <DataTable
                          columns={superAgentColumns}
                          rows={commissionBreakdown.super_agents}
                          showCheckboxes={false}
                          tableLoading={false}
                        />
                      ) : (
                        <div className="text-center py-12 bg-gray-50/50 rounded-xl">
                          <PiUsersThreeDuotone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="font-medium text-gray-900 mb-2">
                            No super-agent commissions
                          </h3>
                          <p className="text-gray-500 text-sm">
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
            <div className="border-t border-gray-200 bg-white px-6 py-4 shrink-0">
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold"
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
