import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiEdit3,
  FiSave,
  FiX,
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
import { TbUpload, TbFile, TbTrash, TbDownload } from "react-icons/tb";
import DocumentViewer from "../components/shared/DocumentViewer";
import DocumentUploadModal from "../components/ui/DocumentUploadModal";
import {
  listDocuments,
  uploadDocument as uploadDocApi,
  getDocumentBlobUrl,
  downloadDocumentBlob,
  deleteDocument as deleteDoc,
  OwnerType,
} from "../services/documentsService";
import { PiUserDuotone } from "react-icons/pi";

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

  // Documents state
  const [documents, setDocuments] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewer, setViewer] = useState<{
    open: boolean;
    url: string;
    filename: string;
    type: "pdf" | "image" | "unknown";
  }>({ open: false, url: "", filename: "", type: "unknown" });

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (viewer.url && viewer.url.startsWith("blob:")) {
        URL.revokeObjectURL(viewer.url);
      }
    };
  }, [viewer.url]);

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

  const fetchDocuments = async () => {
    if (!profileData?.user || !profileData?.roleData) return;
    try {
      setDocsLoading(true);
      const ownerType: OwnerType = profileData.user.role as any;
      const ownerId: string = profileData.roleData.id;
      const docs = await listDocuments(ownerType, ownerId);
      setDocuments(docs);
    } catch (e) {
      // noop show later
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    if (profileData?.user && profileData?.roleData) {
      fetchDocuments();
    }
  }, [profileData?.user?.id, profileData?.roleData?.id]);

  const handleUpload = async (file: File, type: string) => {
    const ownerType: OwnerType = profileData.user.role as any;
    const ownerId: string = profileData.roleData.id;
    const newDoc = await uploadDocApi(ownerType, ownerId, file, type);
    return newDoc;
  };

  const handleDownload = async (doc: any) => {
    try {
      await downloadDocumentBlob(doc.id, doc.file_name);
    } catch (e) {
      // Set error banner
      setError("Failed to download document");
    }
  };

  const handleDelete = async (doc: any) => {
    try {
      await deleteDoc(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (e) {
      setError("Failed to delete document");
    }
  };

  const handleView = async (doc: any) => {
    try {
      const blobUrl = await getDocumentBlobUrl(doc.id);
      const ext = (doc.file_name?.split(".").pop() || "").toLowerCase();
      const isImg = ["jpg", "jpeg", "png"].includes(ext);
      const isPdf = ext === "pdf";
      setViewer({
        open: true,
        url: blobUrl,
        filename: doc.file_name,
        type: isImg ? "image" : isPdf ? "pdf" : "unknown",
      });
    } catch (e) {
      setError("Failed to open document");
    }
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
      <div className="space-y-4 lg:space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-b-3xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-sm">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('/bg1.jpg')`,
              }}
            />
          </div>

          <div className="relative z-10 px-2 lg:px-4 py-3 lg:p-6">
            {/* Back Button */}
            <button
              onClick={handleBackToDashboard}
              className="flex items-center text-white/90 hover:text-white transition-colors mb-3 lg:mb-4"
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Go Back</span>
            </button>

            {/* Title Section */}
            <div className="flex items-center justify-center text-center">
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-1">
                  My Profile
                </h1>
                <p className="text-white/80 text-sm">
                  Manage your account information
                </p>
              </div>
            </div>
            <div className="absolute right-8 top-8 hidden lg:block">
              <PiUserDuotone
                className="w-16 h-16 text-white/20"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 lg:mx-0 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Account Information */}
            <div className="bg-white mx-4 lg:mx-0 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base lg:text-lg font-bold text-gray-900">
                    Account Information
                  </h2>
                  {!editingProfile ? (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <FiEdit3 className="mr-1.5 h-4 w-4" />
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileForm({
                          email: profileData?.user.email || "",
                          profile: profileData?.user.profile || {},
                        });
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiX className="mr-1.5 h-4 w-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 lg:p-6">
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4 lg:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {profileData.roleData.account_number && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Account Number
                          </label>
                          <p className="text-sm font-semibold text-gray-900 font-lexend">
                            {profileData.roleData.account_number}
                          </p>
                        </div>
                      )}
                      {profileData.roleData.full_name && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Full Name
                          </label>
                          <p className="text-sm font-semibold text-gray-900">
                            {profileData.roleData.full_name}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Email
                        </label>
                        <p className="text-sm font-semibold text-gray-900 break-all">
                          {profileData?.user.email || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Phone
                        </label>
                        <p className="text-sm font-semibold text-gray-900 font-lexend">
                          {profileData?.user.phone}
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Status
                        </label>
                        <span
                          className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-md ${
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
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
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
                      <div>
                        {/* Agent Details for Members */}
                        {profileData.user.role === "member" &&
                          profileData.roleData.agent && (
                            <div className="pt-4 border-t border-gray-200">
                              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-medium text-blue-700 mb-1 block">
                                      Your Agent
                                    </label>
                                    <p className="text-sm font-semibold text-blue-900">
                                      {profileData.roleData.agent.full_name ||
                                        "Agent"}{" "}
                                      <span className="text-xs text-blue-700">
                                        ({profileData.roleData.agent.code})
                                      </span>
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-blue-700 mb-1 block">
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

            {/* Documents */}
            <div className="bg-white mx-4 lg:mx-0 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base lg:text-lg font-bold text-gray-900">
                    Documents
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage your uploaded documents
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <TbUpload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
              </div>
              <div className="p-4 lg:p-6">
                {docsLoading ? (
                  <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                    Loading documents...
                  </div>
                ) : documents.length > 0 ? (
                  <div className="space-y-2 lg:space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-gray-200 rounded-lg p-3 lg:p-4"
                      >
                        <div className="flex items-start gap-3">
                          <TbFile className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {doc.file_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {doc.document_type} •{" "}
                              <span
                                className={
                                  doc.verified
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }
                              >
                                {doc.verified ? "Verified" : "Pending"}
                              </span>
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <button
                                onClick={() => handleView(doc)}
                                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <TbDownload className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">
                                  Download
                                </span>
                              </button>
                              <button
                                onClick={() => handleDelete(doc)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 border border-red-300 rounded-md text-xs font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                              >
                                <TbTrash className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-sm text-gray-500">
                    No documents uploaded yet
                  </div>
                )}
              </div>
            </div>

            {/* Dependants (for members) */}
            {profileData?.user.role === "member" &&
              profileData.dependants.length > 0 && (
                <div className="bg-white mx-4 lg:mx-0 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 lg:px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base lg:text-lg font-bold text-gray-900">
                      Dependants
                    </h2>
                  </div>
                  <div className="p-4 lg:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
                      {profileData.dependants.map((dependant: any) => (
                        <div
                          key={dependant.id}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-blue-200 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {dependant.full_name}
                              </h3>
                              <p className="text-xs text-gray-500 capitalize mt-0.5">
                                {dependant.relationship}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-0.5 text-xs font-semibold rounded-md shrink-0 ml-2 ${
                                dependant.is_covered
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {dependant.is_covered ? "Covered" : "Not Covered"}
                            </span>
                          </div>
                          {dependant.id_number && (
                            <p className="text-xs text-gray-500 font-mono mb-1">
                              ID: {dependant.id_number}
                            </p>
                          )}
                          {dependant.date_of_birth && (
                            <p className="text-xs text-gray-500">
                              Born: {formatDate(dependant.date_of_birth)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            {/* Subscription Details (for members) */}
            {profileData?.user.role === "member" &&
              profileData.subscriptions.length > 0 && (
                <div className="bg-white mx-4 lg:mx-0 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 lg:px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base lg:text-lg font-bold text-gray-900">
                      Subscription Details
                    </h2>
                  </div>
                  <div className="p-4 lg:p-6 space-y-4">
                    {profileData.subscriptions.map((subscription: any) => (
                      <div
                        key={subscription.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                              Insurance Cover
                            </label>
                            <p className="text-sm font-semibold text-gray-900">
                              {subscription.plan?.name}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                              Status
                            </label>
                            <span
                              className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-md ${
                                subscription.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {subscription.status.charAt(0).toUpperCase() +
                                subscription.status.slice(1)}
                            </span>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                              Premium Amount
                            </label>
                            <p className="text-sm font-semibold text-gray-900">
                              KShs.{" "}
                              {subscription.plan?.premium_amount?.toLocaleString()}
                              <span className="text-xs text-gray-500 font-normal ml-1">
                                / {subscription.plan?.premium_frequency}
                              </span>
                            </p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">
                              Coverage Amount
                            </label>
                            <p className="text-sm font-semibold text-gray-900">
                              KShs.{" "}
                              {subscription.plan?.coverage_amount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
            {/* Password Change */}
            <div className="bg-white mx-4 lg:mx-0 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base lg:text-lg font-bold text-gray-900">
                    Change Password
                  </h2>
                  {!editingPassword ? (
                    <button
                      onClick={() => setEditingPassword(true)}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <FiEdit3 className="mr-1.5 h-4 w-4" />
                      Change
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPassword(false);
                        setPasswordForm({
                          current_password: "",
                          new_password: "",
                          confirm_password: "",
                        });
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FiX className="mr-1.5 h-4 w-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 lg:p-6">
                {editingPassword ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.current_password}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              current_password: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.new_password}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              new_password: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <div className="mt-3 space-y-1.5 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Password must have:
                          </p>
                          <div className="space-y-1">
                            <div
                              className={`flex items-center text-xs ${passwordValidation.minLength ? "text-green-600" : "text-gray-500"}`}
                            >
                              <FiCheck
                                className={`mr-1.5 h-3.5 w-3.5 ${passwordValidation.minLength ? "text-green-600" : "text-gray-400"}`}
                              />
                              At least 8 characters
                            </div>
                            <div
                              className={`flex items-center text-xs ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-500"}`}
                            >
                              <FiCheck
                                className={`mr-1.5 h-3.5 w-3.5 ${passwordValidation.hasUpperCase ? "text-green-600" : "text-gray-400"}`}
                              />
                              One uppercase letter
                            </div>
                            <div
                              className={`flex items-center text-xs ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-500"}`}
                            >
                              <FiCheck
                                className={`mr-1.5 h-3.5 w-3.5 ${passwordValidation.hasLowerCase ? "text-green-600" : "text-gray-400"}`}
                              />
                              One lowercase letter
                            </div>
                            <div
                              className={`flex items-center text-xs ${passwordValidation.hasNumbers ? "text-green-600" : "text-gray-500"}`}
                            >
                              <FiCheck
                                className={`mr-1.5 h-3.5 w-3.5 ${passwordValidation.hasNumbers ? "text-green-600" : "text-gray-400"}`}
                              />
                              One number
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirm_password}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirm_password: e.target.value,
                            })
                          }
                          className="block w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <p className="mt-2 text-xs text-red-600">
                            Passwords do not match
                          </p>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={
                          saving ||
                          !passwordValidation.isValid ||
                          passwordForm.new_password !==
                            passwordForm.confirm_password
                        }
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSave className="mr-2 h-4 w-4" />
                        {saving ? "Saving..." : "Save Password"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">
                      Click "Change" to update your password
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-white mx-4 lg:mx-0 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 lg:px-6 py-4 border-b border-gray-100">
                <h2 className="text-base lg:text-lg font-bold text-gray-900">
                  Account Info
                </h2>
              </div>
              <div className="p-4 lg:p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Member Since
                  </label>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(profileData?.user.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Last Updated
                  </label>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(profileData?.user.updated_at)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    Last Login
                  </label>
                  <p className="text-sm font-semibold text-gray-900">
                    {profileData?.user.last_login_at
                      ? formatDate(profileData.user.last_login_at)
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {viewer.open && (
          <DocumentViewer
            url={viewer.url}
            filename={viewer.filename}
            fileType={viewer.type}
            onClose={() => {
              // Clean up blob URL to prevent memory leaks
              if (viewer.url.startsWith("blob:")) {
                URL.revokeObjectURL(viewer.url);
              }
              setViewer({
                open: false,
                url: "",
                filename: "",
                type: "unknown",
              });
            }}
          />
        )}

        <DocumentUploadModal
          showUploadModal={showUploadModal}
          setShowUploadModal={setShowUploadModal}
          onDocumentUploaded={(d) => {
            setDocuments((prev) => [d, ...prev]);
          }}
          onUpload={handleUpload}
        />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
