import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import SuperAgentDashboard from "./pages/dashboards/SuperAgentDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import MemberDashboard from "./pages/dashboards/MemberDashboard";
import PlansManagement from "./pages/admin/PlansManagement";
import MembersManagement from "./pages/admin/MembersManagement";
import AgentsManagement from "./pages/admin/AgentsManagement";
import SuperAgentsManagement from "./pages/admin/SuperAgentsManagement";
import KYCManagement from "./pages/admin/KYCManagement";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/plans"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PlansManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/members"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MembersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/agents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AgentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/super-agents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SuperAgentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/kyc"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KYCManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/super-agent"
          element={
            <ProtectedRoute allowedRoles={["super_agent"]}>
              <SuperAgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/agent"
          element={
            <ProtectedRoute allowedRoles={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/member"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
