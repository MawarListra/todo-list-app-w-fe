import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'

export const ListsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lists</h1>
          <p className="text-gray-600 mt-2">Organize your tasks in lists</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-gray-500 text-center py-8">
            List management features coming soon...
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
