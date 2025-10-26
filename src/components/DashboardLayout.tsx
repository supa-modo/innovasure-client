import { User } from "../store/authStore";
import { Link } from "react-router-dom";
import { PiUserDuotone } from "react-icons/pi";
import { LuLogOut } from "react-icons/lu";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  user: User | null;
  onLogout: () => void;
}

const DashboardLayout = ({
  children,
  user,
  onLogout,
}: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Innovasure Logo"
                className="h-12 lg:h-14 w-auto"
              />
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.full_name ||
                    user?.profile?.first_name +
                      " " +
                      user?.profile?.last_name ||
                    "User"}
                </p>
                <p className="text-xs text-gray-600">{user?.phone}</p>
              </div>

              {/* Profile Link */}
              <Link
                to="/profile"
                className="inline-flex items-center p-2 lg:px-3 lg:py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <PiUserDuotone className="lg:mr-1.5 h-5 w-5" />
                <span className="hidden lg:block">Profile</span>
              </Link>

              <div className="h-7 w-px bg-gray-300"></div>

              <button
                onClick={onLogout}
                className=" inline-flex items-center text-sm font-medium text-red-600 "
              >
                <LuLogOut className="h-5 w-5" />
                <span className="ml-1.5">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto md:px-4 lg:px-8  w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-center text-sm text-gray-600">
              © 2025 Innovasure Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link
                to="/privacy"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-gray-400">|</span>
              <Link
                to="/terms"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
