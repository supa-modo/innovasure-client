import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/DashboardLayout";
import ManageDependantsModal from "../../components/ManageDependantsModal";
import MakePaymentModal from "../../components/MakePaymentModal";
import NotificationModal from "../../components/ui/NotificationModal";
import { getUserDetails } from "../../services/userService";
import {
  getMemberPaymentHistory,
  PaymentTransaction,
} from "../../services/paymentService";
import { FiCheckCircle } from "react-icons/fi";
import { TbArrowRight, TbCalendarDot, TbSparkles } from "react-icons/tb";
import MpesaIcon from "../../components/ui/MpesaIcon";
import { FaArrowRight } from "react-icons/fa";
import { PiUserDuotone, PiUsersThreeDuotone } from "react-icons/pi";

const MemberDashboard = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDependantsModal, setShowDependantsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>(
    []
  );
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Notification modal state
  const [notification, setNotification] = useState({
    isOpen: false,
    type: "info" as
      | "info"
      | "success"
      | "error"
      | "warning"
      | "confirm"
      | "delete",
    title: "",
    message: "",
  });

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
      setNotification({
        isOpen: true,
        type: "error",
        title: "Failed to Load Dashboard",
        message:
          err.message ||
          "Failed to fetch your profile data. Please try refreshing the page.",
      });
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
      setNotification({
        isOpen: true,
        type: "warning",
        title: "Payment History Unavailable",
        message:
          "Could not load your payment history. You can try again later.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleMakePayment = () => {
    setShowPaymentModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getNextDueDate = (subscription: any) => {
    if (subscription?.next_due_date) {
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
  const dependantsCount = profileData?.dependants?.length || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <DashboardLayout role="member" user={user} onLogout={handleLogout}>
      <div className="space-y-4 lg:space-y-6">
        <div className="relative overflow-hidden rounded-b-3xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('/bg1.jpg')`,
              }}
            />
          </div>

          <div className="relative z-10 p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex items-start justify-end  -mb-4 lg:-mb-3 pr-3">
              {/* greetings section */}
              <div className="flex items-center gap-2 ">
                <TbSparkles className="w-5 h-5 text-yellow-300 " />

                <p className="text-blue-100 text-sm lg:text-base font-medium ">
                  {getGreeting()}
                </p>
                <h1 className="text-base lg:text-[1.1rem] font-bold text-white">
                  {user?.profile?.full_name?.split(" ")[0] ||
                    user?.profile?.first_name ||
                    "Member"}
                </h1>
              </div>
            </div>

            {/* Plan Details Section - Redesigned */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Main Plan Info */}
              <div className="lg:col-span-2 space-y-2 lg:space-y-4">
                {/* Shiny Green Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full shadow-lg">
                  <span className="text-[0.8rem] md:text-sm font-bold bg-linear-to-r from-emerald-300 via-green-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg tracking-wide">
                    Your Insurance Cover
                  </span>
                </div>

                {/* Plan Name and Amount - Improved Mobile Layout */}
                <div className="flex flex-row lg:flex-col items-baseline lg:items-start lg:gap-3 px-1 md:px-2">
                  <h2 className="text-[0.9rem] lg:text-2xl font-bold text-amber-400 leading-6 mr-2">
                    {subscription?.plan?.name || "No Plan Assigned"}
                  </h2>

                  {/* Responsive Amount Display */}
                  {subscription?.plan ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[1.3rem] md:text-3xl lg:text-4xl font-lexend font-extrabold text-white tracking-tight">
                        KShs.{" "}
                        {subscription.plan.premium_amount?.toLocaleString() ||
                          "0"}
                      </span>
                      <span className="text-sm lg:text-lg text-blue-100 font-semibold whitespace-nowrap">
                        {subscription.plan.premium_frequency || "month"}
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-blue-100">
                      Please contact your agent to set up your insurance plan
                    </div>
                  )}
                </div>
              </div>

              {/* Next Due Date Card - Enhanced */}
              <div className="flex flex-row lg:flex-col justify-start lg:justify-center">
                <div className="relative overflow-hidden px-4 lg:py-1.5 md:py-2 lg:px-7 lg:bg-linear-to-br from-white/20 to-white/10 lg:backdrop-blur-md rounded-xl lg:rounded-2xl border border-white/30 shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                  <div className="flex flex-row lg:flex-col items-center lg:items-baseline  gap-1 lg:gap-2 relative">
                    <div className="flex items-center gap-2 text-blue-50">
                      <TbCalendarDot className="w-4 h-4" />
                      <p className="text-xs font-medium lg:font-semibold lg:uppercase tracking-wide">
                        Next Due Date:
                      </p>
                    </div>
                    <p className="text-[0.9rem] md:text-base lg:text-2xl font-bold font-lexend text-white">
                      {getNextDueDate(subscription)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Payment Button - Enhanced */}
            <div className="lg:hidden mt-4 mb-1">
              <button
                onClick={handleMakePayment}
                disabled={!subscription?.plan}
                className={`group w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-linear-to-r from-secondary-500 to-secondary-600 text-white rounded-[0.8rem] font-bold text-[0.95rem] transition-colors duration-300 shadow-lg shadow-secondary-600/20 ${
                  !subscription?.plan ? "opacity-50 cursor-not-allowed" : ""
                }`}
                title={!subscription?.plan ? "No insurance plan assigned" : ""}
              >
                <MpesaIcon
                  variant="white"
                  width={65}
                  height={24}
                  className="mt-0.5"
                />

                <span>Make a Payment</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-bold text-primary-700 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/profile")}
                  className=" group relative overflow-hidden rounded-xl bg-linear-to-br from-transparent to-transparent border-2 border-gray-600 lg:border-gray-600 lg:from-slate-500 lg:to-slate-600 py-4 px-5 text-left text-gray-700 lg:text-white transition-all duration-300 hover:shadow-lg "
                >
                  <div className="flex flex-row lg:flex-col items-center lg:items-start gap-6 lg:gap-0 relative z-10">
                    <PiUserDuotone className="w-12 lg:w-9 h-10 lg:h-9 lg:mb-1.5" />
                    <div>
                      <h3 className="font-semibold mb-1">My Profile</h3>
                      <p className="text-sm text-gray-700 lg:text-slate-100">
                        View & edit your personal details
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="w-5 h-5 text-gray-700 lg:text-white absolute top-6 right-6" />
                  <div className="absolute -right-8 -bottom-10 w-24 h-24 bg-white/10 rounded-full"></div>
                </button>

                <button
                  onClick={handleMakePayment}
                  disabled={!subscription?.plan}
                  className={`group relative overflow-hidden rounded-xl border-2 border-slate-500/10 lg:border-gray-600 bg-linear-to-br lg:from-transparent lg:to-transparent from-slate-500 to-slate-600 lg:py-3.5 py-4 px-5 text-left text-white lg:text-gray-700 transition-all duration-200 hover:shadow-lg ${
                    !subscription?.plan ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title={
                    !subscription?.plan ? "No insurance plan assigned" : ""
                  }
                >
                  <div className="flex flex-row lg:flex-col items-center lg:items-start gap-3 lg:gap-0 relative z-10">
                    <MpesaIcon
                      variant="white"
                      width={75}
                      height={25}
                      className="lg:hidden"
                    />
                    <MpesaIcon
                      variant="green"
                      width={75}
                      height={25}
                      className="hidden lg:block lg:mb-2"
                    />
                    <div>
                      <h3 className="font-semibold  mb-1 ">Make a Payment</h3>
                      <p className="text-sm text-white lg:text-gray-700">
                        Pay your premiums via M-Pesa
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="w-5 h-5 text-white lg:text-gray-700 absolute top-6 right-6" />
                  <div className="absolute -right-8 -bottom-10 w-24 h-24 bg-white/10 lg:bg-gray-100 rounded-full"></div>
                </button>

                <button
                  onClick={() => setShowDependantsModal(true)}
                  className="group relative overflow-hidden rounded-xl lg:py-[3.5] py-4 px-5 text-left text-gray-700 transition-all duration-300 hover:shadow-lg border-2 border-gray-600"
                >
                  <div className="flex flex-row lg:flex-col items-center lg:items-start gap-6 lg:gap-0 relative z-10">
                    <PiUsersThreeDuotone className="w-12 lg:w-9 h-10 lg:h-9 lg:mb-1.5" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold ">Dependants</h3>
                        <div className="font-lexend font-bold text-[0.8rem] text-white bg-linear-to-r from-slate-500 to-slate-600 rounded-full px-2 py-0.5 ">
                          {dependantsCount}
                        </div>
                      </div>

                      <p className="text-sm text-gray-700">
                        Manage your dependants & family
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="w-5 h-5 z-50 text-gray-700 absolute top-6 right-6" />
                  <div className="absolute -right-8 -bottom-10 w-24 h-24 bg-gray-100 rounded-full"></div>
                </button>

                <button
                  onClick={() => navigate("/profile")}
                  className="group relative overflow-hidden rounded-xl bg-linear-to-br from-slate-500 to-slate-600 py-4 px-5 text-left text-white transition-all duration-200 hover:shadow-lg "
                >
                  <div className="flex flex-row lg:flex-col items-center lg:items-start gap-6 lg:gap-0 relative z-10">
                    <FiCheckCircle className="w-12 lg:w-9 h-10 lg:h-9 lg:mb-1.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Coverage</h3>
                      <p className="text-sm text-slate-100">
                        View you Insurancecover benefits
                      </p>
                    </div>
                  </div>
                  <FaArrowRight className="w-5 h-5 text-white absolute top-6 right-6" />
                  <div className="absolute -right-8 -bottom-10 w-24 h-24 bg-white/10 rounded-full"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Account Info */}
          <div className="space-y-6">
            {/* Account Information */}
            {memberData && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mx-3 p-4 lg:p-6">
                <h2 className="text-lg font-bold text-primary-700 mb-1.5 md:mb-2 lg:mb-3">
                  Account Information
                </h2>

                <div className="space-y-4">
                  {/* Account Details */}
                  <div className="space-y-1.5 md:space-y-2 lg:space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">
                        Account Number
                      </span>
                      <span className="text-sm font-semibold text-gray-900 font-mono">
                        {memberData.account_number}
                      </span>
                    </div>

                    {profileData?.user?.created_at && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500 font-medium">
                          Member Since
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatDate(profileData.user.created_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Agent Details */}
                  {memberData.agent && (
                    <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700 font-medium">
                            Your Agent
                          </span>
                          <span className="text-sm font-semibold text-blue-900">
                            {memberData.agent.full_name || "Agent"}{" "}
                            <span className="text-sm font-semibold text-blue-900 font-mono">
                              ({memberData.agent.code})
                            </span>
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700 font-medium">
                            Phone
                          </span>
                          <span className="text-sm font-semibold text-blue-900">
                            {memberData.agent.user?.phone || "Not available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-linear-to-r from-blue-500 to-blue-600 text-[0.9rem] lg:text-base text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                  >
                    <span>View Full Profile</span>
                    <TbArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-t-3xl lg:rounded-2xl shadow-sm border border-gray-100 mb-4 p-4 lg:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-primary-700">
              Recent Payments
            </h2>
          </div>

          {paymentLoading ? (
            <div className="text-center py-12">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-3 text-sm text-gray-500">
                Loading payment history...
              </p>
            </div>
          ) : paymentHistory.length > 0 ? (
            <div className="space-y-2 lg:space-y-3">
              {paymentHistory.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="group flex items-center justify-between p-2 lg:p-4  border-b border-gray-200"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        payment.status === "allocated"
                          ? "bg-green-100"
                          : payment.status === "matched"
                            ? "bg-blue-100"
                            : payment.status === "pending"
                              ? "bg-yellow-100"
                              : "bg-red-100"
                      }`}
                    >
                      <FiCreditCard
                        className={`w-6 h-6 ${
                          payment.status === "allocated"
                            ? "text-green-600"
                            : payment.status === "matched"
                              ? "text-blue-600"
                              : payment.status === "pending"
                                ? "text-yellow-600"
                                : "text-red-600"
                        }`}
                      />
                    </div> */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-[0.8rem] lg:text-sm font-semibold text-gray-600 truncate">
                          {payment.mpesa_transaction_id ||
                            (payment.provider_txn_ref
                              ? payment.provider_txn_ref.substring(0, 15) +
                                "..."
                              : "N/A")}
                        </h3>
                      </div>
                      <p className="flex items-center gap-2 text-xs text-gray-500 truncate">
                        <span>{formatDate(payment.received_at)} </span>
                        <MpesaIcon variant="green" width={45} height={18} />
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-[0.95rem] md:text-base lg:text-lg font-bold text-gray-600">
                      KShs. {payment.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium mb-1">No payments yet</p>
              <p className="text-sm text-gray-400">
                Your payment history will appear here
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
          memberName={
            user?.profile?.full_name ||
            user?.profile?.first_name + " " + user?.profile?.last_name ||
            "Member"
          }
        />
      )}

      {/* Payment Modal */}
      {memberData && subscription?.plan && (
        <MakePaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          memberId={memberData.id}
          premiumAmount={subscription.plan.premium_amount || 0}
          userPhone={user?.phone || ""}
        />
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        autoClose={
          notification.type === "info" || notification.type === "success"
        }
        autoCloseDelay={5000}
      />
    </DashboardLayout>
  );
};

export default MemberDashboard;
