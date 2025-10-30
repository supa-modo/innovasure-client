import { motion } from "framer-motion";
import {
  FaClock,
  FaUsers,
  FaMobileAlt,
  FaCoins,
  FaCheckCircle,
} from "react-icons/fa";

const benefits = [
  {
    icon: FaCoins,
    title: "Affordable Coverage",
    description:
      "Pay as little as KES 10 per day. Flexible payment options that fit your budget.",
    color: "from-primary-500 to-primary-700",
  },
  {
    icon: FaClock,
    title: "Fast Claims",
    description:
      "Quick processing through our dedicated agent network. Get your claims processed without delays.",
    color: "from-secondary-500 to-secondary-700",
  },
  {
    icon: FaUsers,
    title: "Family Protection",
    description:
      "Cover yourself and your loved ones with comprehensive family protection plans.",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: FaMobileAlt,
    title: "USSD Access",
    description:
      "No smartphone needed. Access your account and manage payments via USSD, available on any phone.",
    color: "from-orange-500 to-orange-700",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Innovasure?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Designed specifically for Kenyans, by Kenyans. Simple, accessible,
            and reliable micro-insurance.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-xl bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4 mx-auto`}
              >
                <benefit.icon className="text-white text-2xl" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                {benefit.title}
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary-100 flex items-center justify-center">
              <FaCheckCircle className="text-secondary-600 text-xl" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Daily Premium Payments
              </h4>
              <p className="text-gray-600">
                Pay small amounts daily via M-Pesa. No large lump sums required.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <FaCheckCircle className="text-primary-600 text-xl" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Transparent Pricing
              </h4>
              <p className="text-gray-600">
                Clear terms with no hidden fees. Know exactly what you're paying
                for.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <FaCheckCircle className="text-purple-600 text-xl" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">
                Instant SMS Notifications
              </h4>
              <p className="text-gray-600">
                Get instant updates on payments, claims status, and important
                information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

