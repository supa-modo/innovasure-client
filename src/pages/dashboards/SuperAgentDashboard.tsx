import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/DashboardLayout";

const SuperAgentDashboard = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <DashboardLayout role="super_agent" user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Super-Agent Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.profile?.full_name || "Super-Agent"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900">My Agents</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">12</p>
            <p className="text-xs text-blue-600 mt-1">4 active today</p>
          </div>

          <div className="card bg-green-50 border border-green-200">
            <h3 className="text-sm font-medium text-green-900">
              Total Members
            </h3>
            <p className="text-3xl font-bold text-green-700 mt-2">234</p>
            <p className="text-xs text-green-600 mt-1">Under my network</p>
          </div>

          <div className="card bg-purple-50 border border-purple-200">
            <h3 className="text-sm font-medium text-purple-900">
              Commission Balance
            </h3>
            <p className="text-3xl font-bold text-purple-700 mt-2">
              KSh 12,450
            </p>
            <p className="text-xs text-purple-600 mt-1">Ready for payout</p>
          </div>

          <div className="card bg-orange-50 border border-orange-200">
            <h3 className="text-sm font-medium text-orange-900">This Month</h3>
            <p className="text-3xl font-bold text-orange-700 mt-2">KSh 45K</p>
            <p className="text-xs text-orange-600 mt-1">
              Total premiums collected
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-medium text-gray-900">Register New Agent</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add agent to your network
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium text-gray-900">View My Agents</h3>
              <p className="text-sm text-gray-600 mt-1">Manage agent network</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900">Commission Report</h3>
              <p className="text-sm text-gray-600 mt-1">
                View earnings and payouts
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-gray-900">Performance Report</h3>
              <p className="text-sm text-gray-600 mt-1">Network analytics</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-medium text-gray-900">Network Members</h3>
              <p className="text-sm text-gray-600 mt-1">View all members</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-medium text-gray-900">Profile Settings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update your information
              </p>
            </button>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Top Performing Agents
          </h2>
          <div className="space-y-3">
            {[
              {
                name: "Agent John Doe",
                code: "AGT001",
                members: 45,
                commission: 3250,
              },
              {
                name: "Agent Jane Smith",
                code: "AGT002",
                members: 38,
                commission: 2870,
              },
              {
                name: "Agent Mike Johnson",
                code: "AGT003",
                members: 32,
                commission: 2400,
              },
            ].map((agent) => (
              <div
                key={agent.code}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {agent.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {agent.code} • {agent.members} members
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-700">
                    KSh {agent.commission.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600">This month</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAgentDashboard;
