import { Link } from "react-router-dom";
import { FaArrowRight, FaCheckCircle } from "react-icons/fa";
import { 
  PiShieldCheckDuotone, 
  PiUsersThreeDuotone, 
  PiCurrencyDollarDuotone 
} from "react-icons/pi";

const Hero = () => {
  return (
    <>
      {/* Hero Section - Contained, Not Full Height */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20 lg:py-24">
            {/* Left Column - Content */}
            <div className="text-white">
              {/* Logo */}
              <div className="mb-8">
                <img
                  src="/logo.png"
                  alt="Innovasure Logo"
                  className="h-14 md:h-16 w-auto"
                />
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Affordable Insurance for{" "}
                <span className="text-secondary-300">Every Kenyan</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                Protect your family with micro-insurance starting from as low as{" "}
                <span className="font-bold text-secondary-300">KES 10 per day</span>.
                Pay via M-Pesa, no paperwork, instant coverage.
              </p>

              {/* Key Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-secondary-300 text-xl shrink-0" />
                  <span className="text-white/90 text-base">Daily M-Pesa payments - as low as KES 10</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-secondary-300 text-xl shrink-0" />
                  <span className="text-white/90 text-base">Instant coverage with zero paperwork</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaCheckCircle className="text-secondary-300 text-xl shrink-0" />
                  <span className="text-white/90 text-base">Comprehensive family protection plans</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Free
                  <FaArrowRight className="text-base group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-semibold text-lg rounded-lg hover:bg-white/20 transition-all duration-300"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="relative hidden lg:block">
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-72 h-72 bg-secondary-400/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
              
              {/* Main Image */}
              <div className="relative z-10">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/bg1.jpg"
                    alt="Insurance Protection"
                    className="w-full h-[500px] object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards - Separate Section Below Hero */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - Trusted Protection */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                  <PiShieldCheckDuotone className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-600 mb-2">
                    Trusted Protection
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">10,000+</p>
                  <p className="text-sm text-gray-500">Kenyan families protected</p>
                </div>
              </div>
            </div>

            {/* Card 2 - Active Members */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                  <PiUsersThreeDuotone className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-600 mb-2">
                    Active Members
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">50,000+</p>
                  <p className="text-sm text-gray-500">Growing community</p>
                </div>
              </div>
            </div>

            {/* Card 3 - Affordable Plans */}
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                  <PiCurrencyDollarDuotone className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-600 mb-2">
                    Affordable Plans
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mb-1">KES 10/day</p>
                  <p className="text-sm text-gray-500">Starting from</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
