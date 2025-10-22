import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import AdminLayout from "../../components/AdminLayout";
import InsurancePlanCard from "../../components/admin/InsurancePlanCard";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  InsurancePlan,
  CreatePlanData,
} from "../../services/insurancePlansService";
import { FiPlus, FiX, FiSearch } from "react-icons/fi";
import { useForm } from "react-hook-form";

interface PlanFormData extends CreatePlanData {}

const PlansManagement = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PlanFormData>();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

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
        // Populate form with plan data
        setValue("name", plan.name);
        setValue("description", plan.description);
        setValue("premium_amount", plan.premium_amount);
        setValue("premium_frequency", plan.premium_frequency);
        setValue("coverage_amount", plan.coverage_amount);
        setValue("grace_period_days", plan.grace_period_days);
        setValue("is_active", plan.is_active);
        setValue("coverage_details", plan.coverage_details);
        setValue("portions", plan.portions);
        setShowModal(true);
        break;
      case "duplicate":
        setEditingPlan(null);
        setValue("name", plan.name + " (Copy)");
        setValue("description", plan.description);
        setValue("premium_amount", plan.premium_amount);
        setValue("premium_frequency", plan.premium_frequency);
        setValue("coverage_amount", plan.coverage_amount);
        setValue("grace_period_days", plan.grace_period_days);
        setValue("is_active", false);
        setValue("coverage_details", plan.coverage_details);
        setValue("portions", plan.portions);
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
    if (!confirm("Are you sure you want to deactivate this plan?")) return;

    try {
      await deletePlan(planId);
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, is_active: false } : p))
      );
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      alert(err.response?.data?.error || "Failed to delete plan");
    }
  };

  const onSubmit = async (data: PlanFormData) => {
    try {
      if (editingPlan) {
        // Update existing plan
        const updated = await updatePlan(editingPlan.id, data);
        setPlans((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
      } else {
        // Create new plan
        const newPlan = await createPlan(data);
        setPlans((prev) => [...prev, newPlan]);
      }
      setShowModal(false);
      setEditingPlan(null);
      reset();
    } catch (err: any) {
      console.error("Error saving plan:", err);
      alert(err.response?.data?.error || "Failed to save plan");
    }
  };

  const openCreateModal = () => {
    setEditingPlan(null);
    reset({
      name: "",
      description: "",
      premium_amount: 0,
      premium_frequency: "daily",
      coverage_amount: 0,
      grace_period_days: 3,
      is_active: true,
      coverage_details: { benefits: [], limitations: [], terms: "" },
      portions: {
        agent_commission: { type: "fixed", value: 0 },
        super_agent_commission: { type: "fixed", value: 0 },
        insurance_share: { type: "percent", value: 75 },
        admin_share: { type: "percent", value: 0 },
      },
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
    reset();
  };

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
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
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
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

      {/* Plan Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPlan
                  ? "Edit Insurance Plan"
                  : "Create New Insurance Plan"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Name *
                    </label>
                    <input
                      {...register("name", {
                        required: "Plan name is required",
                      })}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Daily Basic Coverage"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Brief description of the plan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Premium Amount (KES) *
                    </label>
                    <input
                      {...register("premium_amount", {
                        required: "Premium amount is required",
                        valueAsNumber: true,
                        min: { value: 1, message: "Amount must be positive" },
                      })}
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="20.00"
                    />
                    {errors.premium_amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.premium_amount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      {...register("premium_frequency", {
                        required: "Frequency is required",
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coverage Amount (KES) *
                    </label>
                    <input
                      {...register("coverage_amount", {
                        required: "Coverage amount is required",
                        valueAsNumber: true,
                        min: { value: 1, message: "Amount must be positive" },
                      })}
                      type="number"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="50000.00"
                    />
                    {errors.coverage_amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.coverage_amount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grace Period (Days)
                    </label>
                    <input
                      {...register("grace_period_days", {
                        valueAsNumber: true,
                      })}
                      type="number"
                      min="0"
                      defaultValue={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        {...register("is_active")}
                        type="checkbox"
                        defaultChecked
                        className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Active Plan
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Commission Structure */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Commission Structure
                </h3>
                <div className="space-y-4">
                  {[
                    "agent_commission",
                    "super_agent_commission",
                    "insurance_share",
                    "admin_share",
                  ].map((key) => (
                    <div
                      key={key}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="font-medium text-gray-700 flex items-center">
                        {key
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </div>
                      <div>
                        <select
                          {...register(`portions.${key}.type` as any)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="fixed">Fixed (KES)</option>
                          <option value="percent">Percentage (%)</option>
                        </select>
                      </div>
                      <div>
                        <input
                          {...register(`portions.${key}.value` as any, {
                            required: "Value is required",
                            valueAsNumber: true,
                            min: { value: 0, message: "Must be non-negative" },
                          })}
                          type="number"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PlansManagement;
