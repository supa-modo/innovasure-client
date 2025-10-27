import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LuLogOut } from "react-icons/lu";
import {
  TbPresentationAnalytics,
  TbHelp,
  TbPill,
  TbCreditCard,
  TbLayoutSidebarRightCollapse,
  TbLayoutSidebarLeftCollapse,
  TbServer,
} from "react-icons/tb";
import { MdSpaceDashboard, MdHealthAndSafety } from "react-icons/md";
import {
  PiGearBold,
  PiUserDuotone,
  PiUsersDuotone,
  PiUsersThreeDuotone,
} from "react-icons/pi";
import { RiUserStarLine } from "react-icons/ri";
import { useAuthStore } from "../store/authStore";

// Role-based navigation items for Innovasure Insurance
const getNavItems = (userRole: string) => {
  const baseItems = [
    {
      category: null,
      items: [
        {
          name: "Dashboard",
          icon: MdSpaceDashboard,
          path: "/dashboard/admin",
          end: true,
          roles: ["admin"],
        },
      ],
    },
  ];

  // Admin-specific items
  const adminItems = [
    {
      category: "Member & Agent Management",
      items: [
        {
          name: "All Members",
          icon: PiUsersThreeDuotone,
          path: "/admin/members",
          roles: ["admin"],
        },

        {
          name: "All Agents",
          icon: PiUsersDuotone,
          path: "/admin/agents",
          roles: ["admin"],
        },
        {
          name: "Super Agents",
          icon: RiUserStarLine,
          path: "/admin/super-agents",
          roles: ["admin"],
        },
      ],
    },

    {
      category: "User Verification",
      items: [
        {
          name: "KYC Review",
          icon: MdHealthAndSafety,
          path: "/admin/kyc",
          roles: ["admin"],
        },
      ],
    },
    {
      category: "System Management",
      items: [
        {
          name: "Insurance Plans",
          icon: TbPill,
          path: "/admin/plans",
          roles: ["admin"],
        },
        {
          name: "Payments",
          icon: TbCreditCard,
          path: "/admin/payments",
          roles: ["admin"],
        },
        {
          name: "Settlements",
          icon: TbPresentationAnalytics,
          path: "/admin/settlements",
          roles: ["admin"],
        },
        {
          name: "Reports",
          icon: TbPresentationAnalytics,
          path: "/admin/reports",
          roles: ["admin"],
        },
        {
          name: "System Monitor",
          icon: TbServer,
          path: "/admin/system",
          roles: ["admin"],
        },
      ],
    },
  ];

  // Common items for all roles
  const commonItems = [
    {
      category: null,
      items: [
        {
          name: "Settings",
          icon: PiGearBold,
          path: "/admin/settings",
          roles: ["admin"],
        },
        {
          name: "Help & Support",
          icon: TbHelp,
          path: "/admin/support",
          roles: ["admin"],
        },
      ],
    },
  ];

  // Filter items based on user role
  const filterItemsByRole = (items: any[]) => {
    return items
      .map((category: any) => ({
        ...category,
        items:
          category.items?.filter((item: any) =>
            item.roles?.includes(userRole)
          ) || [],
      }))
      .filter((category: any) => !category.items || category.items.length > 0);
  };

  // Combine all items based on role
  let allItems: any[] = [...baseItems];

  if (userRole === "admin") {
    allItems = [...allItems, ...adminItems, ...commonItems];
  }

  return filterItemsByRole(allItems);
};

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggleSidebar?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed = false,
  onToggleSidebar,
}) => {
  const { clearAuth, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const navItems = getNavItems(user?.role || "admin");

  return (
    <aside
      className={`flex flex-col bg-slate-100 border-r border-slate-300/50 font-inter transition-all duration-500 ease-in-out shadow-2xl ${
        collapsed ? "w-20" : "w-[310px]"
      }`}
    >
      {/* Sidebar content */}
      <div className="flex-1 overflow-y-auto pt-2.5 pb-3 scrollbar-hidden">
        {/* logo/title */}
        <div className="transition-all duration-500 ease-in-out">
          {collapsed ? (
            <div className="flex flex-col items-center mb-3 space-y-2">
              {/* Innovasure logo */}
              <img
                src="/logo2.png"
                alt="Innovasure Logo"
                className="w-12 h-12"
              />
              {/* Sidebar toggle button - below logo when collapsed */}
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className="rounded-lg text-slate-600  hover:bg-slate-100  transition-colors duration-200 p-1"
                  title="Expand sidebar"
                  aria-label="Toggle Sidebar"
                >
                  <TbLayoutSidebarRightCollapse size={40} />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between pl-6 pr-4 mb-1.5">
              <div className="flex items-center">
                <img
                  src="/logo.png"
                  alt="Innovasure Logo"
                  className="w-auto h-14 mr-2"
                />
              </div>
              {/* Sidebar toggle button - on the side when expanded */}
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className="rounded-lg text-slate-600  hover:bg-slate-100  transition-colors duration-200 p-1"
                  title="Collapse sidebar"
                  aria-label="Toggle Sidebar"
                >
                  <TbLayoutSidebarLeftCollapse size={40} />
                </button>
              )}
            </div>
          )}
          <hr className="border-slate-500  mx-6" />
        </div>

        {/* Navigation */}
        <nav className="transition-all duration-500 ease-in-out pt-4">
          {navItems.map((category, index) => (
            <div key={index} className="px-3">
              {/* Category label */}
              {category.category && !collapsed && (
                <div className="text-[0.65rem] uppercase tracking-wider text-slate-600  font-semibold px-4 py-2 transition-opacity duration-300">
                  {category.category}
                </div>
              )}
              {/* Category items */}
              <div className="space-y-1">
                {category.items.map((item: any) => {
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `group relative flex items-center ${
                          collapsed ? "px-3 py-2.5" : "px-4 py-2"
                        } rounded-lg transition-all duration-200 gap-3
                        ${
                          isActive
                            ? "bg-linear-to-r from-primary-600/90 to-primary-700/90 text-white font-semibold"
                            : "text-slate-700  hover:text-white  hover:bg-gray-400 "
                        }`
                      }
                      title={collapsed ? item.name : undefined}
                    >
                      <item.icon
                        className={`shrink-0 transition-all duration-200 ${
                          collapsed
                            ? "h-[1.65rem] w-[1.65rem]"
                            : "h-[1.45rem] w-[1.45rem]"
                        } group-hover:text-white `}
                      />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium transition-opacity duration-300">
                            {item.name}
                          </span>
                        </div>
                      )}
                      {/* Active indicator */}
                      {!collapsed && (
                        <div className="w-2 h-2 rounded-full bg-slate-500  opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
              {/* Category separator */}
              {index < navItems.length - 1 && (
                <div
                  className={`${
                    collapsed ? "mx-3" : "mx-4"
                  } my-4 border-t border-slate-500/50  transition-all duration-300`}
                ></div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom section with user info and logout */}
      <div>
        {/* User details */}
        {!collapsed && user && (
          <div className="bg-slate-200 py-3 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                <PiUserDuotone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.profile?.full_name || user?.email || "Admin"}
                </p>
                <p className="text-xs text-slate-500 capitalize truncate">
                  Role: {user?.role}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-slate-500/40 px-3 py-2 transition-all duration-300 ease-in-out space-y-2">
          {/* Logout button */}
          <div className="rounded-lg bg-red-600/80 hover:cursor-pointer backdrop-blur-sm p-0.5 border border-red-700">
            <button
              onClick={handleLogout}
              className={`flex w-full justify-center items-center rounded-[0.4rem] ${
                !collapsed ? "px-4 space-x-3" : "px-0 justify-center"
              } py-2.5 text-left text-sm font-medium text-white hover:cursor-pointer hover:bg-red-600 hover:text-white transition-colors duration-300`}
            >
              <LuLogOut className="w-5 h-5" />
              {!collapsed && (
                <span className="transition-opacity duration-300">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
