import { motion } from "framer-motion";
import {
  FaNetworkWired,
  FaUserTie,
  FaHandshake,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa";

const AgentNetworkSection = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-primary-100 to-secondary-100 mb-6">
              <FaNetworkWired className="text-4xl text-primary-600" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powered by Our Network of
              <span className="block gradient-text bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
                Trusted Agents
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our hierarchical agent network ensures personalized service and
              local support across Kenya.
            </p>
          </motion.div>
        </div>

        {/* Agent Network Structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Super Agents */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FaUserTie className="text-2xl" />
              </div>
              <h3 className="text-2xl font-bold">Super Agents</h3>
            </div>
            <p className="text-white/90 mb-4">
              Regional managers overseeing multiple agents with extended support
              and reporting capabilities.
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>Manage agent networks</span>
              </li>
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>Aggregated reporting</span>
              </li>
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>Performance tracking</span>
              </li>
            </ul>
          </motion.div>

          {/* Ground Agents */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-8 text-white shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FaHandshake className="text-2xl" />
              </div>
              <h3 className="text-2xl font-bold">Ground Agents</h3>
            </div>
            <p className="text-white/90 mb-4">
              Direct customer interface agents who register members, collect
              premiums, and provide on-the-ground support.
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>Register new members</span>
              </li>
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>Collect premium payments</span>
              </li>
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>Earn commissions</span>
              </li>
            </ul>
          </motion.div>

          {/* Admin */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FaNetworkWired className="text-2xl" />
              </div>
              <h3 className="text-2xl font-bold">System Admin</h3>
            </div>
            <p className="text-white/90 mb-4">
              Platform administrators who manage the entire system, process
              settlements, and ensure compliance.
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>Process settlements</span>
              </li>
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>System configuration</span>
              </li>
              <li className="flex items-center gap-2">
                <FaShieldAlt className="text-xs" />
                <span>Compliance oversight</span>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 md:p-12 border border-primary-100 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Want to Become an Agent?
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our growing network of trusted agents and earn commissions
            while helping Kenyans access affordable insurance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Find Your Agent
              <FaArrowRight />
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50 font-semibold text-lg rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AgentNetworkSection;


