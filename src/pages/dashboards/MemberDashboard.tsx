import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import DashboardLayout from '../../components/DashboardLayout'

const MemberDashboard = () => {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <DashboardLayout role="member" user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card border-l-4 border-blue-600">
          <h1 className="text-2xl font-bold text-gray-900">Member Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.profile?.full_name || 'Member'}</p>
        </div>

        {/* Coverage Status */}
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Coverage Status</h2>
              <p className="text-sm text-gray-600 mt-1">Policy is currently active</p>
            </div>
            <div className="text-5xl">🛡️</div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Coverage Amount</p>
              <p className="text-2xl font-bold text-blue-700">KSh 50,000</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Payment Due</p>
              <p className="text-2xl font-bold text-blue-700">Oct 25, 2025</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-green-50 border border-green-200">
            <h3 className="text-sm font-medium text-green-900">Premium Amount</h3>
            <p className="text-3xl font-bold text-green-700 mt-2">KSh 20</p>
            <p className="text-xs text-green-600 mt-1">Daily plan</p>
          </div>

          <div className="card bg-purple-50 border border-purple-200">
            <h3 className="text-sm font-medium text-purple-900">Days Covered</h3>
            <p className="text-3xl font-bold text-purple-700 mt-2">15</p>
            <p className="text-xs text-purple-600 mt-1">This month</p>
          </div>

          <div className="card bg-orange-50 border border-orange-200">
            <h3 className="text-sm font-medium text-orange-900">Total Paid</h3>
            <p className="text-3xl font-bold text-orange-700 mt-2">KSh 300</p>
            <p className="text-xs text-orange-600 mt-1">This month</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">💳</div>
              <h3 className="font-medium text-gray-900">Make Payment</h3>
              <p className="text-sm text-gray-600 mt-1">Pay premium via M-Pesa</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="font-medium text-gray-900">Payment History</h3>
              <p className="text-sm text-gray-600 mt-1">View past payments</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">👨‍👩‍👧‍👦</div>
              <h3 className="font-medium text-gray-900">Manage Dependants</h3>
              <p className="text-sm text-gray-600 mt-1">Add or edit dependants</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-medium text-gray-900">My Policy</h3>
              <p className="text-sm text-gray-600 mt-1">View policy details</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">📞</div>
              <h3 className="font-medium text-gray-900">File a Claim</h3>
              <p className="text-sm text-gray-600 mt-1">Submit insurance claim</p>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-medium text-gray-900">Profile Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Update your information</p>
            </button>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="card bg-blue-50 border border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">How to Make Payment</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>1.</strong> Go to M-Pesa on your phone</p>
            <p><strong>2.</strong> Select Lipa na M-Pesa</p>
            <p><strong>3.</strong> Select Pay Bill</p>
            <p><strong>4.</strong> Enter Business Number: <strong className="text-blue-700">174379</strong></p>
            <p><strong>5.</strong> Enter Account Number: <strong className="text-blue-700">ACC001234</strong> (Your account)</p>
            <p><strong>6.</strong> Enter Amount: <strong className="text-blue-700">KSh 20</strong></p>
            <p><strong>7.</strong> Enter your M-Pesa PIN and confirm</p>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Payments</h2>
          <div className="space-y-3">
            {[
              { date: '2025-10-20', amount: 20, status: 'Confirmed', ref: 'NLJ123456' },
              { date: '2025-10-19', amount: 20, status: 'Confirmed', ref: 'NLJ123455' },
              { date: '2025-10-18', amount: 20, status: 'Confirmed', ref: 'NLJ123454' },
            ].map((payment) => (
              <div key={payment.ref} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{payment.date}</p>
                  <p className="text-xs text-gray-600">Ref: {payment.ref}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-700">KSh {payment.amount}</p>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MemberDashboard

