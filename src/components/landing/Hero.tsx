import { Link } from "react-router-dom";
import { FaArrowRight, FaLock } from "react-icons/fa";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pb-20">
      {/* Fixed Background Image with Gradient Overlay */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/bg1.jpg')" }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary-900/80 via-primary-800/70 to-primary-700/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6 md:mb-8">
            <img
              src="/logo.png"
              alt="Innovasure Logo"
              className="h-16 md:h-20 lg:h-24 w-auto mx-auto drop-shadow-2xl"
            />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight px-4">
            Affordable Insurance for
            <span className="block gradient-text bg-clip-text text-transparent bg-linear-to-r from-secondary-300 to-secondary-500">
              Every Kenyan
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Protect your family with micro-insurance starting from as low as{" "}
            <span className="font-bold text-secondary-300">KES 10 per day</span>
            . Pay via M-Pesa, no paperwork, instant coverage.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-4">
            <Link
              to="/register"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold text-base sm:text-lg rounded-xl shadow-2xl hover:shadow-secondary-500/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started Free
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white font-semibold text-base sm:text-lg rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Sign In
              <FaLock />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
