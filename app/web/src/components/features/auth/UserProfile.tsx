import React, { useState } from 'react'
import { User, Edit, Save, X, Loader2, LogOut } from 'lucide-react'
import { useProfile, useUpdateProfile, useLogout } from '../../../hooks/useAuth'
import { useLiveRegion } from '../../../hooks/useAccessibility'
import { LoadingSpinner } from '../../ui/LoadingSpinner'

export interface UserProfileProps {
  className?: string
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { data: profile, isLoading, error } = useProfile()
  const updateProfileMutation = useUpdateProfile()
  const logoutMutation = useLogout()
  const { announceStatus, announceError } = useLiveRegion()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
  })

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      })
    }
  }, [profile])

  const handleEdit = () => {
    setIsEditing(true)
    announceStatus('Edit mode enabled')
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      })
    }
    setIsEditing(false)
    announceStatus('Edit mode cancelled')
  }

  const handleSave = async () => {
    try {
      // Only send fields that have changed
      const updatedFields: any = {}
      if (formData.username !== profile?.username)
        updatedFields.username = formData.username
      if (formData.email !== profile?.email)
        updatedFields.email = formData.email
      if (formData.firstName !== profile?.firstName)
        updatedFields.firstName = formData.firstName
      if (formData.lastName !== profile?.lastName)
        updatedFields.lastName = formData.lastName

      if (Object.keys(updatedFields).length === 0) {
        announceStatus('No changes to save')
        setIsEditing(false)
        return
      }

      await updateProfileMutation.mutateAsync(updatedFields)
      setIsEditing(false)
      announceStatus('Profile updated successfully')
    } catch (error) {
      announceError(
        error instanceof Error ? error.message : 'Failed to update profile'
      )
    }
  }

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync()
      announceStatus('Logged out successfully')
    } catch (error) {
      announceError('Logout failed')
    }
  }

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    }

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <LoadingSpinner />
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Failed to load profile</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-full p-3 mr-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            <p className="text-gray-600">Manage your account information</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {updateProfileMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save
              </button>
              <button
                onClick={handleCancel}
                disabled={updateProfileMutation.isPending}
                className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          {isEditing ? (
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange('username')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={updateProfileMutation.isPending}
            />
          ) : (
            <p className="text-gray-900 py-2">{profile.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          {isEditing ? (
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={updateProfileMutation.isPending}
            />
          ) : (
            <p className="text-gray-900 py-2">{profile.email}</p>
          )}
        </div>

        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name
          </label>
          {isEditing ? (
            <input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={updateProfileMutation.isPending}
              placeholder="Enter first name"
            />
          ) : (
            <p className="text-gray-900 py-2">
              {profile.firstName || 'Not provided'}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name
          </label>
          {isEditing ? (
            <input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={updateProfileMutation.isPending}
              placeholder="Enter last name"
            />
          ) : (
            <p className="text-gray-900 py-2">
              {profile.lastName || 'Not provided'}
            </p>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <p className="text-gray-900 py-2">
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  profile.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Since
            </label>
            <p className="text-gray-900 py-2">
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Updated
            </label>
            <p className="text-gray-900 py-2">
              {new Date(profile.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {profile.lastLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Login
              </label>
              <p className="text-gray-900 py-2">
                {new Date(profile.lastLogin).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {updateProfileMutation.isError && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">
            {updateProfileMutation.error instanceof Error
              ? updateProfileMutation.error.message
              : 'Failed to update profile'}
          </p>
        </div>
      )}

      {/* Logout Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="flex items-center px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {logoutMutation.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Sign Out
        </button>
      </div>
    </div>
  )
}
