import React, { useState } from "react";
import { FiRefreshCw, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { FaRocket, FaSms } from "react-icons/fa";
import {
  clearCache,
  testKCBConnection,
  testSMSService,
} from "../../../services/systemService";
import NotificationModal from "../../../components/ui/NotificationModal";

interface SystemActionsTabProps {
  onRefresh?: () => void;
}

interface ActionState {
  loading: boolean;
  status: "idle" | "success" | "error";
  message: string;
  lastRun: Date | null;
}

const SystemActionsTab: React.FC<SystemActionsTabProps> = () => {
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "info" as "info" | "success" | "error" | "warning",
    title: "",
    message: "",
  });

  const [actions, setActions] = useState<Record<string, ActionState>>({
    clearCache: { loading: false, status: "idle", message: "", lastRun: null },
    testKCB: { loading: false, status: "idle", message: "", lastRun: null },
    testSMS: { loading: false, status: "idle", message: "", lastRun: null },
  });

  const handleClearCache = async () => {
    setActions((prev) => ({
      ...prev,
      clearCache: { ...prev.clearCache, loading: true },
    }));

    try {
      const result = await clearCache();
      setActions((prev) => ({
        ...prev,
        clearCache: {
          loading: false,
          status: "success",
          message: `Cache cleared. ${result.keysRemoved} keys removed.`,
          lastRun: new Date(),
        },
      }));
      setNotification({
        isOpen: true,
        type: "success",
        title: "Cache Cleared",
        message: `Successfully cleared ${result.keysRemoved} keys from Redis cache.`,
      });
    } catch (error: any) {
      setActions((prev) => ({
        ...prev,
        clearCache: {
          loading: false,
          status: "error",
          message: error.message || "Failed to clear cache",
          lastRun: new Date(),
        },
      }));
      setNotification({
        isOpen: true,
        type: "error",
        title: "Cache Clear Failed",
        message: error.message || "Failed to clear cache. Please try again.",
      });
    }
  };

  const handleTestKCB = async () => {
    setActions((prev) => ({
      ...prev,
      testKCB: { ...prev.testKCB, loading: true },
    }));

    try {
      const result = await testKCBConnection();
      setActions((prev) => ({
        ...prev,
        testKCB: {
          loading: false,
          status: result.success ? "success" : "error",
          message: result.message,
          lastRun: new Date(),
        },
      }));
      setNotification({
        isOpen: true,
        type: result.success ? "success" : "warning",
        title: "KCB Connection Test",
        message: result.message,
      });
    } catch (error: any) {
      setActions((prev) => ({
        ...prev,
        testKCB: {
          loading: false,
          status: "error",
          message: error.message || "Test failed",
          lastRun: new Date(),
        },
      }));
      setNotification({
        isOpen: true,
        type: "error",
        title: "Connection Test Failed",
        message: "Failed to test KCB connection. Please check logs.",
      });
    }
  };

  const handleTestSMS = async () => {
    setActions((prev) => ({
      ...prev,
      testSMS: { ...prev.testSMS, loading: true },
    }));

    try {
      const result = await testSMSService();
      setActions((prev) => ({
        ...prev,
        testSMS: {
          loading: false,
          status: result.success ? "success" : "error",
          message: result.message,
          lastRun: new Date(),
        },
      }));
      setNotification({
        isOpen: true,
        type: result.success ? "success" : "warning",
        title: "SMS Service Test",
        message: result.message,
      });
    } catch (error: any) {
      setActions((prev) => ({
        ...prev,
        testSMS: {
          loading: false,
          status: "error",
          message: error.message || "Test failed",
          lastRun: new Date(),
        },
      }));
      setNotification({
        isOpen: true,
        type: "error",
        title: "Service Test Failed",
        message: "Failed to test SMS service. Please check logs.",
      });
    }
  };

  const systemActions = [
    {
      id: "clearCache",
      title: "Clear Redis Cache",
      description:
        "Remove all cached data from Redis. This will clear session data and temporary caches.",
      icon: FiTrash2,
      buttonText: "Clear Cache",
      color: "red",
      handler: handleClearCache,
      state: actions.clearCache,
    },
    {
      id: "testKCB",
      title: "Test KCB Connection",
      description:
        "Verify KCB payment gateway connectivity and authentication status.",
      icon: FaRocket,
      buttonText: "Test Connection",
      color: "blue",
      handler: handleTestKCB,
      state: actions.testKCB,
    },
    {
      id: "testSMS",
      title: "Test SMS Service",
      description: "Check SMS service configuration and connectivity.",
      icon: FaSms,
      buttonText: "Test Service",
      color: "green",
      handler: handleTestSMS,
      state: actions.testSMS,
    },
  ];

  const getStatusIcon = (status: ActionState["status"]) => {
    switch (status) {
      case "success":
        return <FiCheck className="w-5 h-5 text-green-600" />;
      case "error":
        return <FiX className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getButtonColor = (color: string) => {
    const colors: Record<string, string> = {
      red: "bg-red-600 hover:bg-red-700 text-white",
      blue: "bg-blue-600 hover:bg-blue-700 text-white",
      green: "bg-green-600 hover:bg-green-700 text-white",
    };
    return colors[color] || "bg-gray-600 hover:bg-gray-700 text-white";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          System Actions
        </h2>
        <p className="text-sm text-gray-600">
          Perform maintenance tasks and test system services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemActions.map((action) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className="border rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {action.title}
                    </h3>
                    {getStatusIcon(action.state.status)}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{action.description}</p>

              <div className="space-y-2">
                <button
                  onClick={action.handler}
                  disabled={action.state.loading}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${getButtonColor(
                    action.color
                  )}`}
                >
                  {action.state.loading ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  {action.state.loading ? "Processing..." : action.buttonText}
                </button>

                {action.state.message && (
                  <div
                    className={`text-sm p-2 rounded ${
                      action.state.status === "success"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {action.state.message}
                  </div>
                )}

                {action.state.lastRun && (
                  <p className="text-xs text-gray-500">
                    Last run: {action.state.lastRun.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default SystemActionsTab;
