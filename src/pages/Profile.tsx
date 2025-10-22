import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiEdit3,
  FiSave,
  FiX,
  FiUsers,
  FiCreditCard,
  FiShield,
  FiCheck,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { getUserDetails, updateUserProfile } from "../services/userService";
import { changePassword } from "../services/passwordService";
import { useAuthStore } from "../store/authStore";

const Profile: React.FC = () => {
  const { user } = useAuthStore();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your account information and settings
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FiUser className="mr-2 h-5 w-5" />
                    Personal Information
                  </h2>
                  {!editingProfile ? (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiEdit3 className="mr-2 h-4 w-4" />
                      Edit
                    </button>
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
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FiX className="mr-2 h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4">
                {editingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
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
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <FiMail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Email
                          </label>
                          <p className="text-sm text-gray-900">
                            {profileData?.user.email || "Not provided"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FiPhone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Phone
                          </label>
                          <p className="text-sm text-gray-900">
                            {profileData?.user.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Role
                          </label>
                          <p className="text-sm text-gray-900">
                            {profileData?.user.role.charAt(0).toUpperCase() +
                              profileData?.user.role.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FiShield className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Status
                          </label>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              profileData?.user.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {profileData?.user.status.charAt(0).toUpperCase() +
                              profileData?.user.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Role-specific Information */}
            {profileData?.roleData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    {profileData.user.role === "member" ? (
                      <>
                        <FiUser className="mr-2 h-5 w-5" />
                        Member Details
                      </>
                    ) : profileData.user.role === "agent" ? (
                      <>
                        <FiUser className="mr-2 h-5 w-5" />
                        Agent Details
                      </>
                    ) : (
                      <>
                        <FiUser className="mr-2 h-5 w-5" />
                        Super Agent Details
                      </>
                    )}
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileData.roleData.full_name && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Full Name
                        </label>
                        <p className="text-sm text-gray-900">
                          {profileData.roleData.full_name}
                        </p>
                      </div>
                    )}
                    {profileData.roleData.account_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Account Number
                        </label>
                        <p className="text-sm text-gray-900">
                          {profileData.roleData.account_number}
                        </p>
                      </div>
                    )}
                    {profileData.roleData.code && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Code
                        </label>
                        <p className="text-sm text-gray-900">
                          {profileData.roleData.code}
                        </p>
                      </div>
                    )}
                    {profileData.roleData.kyc_status && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          KYC Status
                        </label>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            profileData.roleData.kyc_status === "approved"
                              ? "bg-green-100 text-green-800"
                              : profileData.roleData.kyc_status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {profileData.roleData.kyc_status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Dependants (for members) */}
            {profileData?.user.role === "member" &&
              profileData.dependants.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <FiUsers className="mr-2 h-5 w-5" />
                      Dependants
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {profileData.dependants.map((dependant: any) => (
                        <div
                          key={dependant.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                      <FiCreditCard className="mr-2 h-5 w-5" />
                      Subscription Details
                    </h2>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {profileData.subscriptions.map((subscription: any) => (
                        <div
                          key={subscription.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
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
                                KES{" "}
                                {subscription.plan?.premium_amount?.toLocaleString()}{" "}
                                / {subscription.plan?.premium_frequency}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-500">
                                Coverage Amount
                              </label>
                              <p className="text-sm text-gray-900">
                                KES{" "}
                                {subscription.plan?.coverage_amount?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Password Change */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <FiShield className="mr-2 h-5 w-5" />
                    Change Password
                  </h2>
                  {!editingPassword ? (
                    <button
                      onClick={() => setEditingPassword(true)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiEdit3 className="mr-2 h-4 w-4" />
                      Change
                    </button>
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
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FiX className="mr-2 h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4">
                {editingPassword ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
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
                      <label className="block text-sm font-medium text-gray-700">
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
                      <label className="block text-sm font-medium text-gray-700">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Account Information
                </h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Member Since
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(profileData?.user.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(profileData?.user.updated_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Login
                  </label>
                  <p className="text-sm text-gray-900">
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
    </div>
  );
};

export default Profile;
