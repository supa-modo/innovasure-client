import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetCode from "./pages/VerifyResetCode";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import SuperAgentDashboard from "./pages/dashboards/SuperAgentDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import MemberDashboard from "./pages/dashboards/MemberDashboard";
import PlansManagement from "./pages/admin/PlansManagement";
import MembersManagement from "./pages/admin/MembersManagement";
import AgentsManagement from "./pages/admin/AgentsManagement";
import SuperAgentsManagement from "./pages/admin/SuperAgentsManagement";
import KYCManagement from "./pages/admin/KYCManagement";
import PaymentsManagement from "./pages/admin/PaymentsManagement";
import SettlementsManagement from "./pages/admin/SettlementsManagement";
import ReportsPage from "./pages/admin/ReportsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />

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
          path="/admin/plans"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PlansManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MembersManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/agents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AgentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/super-agents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SuperAgentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <KYCManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PaymentsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settlements"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SettlementsManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-agent"
          element={
            <ProtectedRoute allowedRoles={["super_agent"]}>
              <SuperAgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <ProtectedRoute allowedRoles={["agent"]}>
              <AgentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/member"
          element={
            <ProtectedRoute allowedRoles={["member"]}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile route - accessible to all authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute
              allowedRoles={["admin", "super_agent", "agent", "member"]}
            >
              <Profile />
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
