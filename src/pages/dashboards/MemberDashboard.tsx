import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import ManageDependantsModal from "../../components/ManageDependantsModal";
import { getUserDetails } from "../../services/userService";
import {
  getMemberPaymentHistory,
  PaymentTransaction,
} from "../../services/paymentService";

const MemberDashboard = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDependantsModal, setShowDependantsModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>(
    []
  );
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await getUserDetails(user.id);
      setProfileData(data);

      // Fetch payment history if member data is available
      if (data?.roleData?.id) {
        await fetchPaymentHistory(data.roleData.id);
      }
    } catch (err: any) {
      console.error("Failed to fetch profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (memberId: string) => {
    setPaymentLoading(true);
    try {
      const response = await getMemberPaymentHistory(memberId);
      setPaymentHistory(response.payments);
    } catch (err: any) {
      console.error("Failed to fetch payment history:", err);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleMakePayment = () => {
    // TODO: Implement payment flow
    alert("Payment functionality will be implemented soon!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getNextDueDate = (subscription: any) => {
    if (subscription.next_due_date) {
      return formatDate(subscription.next_due_date);
    }
    return "Not set";
  };

  if (loading) {
    return (
      <DashboardLayout role="member" user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const subscription = profileData?.subscriptions?.[0];
  const memberData = profileData?.roleData;

  return (
    <DashboardLayout role="member" user={user} onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.full_name || "Member"}!
          </h1>
          <p className="text-gray-600">
            Manage your insurance coverage and payments
          </p>
        </div>

        {/* Insurance Plan Details */}
        {subscription && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Insurance Plan
              </h2>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  subscription.status === "active"
                    ? "bg-green-100 text-green-800"
                    : subscription.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {subscription.status.charAt(0).toUpperCase() +
                  subscription.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Plan Name
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {subscription.plan?.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Premium Amount
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  KSh {subscription.plan?.premium_amount?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {subscription.plan?.premium_frequency}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Coverage Amount
                </p>
                <p className="text-lg font-semibold text-green-600">
                  KSh {subscription.plan?.coverage_amount?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Next Payment Due
                </p>
                <p className="text-lg font-semibold text-orange-600">
                  {getNextDueDate(subscription)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleMakePayment}
            className="p-6 bg-blue-50 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:bg-blue-100 transition-all duration-200 text-left group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              💳
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Make Payment</h3>
            <p className="text-sm text-gray-600">Pay your premium via M-Pesa</p>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="p-6 bg-green-50 border-2 border-green-200 rounded-xl hover:border-green-400 hover:bg-green-100 transition-all duration-200 text-left group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              👤
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Go to Profile</h3>
            <p className="text-sm text-gray-600">View and edit your profile</p>
          </button>

          <button
            onClick={() => setShowDependantsModal(true)}
            className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:bg-purple-100 transition-all duration-200 text-left group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              👨‍👩‍👧‍👦
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Manage Dependants
            </h3>
            <p className="text-sm text-gray-600">Add or edit family members</p>
          </button>

          <button
            onClick={handleLogout}
            className="p-6 bg-red-50 border-2 border-red-200 rounded-xl hover:border-red-400 hover:bg-red-100 transition-all duration-200 text-left group"
          >
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              🚪
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Logout</h3>
            <p className="text-sm text-gray-600">Sign out of your account</p>
          </button>
        </div>

        {/* Account Information */}
        {memberData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Account Number
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {memberData.account_number}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">KYC Status</p>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    memberData.kyc_status === "approved"
                      ? "bg-green-100 text-green-800"
                      : memberData.kyc_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {memberData.kyc_status.charAt(0).toUpperCase() +
                    memberData.kyc_status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Payment History
            </h2>
            {paymentHistory.length > 0 && (
              <span className="text-sm text-gray-500">
                {paymentHistory.length} payment
                {paymentHistory.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {paymentLoading ? (
            <div className="text-center py-8">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500">
                Loading payment history...
              </p>
            </div>
          ) : paymentHistory.length > 0 ? (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {payment.provider === "mpesa"
                          ? "M-Pesa Payment"
                          : payment.provider === "bank"
                            ? "Bank Transfer"
                            : "Manual Payment"}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === "allocated"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "matched"
                              ? "bg-blue-100 text-blue-800"
                              : payment.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        {formatDate(payment.received_at)} • Ref:{" "}
                        {payment.provider_txn_ref}
                        {payment.mpesa_transaction_id && (
                          <> • M-Pesa ID: {payment.mpesa_transaction_id}</>
                        )}
                      </p>
                      {payment.payer_name && (
                        <p className="text-xs text-gray-500">
                          Payer: {payment.payer_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      KSh {payment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">💳</div>
              <p className="text-gray-500">No payment history found</p>
              <p className="text-sm text-gray-400 mt-1">
                Your payment history will appear here once you make your first
                payment
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dependants Modal */}
      {memberData && (
        <ManageDependantsModal
          isOpen={showDependantsModal}
          onClose={() => setShowDependantsModal(false)}
          memberId={memberData.id}
          memberName={user?.profile?.full_name || "Member"}
        />
      )}
    </DashboardLayout>
  );
};

export default MemberDashboard;
