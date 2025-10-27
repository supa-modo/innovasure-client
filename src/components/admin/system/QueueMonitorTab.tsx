import React from "react";
import { FiRefreshCw } from "react-icons/fi";
import { QueueStats, SystemMetrics } from "../../../services/systemService";

interface QueueMonitorTabProps {
  queueData: QueueStats | null;
  metricsData?: SystemMetrics | null;
}

const QueueMonitorTab: React.FC<QueueMonitorTabProps> = ({
  queueData,
  metricsData: _metricsData,
}) => {
  if (!queueData) {
    return (
      <div className="p-6 text-center text-gray-500">
        No queue data available
      </div>
    );
  }

  const getQueueColor = (name: string) => {
    const colors: Record<string, string> = {
      webhooks: "bg-blue-50 border-blue-200 text-blue-800",
      settlements: "bg-green-50 border-green-200 text-green-800",
      payouts: "bg-purple-50 border-purple-200 text-purple-800",
      reconciliation: "bg-orange-50 border-orange-200 text-orange-800",
    };
    return colors[name] || "bg-gray-50 border-gray-200 text-gray-800";
  };

  const getTotalJobs = (queue: any) => {
    return (queue.waiting || 0) + (queue.active || 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Queue Status</h2>
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <FiRefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(queueData).map(([queueName, stats]) => (
          <div
            key={queueName}
            className={`border-2 rounded-lg p-6 ${getQueueColor(queueName)}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">{queueName}</h3>
              <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold">
                Total: {getTotalJobs(stats)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  Waiting
                </span>
                <span className="text-lg font-bold">{stats.waiting || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  Active
                </span>
                <span className="text-lg font-bold">{stats.active || 0}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  Completed
                </span>
                <span className="text-lg font-bold">
                  {stats.completed || 0}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  Failed
                </span>
                <span className="text-lg font-bold">{stats.failed || 0}</span>
              </div>
            </div>

            {/* Progress bar */}
            {stats.completed > 0 && (
              <div className="mt-4">
                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${
                        ((stats.completed || 0) /
                          (stats.waiting +
                            stats.active +
                            stats.completed +
                            stats.failed)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {((stats.completed || 0) /
                    (stats.waiting +
                      stats.active +
                      stats.completed +
                      stats.failed)) *
                    100}
                  % completion rate
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Queue Actions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Queue Actions
        </h3>
        <p className="text-sm text-gray-600">
          Queue management features will be available in a future update.
        </p>
      </div>
    </div>
  );
};

export default QueueMonitorTab;
