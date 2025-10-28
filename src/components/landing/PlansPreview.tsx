import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPlans } from "../../services/insurancePlansService";
import { InsurancePlan } from "../../services/insurancePlansService";
import { FaCheck, FaArrowRight } from "react-icons/fa";

const PlansPreview = () => {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans(true); // Only fetch active plans
        setPlans(data.slice(0, 3)); // Show first 3 plans
      } catch (error) {
        console.error("Error fetching plans:", error);
        // Use placeholder data if API fails
        setPlans([
          {
            id: "1",
            name: "Basic Plan",
            description: "Essential coverage for individuals",
            premium_amount: 10,
            premium_frequency: "daily",
            coverage_amount: 100000,
            coverage_details: { benefits: ["Accident coverage"] },
            portions: {
              agent_commission: { type: "fixed", value: 0 },
              super_agent_commission: { type: "fixed", value: 0 },
              insurance_share: { type: "fixed", value: 0 },
              admin_share: { type: "fixed", value: 0 },
            },
            grace_period_days: 7,
            is_active: true,
            created_at: "",
            updated_at: "",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="spinner mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="insurance-plans" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Choose the Right Plan for Your Family
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Flexible insurance plans designed to protect what matters most.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 overflow-hidden"
            >
              {/* Plan Header */}
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-white/80 text-sm">{plan.description}</p>
              </div>

              {/* Plan Content */}
              <div className="p-6">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(plan.premium_amount)}
                    </span>
                    <span className="text-gray-600 capitalize">
                      /{plan.premium_frequency}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    Coverage: {formatCurrency(plan.coverage_amount)}
                  </p>
                </div>

                {/* Features */}
                {plan.coverage_details?.benefits && (
                  <div className="space-y-3 mb-6">
                    {plan.coverage_details.benefits.slice(0, 3).map(
                      (benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <FaCheck className="text-secondary-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            {benefit}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Plan Footer */}
              <div className="p-6 pt-0">
                <Link
                  to="/register"
                  className="block w-full bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Choose Plan
                  <FaArrowRight />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              View All Plans
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlansPreview;

