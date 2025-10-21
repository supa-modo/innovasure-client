import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardMap: Record<string, string> = {
      admin: '/dashboard/admin',
      super_agent: '/dashboard/super-agent',
      agent: '/dashboard/agent',
      member: '/dashboard/member',
    }
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

