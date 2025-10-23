import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import DashboardLayout from "../../components/DashboardLayout";

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <DashboardLayout role="agent" user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agent Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.profile?.full_name || "Agent"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card bg-blue-50 border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900">My Members</h3>
            <p className="text-3xl font-bold text-blue-700 mt-2">45</p>
            <p className="text-xs text-blue-600 mt-1">+3 this week</p>
          </div>

          <div className="card bg-green-50 border border-green-200">
            <h3 className="text-sm font-medium text-green-900">
              Active Policies
            </h3>
            <p className="text-3xl font-bold text-green-700 mt-2">42</p>
            <p className="text-xs text-green-600 mt-1">93% active rate</p>
          </div>

          <div className="card bg-purple-50 border border-purple-200">
            <h3 className="text-sm font-medium text-purple-900">
              Commission Balance
            </h3>
            <p className="text-3xl font-bold text-purple-700 mt-2">KSh 3,250</p>
            <p className="text-xs text-purple-600 mt-1">Ready for payout</p>
          </div>

          <div className="card bg-orange-50 border border-orange-200">
            <h3 className="text-sm font-medium text-orange-900">This Month</h3>
            <p className="text-3xl font-bold text-orange-700 mt-2">
              KSh 12,800
            </p>
            <p className="text-xs text-orange-600 mt-1">Premiums collected</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="text-2xl mb-2">👤</div>
              <h3 className="font-medium text-gray-900">Register New Member</h3>
              <p className="text-sm text-gray-600 mt-1">
                Add member to your portfolio
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium text-gray-900">View My Members</h3>
              <p className="text-sm text-gray-600 mt-1">
                Manage member profiles
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium text-gray-900">Commission Report</h3>
              <p className="text-sm text-gray-600 mt-1">
                View earnings history
              </p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium text-gray-900">Performance Stats</h3>
              <p className="text-sm text-gray-600 mt-1">Track your progress</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="font-medium text-gray-900">Payment Records</h3>
              <p className="text-sm text-gray-600 mt-1">View payment history</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-medium text-gray-900">Profile Settings</h3>
              <p className="text-sm text-gray-600 mt-1">
                Update your information
              </p>
            </button>
          </div>
        </div>

        {/* Recent Members */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Members
          </h2>
          <div className="space-y-3">
            {[
              {
                name: "John Kamau",
                account: "ACC001234",
                status: "Active",
                premium: 20,
              },
              {
                name: "Mary Wanjiku",
                account: "ACC001235",
                status: "Active",
                premium: 500,
              },
              {
                name: "Peter Odhiambo",
                account: "ACC001236",
                status: "Pending KYC",
                premium: 20,
              },
            ].map((member) => (
              <div
                key={member.account}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-600">{member.account}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {member.status}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    KSh {member.premium}/period
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
