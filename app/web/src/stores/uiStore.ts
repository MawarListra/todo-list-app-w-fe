import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Modal {
  id: string
  type:
    | 'create-list'
    | 'edit-list'
    | 'delete-list'
    | 'create-task'
    | 'edit-task'
    | 'delete-task'
    | 'confirm'
  isOpen: boolean
  data?: any
  onConfirm?: () => void
  onCancel?: () => void
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  isVisible: boolean
  createdAt: number
}

export interface LoadingState {
  [key: string]: boolean
}

export interface UiState {
  // Modal state
  modals: Modal[]
  openModal: (modal: Omit<Modal, 'id' | 'isOpen'>) => string
  closeModal: (id: string) => void
  closeAllModals: () => void

  // Toast state
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id' | 'isVisible' | 'createdAt'>) => string
  hideToast: (id: string) => void
  clearAllToasts: () => void

  // Loading states
  loadingStates: LoadingState
  setLoading: (key: string, isLoading: boolean) => void
  isLoading: (key: string) => boolean

  // Theme preferences
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Sidebar state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void

  // View preferences
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      // Modal state
      modals: [],
      openModal: (modal) => {
        const id = `modal-${Date.now()}-${Math.random()}`
        set((state) => ({
          modals: [...state.modals, { ...modal, id, isOpen: true }],
        }))
        return id
      },
      closeModal: (id) => {
        set((state) => ({
          modals: state.modals.filter((modal) => modal.id !== id),
        }))
      },
      closeAllModals: () => {
        set({ modals: [] })
      },

      // Toast state
      toasts: [],
      showToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random()}`
        const newToast: Toast = {
          ...toast,
          id,
          isVisible: true,
          createdAt: Date.now(),
          duration: toast.duration || 5000,
        }

        set((state) => ({
          toasts: [...state.toasts, newToast],
        }))

        // Auto-hide toast after duration
        if (newToast.duration > 0) {
          setTimeout(() => {
            get().hideToast(id)
          }, newToast.duration)
        }

        return id
      },
      hideToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }))
      },
      clearAllToasts: () => {
        set({ toasts: [] })
      },

      // Loading states
      loadingStates: {},
      setLoading: (key, isLoading) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: isLoading,
          },
        }))
      },
      isLoading: (key) => {
        return get().loadingStates[key] || false
      },

      // Theme preferences
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
      },

      // Sidebar state
      sidebarOpen: false,
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      // View preferences
      viewMode: 'grid',
      setViewMode: (mode) => {
        set({ viewMode: mode })
      },
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        viewMode: state.viewMode,
      }),
    }
  )
)
