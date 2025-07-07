import { useToast as useToastFromProvider } from '@/components/ui/ToastProvider'

export const useToast = () => {
  const { addToast, removeToast, clearToasts } = useToastFromProvider()

  const toast = {
    success: (
      message: string,
      options?: { title?: string; duration?: number }
    ) => {
      addToast({
        variant: 'success',
        title: options?.title,
        description: message,
        duration: options?.duration,
      })
    },
    error: (
      message: string,
      options?: { title?: string; duration?: number }
    ) => {
      addToast({
        variant: 'error',
        title: options?.title,
        description: message,
        duration: options?.duration,
      })
    },
    warning: (
      message: string,
      options?: { title?: string; duration?: number }
    ) => {
      addToast({
        variant: 'warning',
        title: options?.title,
        description: message,
        duration: options?.duration,
      })
    },
    info: (
      message: string,
      options?: { title?: string; duration?: number }
    ) => {
      addToast({
        variant: 'info',
        title: options?.title,
        description: message,
        duration: options?.duration,
      })
    },
    custom: (toast: {
      title?: string
      description?: string
      variant?: 'success' | 'error' | 'warning' | 'info'
      duration?: number
      action?: {
        label: string
        onClick: () => void
      }
    }) => {
      addToast(toast)
    },
  }

  return {
    toast,
    dismiss: removeToast,
    dismissAll: clearToasts,
  }
}
