import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { UserProfile } from '@/components/features/auth/UserProfile'

export const DashboardPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your todo dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Stats
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-600">
                    Total Tasks
                  </h3>
                  <p className="text-2xl font-bold text-blue-900">0</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-600">
                    Completed
                  </h3>
                  <p className="text-2xl font-bold text-green-900">0</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-orange-600">
                    Pending
                  </h3>
                  <p className="text-2xl font-bold text-orange-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="lg:col-span-1">
            <UserProfile />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
