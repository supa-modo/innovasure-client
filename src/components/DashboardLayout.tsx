import { User } from '../store/authStore'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: string
  user: User | null
  onLogout: () => void
}

const roleColors: Record<string, string> = {
  admin: 'primary',
  super_agent: 'purple',
  agent: 'green',
  member: 'blue',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  super_agent: 'Super-Agent',
  agent: 'Agent',
  member: 'Member',
}

const DashboardLayout = ({ children, role, user, onLogout }: DashboardLayoutProps) => {
  const color = roleColors[role] || 'primary'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`bg-white border-b border-gray-200 shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">Innovasure</h1>
              <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium bg-${color}-100 text-${color}-800`}>
                {roleLabels[role]}
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-600">{user?.phone}</p>
              </div>

              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2025 Innovasure. All rights reserved. | Micro-Insurance Platform
          </p>
        </div>
      </footer>
    </div>
  )
}

export default DashboardLayout

