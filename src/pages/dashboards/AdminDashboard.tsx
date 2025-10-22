import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import AdminLayout from "../../components/AdminLayout";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card border-l-4 border-primary-600">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.profile?.full_name || "Admin"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900">Total Members</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">1,234</p>
            <p className="text-xs text-blue-600 mt-1">+12% from last month</p>
          </div>

          <div className="card bg-green-50 border border-green-200">
            <h3 className="text-sm font-medium text-green-900">Total Agents</h3>
            <p className="text-3xl font-bold text-green-700 mt-2">56</p>
            <p className="text-xs text-green-600 mt-1">8 active today</p>
          </div>

          <div className="card bg-purple-50 border border-purple-200">
            <h3 className="text-sm font-medium text-purple-900">
              Total Premiums
            </h3>
            <p className="text-3xl font-bold text-purple-700 mt-2">KSh 450K</p>
            <p className="text-xs text-purple-600 mt-1">This month</p>
          </div>

          <div className="card bg-orange-50 border border-orange-200">
            <h3 className="text-sm font-medium text-orange-900">Pending KYC</h3>
            <p className="text-3xl font-bold text-orange-700 mt-2">23</p>
            <p className="text-xs text-orange-600 mt-1">Needs review</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-medium text-gray-900">Manage Super-Agents</h3>
              <p className="text-sm text-gray-600 mt-1">
                View and manage super-agents
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium text-gray-900">KYC Review Queue</h3>
              <p className="text-sm text-gray-600 mt-1">
                Approve pending applications
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900">Process Payouts</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage commission payouts
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-gray-900">View Reports</h3>
              <p className="text-sm text-gray-600 mt-1">
                Analytics and insights
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-medium text-gray-900">System Settings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Configure platform settings
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-medium text-gray-900">Reconciliation</h3>
              <p className="text-sm text-gray-600 mt-1">
                Review unmatched payments
              </p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xl">✅</div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New member registered
                </p>
                <p className="text-xs text-gray-600">
                  John Doe - 5 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xl">💰</div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Payment received
                </p>
                <p className="text-xs text-gray-600">
                  KSh 20 from Member ACC123 - 12 minutes ago
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-xl">👤</div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New agent added
                </p>
                <p className="text-xs text-gray-600">
                  Agent AGT456 by Super-Agent SA001 - 1 hour ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
