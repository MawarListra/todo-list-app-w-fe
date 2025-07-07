import React from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { UserProfile } from '@/components/features/auth/UserProfile'

export const ProfilePage: React.FC = () => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings</p>
        </div>

        <UserProfile />
      </div>
    </AppLayout>
  )
}
