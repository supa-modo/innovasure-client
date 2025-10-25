import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import InsurancePlanCard from "../../components/admin/InsurancePlanCard";
import PlanManagementModal from "../../components/admin/PlanManagementModal";
import {
  getPlans,
  deletePlan,
  togglePlanStatus,
  InsurancePlan,
} from "../../services/insurancePlansService";
import { FiPlus, FiSearch } from "react-icons/fi";
import NotificationModal from "../../components/ui/NotificationModal";

const PlansManagement = () => {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InsurancePlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [filterFrequency, setFilterFrequency] = useState<
    "all" | "daily" | "weekly" | "monthly" | "annual"
  >("all");

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
    onConfirm: undefined as (() => void) | undefined,
  });

  // Fetch plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const fetchedPlans = await getPlans(false);
      setPlans(fetchedPlans);
      setFilteredPlans(fetchedPlans);
    } catch (err: any) {
      console.error("Error fetching plans:", err);
      setError(err.response?.data?.error || "Failed to fetch insurance plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Filter plans
  useEffect(() => {
    let filtered = [...plans];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (plan) =>
          plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          plan.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((plan) =>
        filterStatus === "active" ? plan.is_active : !plan.is_active
      );
    }

    // Frequency filter
    if (filterFrequency !== "all") {
      filtered = filtered.filter(
        (plan) => plan.premium_frequency === filterFrequency
      );
    }

    setFilteredPlans(filtered);
  }, [plans, searchTerm, filterStatus, filterFrequency]);

  const handlePlanAction = (
    action: "view" | "edit" | "duplicate" | "delete",
    planId: string
  ) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    switch (action) {
      case "view":
        // TODO: Implement view modal
        alert("View plan details: " + plan.name);
        break;
      case "edit":
        setEditingPlan(plan);
        setShowModal(true);
        break;
      case "duplicate":
        setEditingPlan({
          ...plan,
          name: plan.name + " (Copy)",
          is_active: false,
        });
        setShowModal(true);
        break;
      case "delete":
        handleDeletePlan(planId);
        break;
    }
  };

  const handleToggleStatus = async (planId: string, isActive: boolean) => {
    try {
      await togglePlanStatus(planId, isActive);
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, is_active: isActive } : p))
      );
    } catch (err: any) {
      console.error("Error toggling plan status:", err);
      alert(err.response?.data?.error || "Failed to toggle plan status");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    setNotification({
      isOpen: true,
      type: "confirm",
      title: "Confirm Deactivation",
      message:
        "Are you sure you want to deactivate this plan? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deletePlan(planId);
          setPlans((prev) =>
            prev.map((p) => (p.id === planId ? { ...p, is_active: false } : p))
          );
          setNotification({
            isOpen: true,
            type: "success",
            title: "Success",
            message: "Plan deactivated successfully",
            onConfirm: undefined,
          });
        } catch (err: any) {
          console.error("Error deleting plan:", err);
          setNotification({
            isOpen: true,
            type: "error",
            title: "Error",
            message: err.response?.data?.error || "Failed to deactivate plan",
            onConfirm: undefined,
          });
        }
      },
    });
  };

  const handlePlanSave = (savedPlan: InsurancePlan) => {
    if (editingPlan) {
      // Update existing plan
      setPlans((prev) =>
        prev.map((p) => (p.id === savedPlan.id ? savedPlan : p))
      );
    } else {
      // Add new plan
      setPlans((prev) => [...prev, savedPlan]);
    }
    setShowModal(false);
    setEditingPlan(null);
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Insurance Plans
            </h1>
            <p className="text-gray-600 mt-1">
              Manage insurance plans and coverage options
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg"
          >
            <FiPlus size={20} />
            Create New Plan
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Frequency Filter */}
            <div>
              <select
                value={filterFrequency}
                onChange={(e) => setFilterFrequency(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Frequencies</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No insurance plans found</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterFrequency("all");
                }}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <InsurancePlanCard
                key={plan.id}
                plan={plan}
                onPlanAction={handlePlanAction}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Plan Management Modal */}
      <PlanManagementModal
        isOpen={showModal}
        onClose={closeModal}
        plan={editingPlan}
        mode={editingPlan ? "edit" : "add"}
        onSave={handlePlanSave}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        autoClose={notification.type === "success"}
        autoCloseDelay={3000}
      />
    </AdminLayout>
  );
};

export default PlansManagement;
