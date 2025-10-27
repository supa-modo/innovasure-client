import React from "react";
import { SystemMetrics } from "../../../services/systemService";

interface MetricsTabProps {
  metricsData: SystemMetrics | null;
}

const MetricsTab: React.FC<MetricsTabProps> = ({ metricsData }) => {
  if (!metricsData) {
    return (
      <div className="p-6 text-center text-gray-500">
        No metrics data available
      </div>
    );
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* System Resources */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Memory Usage
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                {metricsData.system.memory.percentage}%
              </span>
              <span className="text-sm text-gray-600">
                {formatBytes(metricsData.system.memory.used)} /{" "}
                {formatBytes(metricsData.system.memory.total)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                style={{
                  width: `${metricsData.system.memory.percentage}%`,
                }}
              ></div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              CPU Load (1-minute average)
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {metricsData.system.cpu.toFixed(2)}
              </span>
              <span className="text-sm text-gray-600">load average</span>
            </div>
          </div>
        </div>
      </div>

      {/* Process Memory */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Process Memory
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 bg-blue-50">
            <p className="text-sm text-gray-600 mb-1">Heap Used</p>
            <p className="text-lg font-bold text-blue-900">
              {formatBytes(metricsData.system.process.heapUsed)}
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-green-50">
            <p className="text-sm text-gray-600 mb-1">Heap Total</p>
            <p className="text-lg font-bold text-green-900">
              {formatBytes(metricsData.system.process.heapTotal)}
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-purple-50">
            <p className="text-sm text-gray-600 mb-1">External</p>
            <p className="text-lg font-bold text-purple-900">
              {formatBytes(metricsData.system.process.external)}
            </p>
          </div>
          <div className="border rounded-lg p-4 bg-orange-50">
            <p className="text-sm text-gray-600 mb-1">RSS</p>
            <p className="text-lg font-bold text-orange-900">
              {formatBytes(metricsData.system.process.rss)}
            </p>
          </div>
        </div>
      </div>

      {/* Queue Statistics */}
      {metricsData.queues && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Queue Statistics
          </h2>
          <div className="space-y-3">
            {Object.entries(metricsData.queues).map(([queueName, stats]) => (
              <div key={queueName} className="border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 capitalize mb-3">
                  {queueName}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Waiting</p>
                    <p className="text-lg font-bold text-yellow-600">
                      {stats.waiting || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Active</p>
                    <p className="text-lg font-bold text-blue-600">
                      {stats.active || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Completed</p>
                    <p className="text-lg font-bold text-green-600">
                      {stats.completed || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Failed</p>
                    <p className="text-lg font-bold text-red-600">
                      {stats.failed || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsTab;
