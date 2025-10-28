import { motion } from "framer-motion";
import {
  FaUserPlus,
  FaFileAlt,
  FaCreditCard,
  FaCheckCircle,
} from "react-icons/fa";

const steps = [
  {
    number: "1",
    icon: FaUserPlus,
    title: "Register with an Agent",
    description:
      "Contact a verified Innovasure agent in your area or register online with an agent code.",
  },
  {
    number: "2",
    icon: FaFileAlt,
    title: "Choose Your Plan",
    description:
      "Select the insurance plan that best fits your family's needs and budget.",
  },
  {
    number: "3",
    icon: FaCreditCard,
    title: "Pay Daily via M-Pesa",
    description:
      "Make secure daily payments using M-Pesa. Fast, convenient, and trackable.",
  },
  {
    number: "4",
    icon: FaCheckCircle,
    title: "Enjoy Coverage & Peace of Mind",
    description:
      "You and your family are now protected. Get instant SMS confirmations for every transaction.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Get Covered in 4 Simple Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Joining Innovasure is quick and easy. No complicated paperwork, no
            long waits.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-gradient-to-r from-primary-600 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-lg z-10">
                {step.number}
              </div>

              {/* Card */}
              <div className="bg-white rounded-2xl p-8 pt-12 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-secondary-500 to-secondary-600 flex items-center justify-center mb-4 mx-auto">
                  <step.icon className="text-white text-2xl" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed flex-grow">
                  {step.description}
                </p>
              </div>

              {/* Connector Line (Desktop Only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 z-0">
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-primary-400 border-b-8 border-b-transparent"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-gray-700 mb-6">
              Ready to get started? Join thousands of Kenyans who trust
              Innovasure.
            </p>
            <a
              href="/register"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Your Journey
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

