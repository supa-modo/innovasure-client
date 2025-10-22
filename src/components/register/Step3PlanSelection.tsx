import React, { useEffect, useState } from "react";
import { getPlans, InsurancePlan } from "../../services/insurancePlansService";

interface Step3PlanSelectionProps {
  selectedPlan: string;
  setSelectedPlan: React.Dispatch<React.SetStateAction<string>>;
  onBack: () => void;
  onNext: () => void;
}

const Step3PlanSelection: React.FC<Step3PlanSelectionProps> = ({
  selectedPlan,
  setSelectedPlan,
  onBack,
  onNext,
}) => {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchActivePlans = async () => {
      try {
        setLoading(true);
        const fetchedPlans = await getPlans(true); // Fetch only active plans
        setPlans(fetchedPlans);
        setError("");
      } catch (err: any) {
        console.error("Error fetching plans:", err);
        setError("Failed to load insurance plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivePlans();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: "day",
      weekly: "week",
      monthly: "month",
      annual: "year",
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-[1.1rem] lg:text-xl font-semibold text-secondary-700 mb-4">
        Select Insurance Plan
      </h2>

      {/* Plan Selection */}
      <div className="mb-6">
        <p className="text-gray-600 text-sm lg:text-[0.95rem] mb-4">
          Choose an insurance plan that suits your needs.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            No active insurance plans available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border-2 rounded-xl px-4 py-2.5 md:p-4 cursor-pointer transition-colors ${
                  selectedPlan === plan.id
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <h3 className="font-semibold text-primary-700">{plan.name}</h3>
                <p className="text-gray-600 font-lexend font-semibold text-sm mt-1">
                  {formatCurrency(plan.premium_amount)}/
                  {getFrequencyLabel(plan.premium_frequency)}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Coverage: {formatCurrency(plan.coverage_amount)}
                </p>
                {plan.description && (
                  <p className="text-gray-500 text-xs mt-2">
                    {plan.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-4">
          * You must select a plan to continue with registration
        </p>
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-2 lg:gap-3 text-[0.9rem] lg:text-base">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors border border-gray-300"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedPlan || loading}
          className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Agent Code & Password
        </button>
      </div>
    </div>
  );
};

export default Step3PlanSelection;
