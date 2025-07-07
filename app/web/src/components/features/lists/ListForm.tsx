import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { Modal } from '@/components/ui/Modal'
import { List, ListCreateData, ListUpdateData } from '@/types/list.types'

export interface ListFormProps {
  list?: List
  isOpen: boolean
  onSubmit: (data: ListCreateData | ListUpdateData) => Promise<void>
  onCancel: () => void
  isEditing?: boolean
  loading?: boolean
}

interface FormData {
  name: string
  description: string
}

interface FormErrors {
  name?: string
  description?: string
}

export const ListForm: React.FC<ListFormProps> = ({
  list,
  isOpen,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: list?.name || '',
    description: list?.description || '',
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Reset form when list prop changes or modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        name: list?.name || '',
        description: list?.description || '',
      })
      setErrors({})
    }
  }, [list, isOpen])

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'List name is required'
    } else if (formData.name.trim().length < 1) {
      newErrors.name = 'List name must be at least 1 character'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'List name must be less than 100 characters'
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      }

      await onSubmit(submitData)
      onCancel() // Close modal on success
    } catch (error) {
      console.error('Failed to submit form:', error)
      // Handle error - could show toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle input changes
  const handleInputChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }))
      }
    }

  // Handle cancel
  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
    })
    setErrors({})
    onCancel()
  }

  const title = isEditing ? 'Edit List' : 'Create New List'
  const submitLabel = isEditing ? 'Update List' : 'Create List'

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <TextInput
            label="List Name"
            placeholder="Enter list name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            disabled={isSubmitting || loading}
            required
            autoFocus
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            placeholder="Enter list description"
            value={formData.description}
            onChange={handleInputChange('description')}
            disabled={isSubmitting || loading}
            rows={3}
            maxLength={500}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'resize-none',
              errors.description && 'border-red-500'
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting || loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading || !formData.name.trim()}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Standalone form component (without modal wrapper)
export interface StandaloneListFormProps {
  list?: List
  onSubmit: (data: ListCreateData | ListUpdateData) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
  loading?: boolean
  className?: string
}

export const StandaloneListForm: React.FC<StandaloneListFormProps> = ({
  list,
  onSubmit,
  onCancel,
  isEditing = false,
  loading = false,
  className,
}) => {
  const [formData, setFormData] = React.useState<FormData>({
    name: list?.name || '',
    description: list?.description || '',
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Similar logic as above but without modal wrapper
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'List name is required'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'List name must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Failed to submit form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))

      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }))
      }
    }

  const submitLabel = isEditing ? 'Update List' : 'Create List'

  return (
    <div className={cn('bg-white rounded-lg p-6', className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        {isEditing ? 'Edit List' : 'Create New List'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <TextInput
            label="List Name"
            placeholder="Enter list name"
            value={formData.name}
            onChange={handleInputChange('name')}
            error={errors.name}
            disabled={isSubmitting || loading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            placeholder="Enter list description"
            value={formData.description}
            onChange={handleInputChange('description')}
            disabled={isSubmitting || loading}
            rows={3}
            maxLength={500}
            className={cn(
              'w-full px-3 py-2 border border-gray-300 rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'resize-none',
              errors.description && 'border-red-500'
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading || !formData.name.trim()}
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
