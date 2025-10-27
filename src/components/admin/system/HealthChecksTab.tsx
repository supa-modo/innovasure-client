import React from "react";
import { FiCheckCircle, FiAlertCircle, FiXCircle } from "react-icons/fi";
import { TbDatabase, TbServer } from "react-icons/tb";
import { FaRocket, FaSms } from "react-icons/fa";
import { SystemHealth } from "../../../services/systemService";

interface HealthChecksTabProps {
  healthData: SystemHealth | null;
}

const HealthChecksTab: React.FC<HealthChecksTabProps> = ({ healthData }) => {
  if (!healthData) {
    return (
      <div className="p-6 text-center text-gray-500">
        No health data available
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <FiCheckCircle className="w-6 h-6 text-green-600" />;
      case "degraded":
        return <FiAlertCircle className="w-6 h-6 text-yellow-600" />;
      case "critical":
        return <FiXCircle className="w-6 h-6 text-red-600" />;
      default:
        return <FiCheckCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getServiceIcon = (service: string) => {
    const icons: Record<string, any> = {
      database: TbDatabase,
      redis: TbServer,
      kcb: FaRocket,
      sms: FaSms,
      queues: TbServer,
    };
    const IconComponent = icons[service] || TbServer;
    return <IconComponent className="w-8 h-8 text-gray-600" />;
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Service Health Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(healthData.services).map(([service, data]) => (
          <div
            key={service}
            className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getServiceIcon(service)}
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {service}
                </h3>
              </div>
              {getStatusIcon(data.status)}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold capitalize">{data.status}</span>
              </div>

              {"responseTime" in data && data.responseTime && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-semibold">{data.responseTime}ms</span>
                </div>
              )}

              {data.details && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-2">Details:</p>
                  <div className="bg-gray-50 rounded p-3">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(data.details, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthChecksTab;
