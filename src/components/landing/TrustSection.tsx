import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaLock,
  FaMobileAlt,
  FaBell,
  FaBuilding,
  FaCheckCircle,
} from "react-icons/fa";

const trustItems = [
  {
    icon: FaShieldAlt,
    title: "Licensed & Regulated",
    description: "Operating under strict insurance regulations and standards",
    color: "primary",
  },
  {
    icon: FaLock,
    title: "Secure M-Pesa Payments",
    description: "Payments processed securely through KCB Bank integration",
    color: "secondary",
  },
  {
    icon: FaBell,
    title: "SMS Notifications",
    description: "Real-time updates on all transactions and payments",
    color: "purple",
  },
  {
    icon: FaBuilding,
    title: "KYC/AML Compliant",
    description: "Full compliance with Know Your Customer regulations",
    color: "orange",
  },
];

const TrustSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your Security is Our Priority
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We take your financial security seriously. Every transaction is
            protected, tracked, and compliant.
          </p>
        </div>

        {/* Trust Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-lg bg-gradient-to-r flex items-center justify-center mb-4 ${
                  item.color === "primary"
                    ? "from-primary-500 to-primary-600"
                    : item.color === "secondary"
                    ? "from-secondary-500 to-secondary-600"
                    : item.color === "purple"
                    ? "from-purple-500 to-purple-600"
                    : "from-orange-500 to-orange-600"
                }`}
              >
                <item.icon className="text-white text-xl" />
              </div>

              {/* Content */}
              <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 border border-primary-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  End-to-End Encryption
                </h4>
                <p className="text-sm text-gray-600">Bank-level security</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-600 flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Regular Audits
                </h4>
                <p className="text-sm text-gray-600">Third-party verified</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-white text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Transparent Processes
                </h4>
                <p className="text-sm text-gray-600">Full audit trail</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;

