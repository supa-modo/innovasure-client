import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiEdit3,
  FiSave,
  FiX,
  FiUsers,
  FiCreditCard,
  FiShield,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
} from "react-icons/fi";
import { getUserDetails, updateUserProfile } from "../services/userService";
import { changePassword } from "../services/passwordService";
import { useAuthStore } from "../store/authStore";
import DashboardLayout from "../components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { div } from "framer-motion/client";

const Profile: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    email: "",
    profile: {} as any,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfileData();
    }
  }, [user?.id]);

  const fetchProfileData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getUserDetails(user.id);
      setProfileData(data);
      setProfileForm({
        email: data.user.email || "",
        profile: data.user.profile || {},
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case "admin":
        return "/dashboard/admin";
      case "super_agent":
        return "/dashboard/super-agent";
      case "agent":
        return "/dashboard/agent";
      case "member":
        return "/dashboard/member";
      default:
        return "/login";
    }
  };

  const handleBackToDashboard = () => {
    navigate(getDashboardRoute());
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    try {
      await updateUserProfile(user.id, profileForm);
      setEditingProfile(false);
      fetchProfileData(); // Refresh data
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setEditingPassword(false);
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
    };
  };

  const passwordValidation = validatePassword(passwordForm.new_password);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <DashboardLayout
        role={user?.role || "member"}
        user={user}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-2 text-sm text-gray-500">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !profileData) {
    return (
      <DashboardLayout
        role={user?.role || "member"}
        user={user}
        onLogout={handleLogout}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <FiX className="h-6 w-6 text-red-600" />
            </div>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={fetchProfileData}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role={user?.role || "member"}
      user={user}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header Section */}
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

          <div className="relative z-10 p-4 md:p-6 ">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-0 lg:mb-2">
              {/* Back Button */}
              <button
                onClick={handleBackToDashboard}
                className="flex items-center text-blue-100 hover:text-white transition-colors"
              >
                <FiArrowLeft className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Go Back</span>
              </button>

              <div className="absolute top-5 right-5 hidden lg:block">
                <div className="">
                  <FiUser
                    className="w-20 h-20 text-white drop-shadow-lg"
                    fill="currentColor"
                  />
                </div>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                My Profile
              </h1>
              <p className="text-blue-100 text-sm lg:text-base">
                Manage your account information and settings
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="text-xs lg:text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Account Information */}
            <div className="bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 overflow-hidden">
              <div className="px-4 md:px-6 py-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-base md:text-lg font-bold text-primary-700 flex items-center">
                    Account Information
                  </h2>
                  {!editingProfile ? (
                    <div className="border-b border-gray-600">
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="inline-flex items-center  text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <FiEdit3 className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileForm({
                            email: profileData?.user.email || "",
                            profile: profileData?.user.profile || {},
                          });
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <FiX className="mr-2 h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 md:px-6 md:py-5">
                {editingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {profileData.roleData.account_number && (
                        <div className="">
                          <label className="text-xs lg:text-sm font-medium text-gray-600 tracking-wide mb-1 block">
                            Account Number
                          </label>
                          <p className="text-sm font-semibold text-gray-900 font-lexend">
                            {profileData.roleData.account_number}
                          </p>
                        </div>
                      )}
                      {profileData.roleData.full_name && (
                        <div className="">
                          <label className="text-xs lg:text-sm font-medium text-gray-600 tracking-wide mb-1 block">
                            Full Name
                          </label>
                          <p className="text-sm font-semibold text-gray-900">
                            {profileData.roleData.full_name}
                          </p>
                        </div>
                      )}
                      <div className="">
                        <label className="text-xs lg:text-sm font-medium text-gray-600 tracking-wide mb-1 block">
                          Email
                        </label>
                        <p className="text-sm font-semibold text-gray-900">
                          {profileData?.user.email || "Not provided"}
                        </p>
                      </div>
                      <div className="">
                        <label className="text-xs lg:text-sm font-medium text-gray-600 tracking-wide mb-1 block">
                          Phone
                        </label>
                        <p className="text-sm font-semibold text-gray-900 font-lexend">
                          {profileData?.user.phone}
                        </p>
                      </div>

                      <div className="">
                        <label className="text-xs lg:text-sm font-medium text-gray-600 tracking-wide mb-1 block">
                          Status
                        </label>
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg ${
                            profileData?.user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {profileData?.user.status.charAt(0).toUpperCase() +
                            profileData?.user.status.slice(1)}
                        </span>
                      </div>
                      {profileData.roleData.code && (
                        <div className="">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                            Code
                          </label>
                          <p className="text-sm font-semibold text-gray-900 font-mono">
                            {profileData.roleData.code}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Role-specific Information */}
                    {profileData?.roleData && (
                      <div className="">
                        {/* Agent Details for Members */}
                        {profileData.user.role === "member" &&
                          profileData.roleData.agent && (
                            <div className="mt-3 md:mt-4 lg:mt-6 pt-6 border-t border-gray-200">
                              <div className="lg:bg-linear-to-r from-blue-50 to-indigo-50 lg:rounded-xl lg:p-4 lg:border lg:border-blue-100">
                                <div className="grid grid-cols-2 gap-2 lg:gap-4">
                                  <div>
                                    <label className="text-xs lg:text-sm font-medium text-blue-700 tracking-wide mb-1.5 block">
                                      Your Agent
                                    </label>
                                    <p className="text-sm font-semibold text-blue-900">
                                      {profileData.roleData.agent.full_name ||
                                        "Agent"}{" "}
                                      <span className="text-sm font-semibold text-blue-900">
                                        ({profileData.roleData.agent.code})
                                      </span>
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-xs lg:text-sm font-medium text-blue-700 tracking-wide mb-1 block">
                                      Agent Contact
                                    </label>
                                    <p className="text-sm font-semibold text-blue-900 font-lexend">
                                      {profileData.roleData.agent.mpesa_phone}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dependants (for members) */}
            {profileData?.user.role === "member" &&
              profileData.dependants.length > 0 && (
                <div className="lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-100 overflow-hidden">
                  <div className="px-4 pt-4">
                    <h2 className="text-base md:text-lg font-bold text-primary-700 flex items-center">
                      Dependants
                    </h2>
                  </div>
                  <div className="p-4 md:px-6 md:py-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profileData.dependants.map((dependant: any) => (
                        <div
                          key={dependant.id}
                          className="bg-linear-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-600">
                                {dependant.full_name}
                              </h3>
                              <p className="text-xs text-gray-600 capitalize">
                                {dependant.relationship}
                                {"."}
                                {dependant.id_number && (
                                  <span className="pl-4 font-mono">
                                    ID: {dependant.id_number}
                                  </span>
                                )}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
                                dependant.is_covered
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {dependant.is_covered ? "Covered" : "Not Covered"}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-500 mt-2">
                            {dependant.date_of_birth && (
                              <p>Born: {formatDate(dependant.date_of_birth)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* Subscription Details (for members) */}
            {profileData?.user.role === "member" &&
              profileData.subscriptions.length > 0 && (
                <div className="px-3 lg:px-0 md:py-4">
                  {profileData.subscriptions.map((subscription: any) => (
                    <div
                      key={subscription.id}
                      className="rounded-xl border border-gray-300 p-4 lg:p-5"
                    >
                      <div className="grid grid-cols-2  lg:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs lg:text-sm font-medium text-gray-700 tracking-wide mb-1 block">
                            Insurance Cover
                          </label>
                          <p className="text-[0.9rem] lg:text-base font-semibold text-gray-900">
                            {subscription.plan?.name}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs lg:text-sm font-medium text-gray-600 tracking-wide mb-1 block">
                            Status
                          </label>
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-lg ${
                              subscription.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {subscription.status}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs lg:text-sm font-medium text-gray-600 tracking-wide mb-1 block">
                            Premium Amount
                          </label>
                          <p className="text-[0.9rem] lg:text-base font-semibold text-gray-900">
                            KShs.{" "}
                            {subscription.plan?.premium_amount?.toLocaleString()}{" "}
                            <span className="text-xs text-gray-500 font-normal">
                              {subscription.plan?.premium_frequency}
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-xs lg:text-sm font-medium text-gray-600 tracking-wide mb-1 block">
                            Coverage Amount
                          </label>
                          <p className="text-[0.9rem] lg:text-base font-semibold text-gray-900">
                            KShs.{" "}
                            {subscription.plan?.coverage_amount?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="px-3 space-y-4 md:space-y-6">
            {/* Password Change */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className=" px-4 pt-2.5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-base md:text-lg font-bold text-primary-700 flex items-center">
                    Change Password
                  </h2>
                  {!editingPassword ? (
                    <div className="border-b border-gray-600">
                      <button
                        onClick={() => setEditingPassword(true)}
                        className="inline-flex items-center  text-sm font-medium  text-gray-700 "
                      >
                        <FiEdit3 className="mr-2 h-4 w-4" />
                        Change
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingPassword(false);
                          setPasswordForm({
                            current_password: "",
                            new_password: "",
                            confirm_password: "",
                          });
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <FiX className="mr-2 h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 ">
                {editingPassword ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-600">
                        Current Password
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.current_password}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              current_password: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                        >
                          {showPasswords.current ? (
                            <FiEyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <FiEye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-600">
                        New Password
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.new_password}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              new_password: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                        >
                          {showPasswords.new ? (
                            <FiEyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <FiEye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* Password Requirements */}
                      {passwordForm.new_password && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-700">
                            Password Requirements:
                          </p>
                          <div className="space-y-1">
                            <div
                              className={`flex items-center text-xs ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}
                            >
                              <FiCheck
                                className={`mr-1 h-3 w-3 ${passwordValidation.minLength ? "text-green-600" : "text-gray-400"}`}
                              />
                              At least 8 characters
                            </div>
                            <div
                              className={`flex items-center text-xs ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}
                            >
                              <FiCheck
                                className={`mr-1 h-3 w-3 ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-400"}`}
                              />
                              One uppercase letter
                            </div>
                            <div
                              className={`flex items-center text-xs ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}
                            >
                              <FiCheck
                                className={`mr-1 h-3 w-3 ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-400"}`}
                              />
                              One lowercase letter
                            </div>
                            <div
                              className={`flex items-center text-xs ${passwordValidation.hasNumbers ? "text-green-600" : "text-gray-500"}`}
                            >
                              <FiCheck
                                className={`mr-1 h-3 w-3 ${passwordValidation.hasNumbers ? "text-green-600" : "text-gray-400"}`}
                              />
                              One number
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-gray-600">
                        Confirm New Password
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirm_password}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirm_password: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                        >
                          {showPasswords.confirm ? (
                            <FiEyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <FiEye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordForm.confirm_password &&
                        passwordForm.new_password !==
                          passwordForm.confirm_password && (
                          <p className="mt-1 text-xs text-red-600">
                            Passwords do not match
                          </p>
                        )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={
                          saving ||
                          !passwordValidation.isValid ||
                          passwordForm.new_password !==
                            passwordForm.confirm_password
                        }
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Password"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      Click "Change" to update your password
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-2">
              <div className="p-4 md:px-6 md:py-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Member Since
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(profileData?.user.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(profileData?.user.updated_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {profileData?.user.last_login_at
                      ? formatDate(profileData.user.last_login_at)
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
