import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "../store/authStore";
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiShield,
  FiFileText,
  FiDollarSign,
  FiSettings,
  FiMenu,
  FiX,
  FiLogOut,
  FiCreditCard,
  FiTrendingUp,
} from "react-icons/fi";
import { TbMedicalCross } from "react-icons/tb";

interface AdminLayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", path: "/dashboard/admin", icon: FiHome },
  {
    name: "Insurance Plans",
    path: "/dashboard/admin/plans",
    icon: TbMedicalCross,
  },
  { name: "Members", path: "/dashboard/admin/members", icon: FiUsers },
  { name: "Agents", path: "/dashboard/admin/agents", icon: FiUserCheck },
  {
    name: "Super Agents",
    path: "/dashboard/admin/super-agents",
    icon: FiShield,
  },
  { name: "KYC Approvals", path: "/dashboard/admin/kyc", icon: FiFileText },
  { name: "Payments", path: "/dashboard/admin/payments", icon: FiCreditCard },
  {
    name: "Settlements",
    path: "/dashboard/admin/settlements",
    icon: FiDollarSign,
  },
  { name: "Reports", path: "/dashboard/admin/reports", icon: FiTrendingUp },
  { name: "Settings", path: "/dashboard/admin/settings", icon: FiSettings },
];

const AdminLayout = ({ children, user, onLogout }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-700">Innovasure</h1>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded">
              Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "bg-primary-50 text-primary-700 border-l-4 border-primary-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`mr-3 w-5 h-5 ${active ? "text-primary-700" : "text-gray-500"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0">
              <div className="shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {user?.profile?.full_name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.profile?.full_name || "Admin"}
                </p>
                <p className="text-xs text-gray-600 truncate">{user?.phone}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 ml-2 p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiMenu size={24} />
            </button>
            <h1 className="text-lg font-bold text-primary-700">Innovasure</h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-screen p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
