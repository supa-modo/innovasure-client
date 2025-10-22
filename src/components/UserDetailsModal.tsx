import React, { useState, useEffect } from "react";
import {
  FiX,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiCreditCard,
  FiUsers,
  FiFileText,
} from "react-icons/fi";
import { getUserDetails } from "../services/userService";
import { adminResetPassword } from "../services/passwordService";

interface UserDetailsModalProps {
  userId: string;
  userType: "member" | "agent" | "super_agent";
  isOpen: boolean;
  onClose: () => void;
}

interface UserDetails {
  user: {
    id: string;
    role: string;
    email?: string;
    phone: string;
    profile: Record<string, any>;
    status: string;
    created_at: string;
    updated_at: string;
    last_login_at?: string;
  };
  roleData: any;
  dependants: any[];
  subscriptions: any[];
  paymentHistory: any[];
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  userType,
  isOpen,
  onClose,
}) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const details = await getUserDetails(userId);
      setUserDetails(details);
    } catch (err: any) {
      setError(err.message || "Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!userDetails) return;

    setResettingPassword(true);
    try {
      const result = await adminResetPassword(userId);
      setTempPassword(result.tempPassword || null);
      setShowTempPassword(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                User Details
              </h2>
              <p className="text-sm text-gray-500">
                {userType.charAt(0).toUpperCase() + userType.slice(1)}{" "}
                Information
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading user details...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <FiX className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                  <button
                    onClick={fetchUserDetails}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : userDetails ? (
              <div className="flex h-full">
                {/* Sidebar */}
                <div className="w-64 border-r border-gray-200 bg-gray-50">
                  <nav className="p-4">
                    <div className="space-y-1">
                      {[
                        { id: "overview", label: "Overview", icon: FiUser },
                        {
                          id: "personal",
                          label: "Personal Info",
                          icon: FiUser,
                        },
                        ...(userType === "member"
                          ? [
                              {
                                id: "dependants",
                                label: "Dependants",
                                icon: FiUsers,
                              },
                              {
                                id: "subscription",
                                label: "Subscription",
                                icon: FiCreditCard,
                              },
                              {
                                id: "payments",
                                label: "Payment History",
                                icon: FiFileText,
                              },
                            ]
                          : []),
                        { id: "admin", label: "Admin Actions", icon: FiShield },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                              activeTab === tab.id
                                ? "bg-blue-100 text-blue-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            <Icon className="mr-3 h-4 w-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Account Overview
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Status
                              </label>
                              <p
                                className={`text-sm font-medium ${
                                  userDetails.user.status === "active"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {userDetails.user.status
                                  .charAt(0)
                                  .toUpperCase() +
                                  userDetails.user.status.slice(1)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Role
                              </label>
                              <p className="text-sm text-gray-900">
                                {userDetails.user.role.charAt(0).toUpperCase() +
                                  userDetails.user.role.slice(1)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Created
                              </label>
                              <p className="text-sm text-gray-900">
                                {formatDate(userDetails.user.created_at)}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Last Login
                              </label>
                              <p className="text-sm text-gray-900">
                                {userDetails.user.last_login_at
                                  ? formatDate(userDetails.user.last_login_at)
                                  : "Never"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {userType === "member" &&
                          userDetails.subscriptions.length > 0 && (
                            <div className="rounded-lg border border-gray-200 bg-white p-6">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Current Subscription
                              </h3>
                              {userDetails.subscriptions.map((subscription) => (
                                <div
                                  key={subscription.id}
                                  className="border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium text-gray-900">
                                        {subscription.plan?.name}
                                      </h4>
                                      <p className="text-sm text-gray-500">
                                        Premium:{" "}
                                        {formatCurrency(
                                          subscription.plan?.premium_amount || 0
                                        )}{" "}
                                        / {subscription.plan?.premium_frequency}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Coverage:{" "}
                                        {formatCurrency(
                                          subscription.plan?.coverage_amount ||
                                            0
                                        )}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        subscription.status === "active"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {subscription.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    )}

                    {/* Personal Info Tab */}
                    {activeTab === "personal" && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Contact Information
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center">
                              <FiPhone className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <label className="text-sm font-medium text-gray-500">
                                  Phone
                                </label>
                                <p className="text-sm text-gray-900">
                                  {userDetails.user.phone}
                                </p>
                              </div>
                            </div>
                            {userDetails.user.email && (
                              <div className="flex items-center">
                                <FiMail className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Email
                                  </label>
                                  <p className="text-sm text-gray-900">
                                    {userDetails.user.email}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {userDetails.roleData && (
                          <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              {userType === "member"
                                ? "Member Details"
                                : userType === "agent"
                                  ? "Agent Details"
                                  : "Super Agent Details"}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              {userDetails.roleData.full_name && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Full Name
                                  </label>
                                  <p className="text-sm text-gray-900">
                                    {userDetails.roleData.full_name}
                                  </p>
                                </div>
                              )}
                              {userDetails.roleData.account_number && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Account Number
                                  </label>
                                  <p className="text-sm text-gray-900">
                                    {userDetails.roleData.account_number}
                                  </p>
                                </div>
                              )}
                              {userDetails.roleData.code && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    Code
                                  </label>
                                  <p className="text-sm text-gray-900">
                                    {userDetails.roleData.code}
                                  </p>
                                </div>
                              )}
                              {userDetails.roleData.kyc_status && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">
                                    KYC Status
                                  </label>
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                      userDetails.roleData.kyc_status ===
                                      "approved"
                                        ? "bg-green-100 text-green-800"
                                        : userDetails.roleData.kyc_status ===
                                            "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {userDetails.roleData.kyc_status}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dependants Tab */}
                    {activeTab === "dependants" && userType === "member" && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Dependants
                          </h3>
                          {userDetails.dependants.length > 0 ? (
                            <div className="space-y-4">
                              {userDetails.dependants.map((dependant) => (
                                <div
                                  key={dependant.id}
                                  className="border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Name
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {dependant.full_name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Relationship
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {dependant.relationship}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Date of Birth
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {formatDate(dependant.date_of_birth)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        ID Number
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {dependant.id_number}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No dependants registered
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Subscription Tab */}
                    {activeTab === "subscription" && userType === "member" && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Subscription Details
                          </h3>
                          {userDetails.subscriptions.length > 0 ? (
                            <div className="space-y-4">
                              {userDetails.subscriptions.map((subscription) => (
                                <div
                                  key={subscription.id}
                                  className="border border-gray-200 rounded-lg p-4"
                                >
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Plan Name
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {subscription.plan?.name}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Status
                                      </label>
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                                          subscription.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {subscription.status}
                                      </span>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Premium Amount
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {formatCurrency(
                                          subscription.plan?.premium_amount || 0
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Frequency
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {subscription.plan?.premium_frequency}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Coverage Amount
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {formatCurrency(
                                          subscription.plan?.coverage_amount ||
                                            0
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500">
                                        Start Date
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {formatDate(subscription.start_date)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No active subscriptions
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Payment History Tab */}
                    {activeTab === "payments" && userType === "member" && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Payment History
                          </h3>
                          {userDetails.paymentHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Reference
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {userDetails.paymentHistory.map((payment) => (
                                    <tr key={payment.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(payment.created_at)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatCurrency(payment.amount)}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            payment.status === "completed"
                                              ? "bg-green-100 text-green-800"
                                              : payment.status === "pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-red-100 text-red-800"
                                          }`}
                                        >
                                          {payment.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {payment.reference_number}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              No payment history available
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Admin Actions Tab */}
                    {activeTab === "admin" && (
                      <div className="space-y-6">
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Admin Actions
                          </h3>

                          {/* Password Reset Section */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">
                              Password Reset
                            </h4>
                            <p className="text-sm text-gray-500 mb-4">
                              Generate a temporary password for this user. They
                              will be required to change it on their next login.
                            </p>

                            {showTempPassword && tempPassword ? (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h5 className="font-medium text-yellow-800">
                                      Temporary Password Generated
                                    </h5>
                                    <p className="text-sm text-yellow-700 mt-1">
                                      Please provide this password to the user
                                      securely.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setShowTempPassword(false)}
                                    className="text-yellow-600 hover:text-yellow-800"
                                  >
                                    <FiX className="h-5 w-5" />
                                  </button>
                                </div>
                                <div className="mt-3 flex items-center space-x-2">
                                  <code className="flex-1 bg-white border border-yellow-300 rounded px-3 py-2 text-sm font-mono">
                                    {tempPassword}
                                  </code>
                                  <button
                                    onClick={() =>
                                      navigator.clipboard.writeText(
                                        tempPassword
                                      )
                                    }
                                    className="px-3 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                                  >
                                    Copy
                                  </button>
                                </div>
                                <p className="text-xs text-yellow-600 mt-2">
                                  ⚠️ User must change this password on their
                                  next login
                                </p>
                              </div>
                            ) : (
                              <button
                                onClick={handlePasswordReset}
                                disabled={resettingPassword}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {resettingPassword ? (
                                  <>
                                    <FiRefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <FiRefreshCw className="-ml-1 mr-2 h-4 w-4" />
                                    Reset Password
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
