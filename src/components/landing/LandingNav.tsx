import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

const LandingNav = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? "h-16" : "h-20"}`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Innovasure" className={`h-12 w-auto `} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#why-us"
              className={`hover:text-primary-600 transition-colors ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("benefits");
                if (element) {
                  const navHeight = 80;
                  const elementPosition = element.offsetTop;
                  const offsetPosition = elementPosition - navHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              Why Us
            </a>
            <a
              href="#insurance-plans"
              className={`hover:text-primary-600 transition-colors ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById("insurance-plans");
                if (element) {
                  const navHeight = 80;
                  const elementPosition = element.offsetTop;
                  const offsetPosition = elementPosition - navHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              Insurance Plans
            </a>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-lg border transition-all ${
                  isScrolled
                    ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "border-white/30 text-white hover:bg-white/10"
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isScrolled
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-secondary-600 text-white hover:bg-secondary-700"
                }`}
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled
                ? "text-gray-700 hover:bg-gray-100"
                : "text-white hover:bg-white/10"
            }`}
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg border-t">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#why-us"
              className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                const element = document.getElementById("benefits");
                if (element) {
                  const navHeight = 80;
                  const elementPosition = element.offsetTop;
                  const offsetPosition = elementPosition - navHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              Why Us
            </a>
            <a
              href="#insurance-plans"
              className="block py-2 text-gray-700 hover:text-primary-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                const element = document.getElementById("insurance-plans");
                if (element) {
                  const navHeight = 80;
                  const elementPosition = element.offsetTop;
                  const offsetPosition = elementPosition - navHeight;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                  });
                }
              }}
            >
              Insurance Plans
            </a>
            <div className="pt-4 border-t space-y-3">
              <Link
                to="/login"
                className="block text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block text-center py-2 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
