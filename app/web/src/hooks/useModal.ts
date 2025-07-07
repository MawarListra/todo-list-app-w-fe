import { useCallback, useEffect, useRef } from 'react'
import { useUiStore } from '../stores/uiStore'

export interface ModalOptions {
  type:
    | 'create-list'
    | 'edit-list'
    | 'delete-list'
    | 'create-task'
    | 'edit-task'
    | 'delete-task'
    | 'confirm'
  data?: any
  onConfirm?: () => void
  onCancel?: () => void
}

export const useModal = () => {
  const { modals, openModal, closeModal, closeAllModals } = useUiStore()

  const modalStackRef = useRef<string[]>([])

  // Get the current active modal (top of stack)
  const activeModal = modals.find((modal) => modal.isOpen)

  // Open a new modal
  const open = useCallback(
    (options: ModalOptions) => {
      const modalId = openModal(options)
      modalStackRef.current.push(modalId)
      return modalId
    },
    [openModal]
  )

  // Close a specific modal
  const close = useCallback(
    (id?: string) => {
      if (id) {
        closeModal(id)
        modalStackRef.current = modalStackRef.current.filter(
          (modalId) => modalId !== id
        )
      } else if (activeModal) {
        closeModal(activeModal.id)
        modalStackRef.current = modalStackRef.current.filter(
          (modalId) => modalId !== activeModal.id
        )
      }
    },
    [closeModal, activeModal]
  )

  // Close all modals
  const closeAll = useCallback(() => {
    closeAllModals()
    modalStackRef.current = []
  }, [closeAllModals])

  // Focus management for accessibility
  const focusableElementsRef = useRef<HTMLElement[]>([])
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)

  // Set up focus management when modal opens
  useEffect(() => {
    if (activeModal) {
      // Store the last focused element
      lastFocusedElementRef.current = document.activeElement as HTMLElement

      // Find focusable elements in the modal
      const modalElement = document.querySelector(
        `[data-modal-id="${activeModal.id}"]`
      )
      if (modalElement) {
        const focusableElements = modalElement.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        focusableElementsRef.current = Array.from(focusableElements)

        // Focus the first focusable element
        if (focusableElements.length > 0) {
          focusableElements[0].focus()
        }
      }
    } else {
      // Restore focus when modal closes
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus()
      }
    }
  }, [activeModal])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!activeModal) return

      switch (event.key) {
        case 'Escape':
          event.preventDefault()
          close()
          break
        case 'Tab':
          // Trap focus within the modal
          if (focusableElementsRef.current.length > 0) {
            const firstFocusable = focusableElementsRef.current[0]
            const lastFocusable =
              focusableElementsRef.current[
                focusableElementsRef.current.length - 1
              ]

            if (event.shiftKey) {
              // Shift + Tab
              if (document.activeElement === firstFocusable) {
                event.preventDefault()
                lastFocusable.focus()
              }
            } else {
              // Tab
              if (document.activeElement === lastFocusable) {
                event.preventDefault()
                firstFocusable.focus()
              }
            }
          }
          break
      }
    },
    [activeModal, close]
  )

  // Set up keyboard event listeners
  useEffect(() => {
    if (activeModal) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeModal, handleKeyDown])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [activeModal])

  // Modal stack management
  const getModalStack = useCallback(() => {
    return modalStackRef.current
  }, [])

  const isModalOpen = useCallback(
    (id?: string) => {
      if (id) {
        return modals.some((modal) => modal.id === id && modal.isOpen)
      }
      return modals.some((modal) => modal.isOpen)
    },
    [modals]
  )

  const getModalData = useCallback(
    (id?: string) => {
      if (id) {
        return modals.find((modal) => modal.id === id)?.data
      }
      return activeModal?.data
    },
    [modals, activeModal]
  )

  return {
    // Modal state
    modals,
    activeModal,
    isOpen: !!activeModal,
    modalStack: getModalStack(),

    // Modal actions
    open,
    close,
    closeAll,

    // Helper functions
    isModalOpen,
    getModalData,

    // Focus management (for custom modal implementations)
    focusableElements: focusableElementsRef.current,
    lastFocusedElement: lastFocusedElementRef.current,
  }
}

// Specialized hooks for different modal types
export const useConfirmModal = () => {
  const { open, close } = useModal()

  const confirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      options?: {
        title?: string
        confirmText?: string
        cancelText?: string
        danger?: boolean
      }
    ) => {
      return open({
        type: 'confirm',
        data: {
          message,
          title: options?.title || 'Confirm Action',
          confirmText: options?.confirmText || 'Confirm',
          cancelText: options?.cancelText || 'Cancel',
          danger: options?.danger || false,
        },
        onConfirm,
        onCancel: close,
      })
    },
    [open, close]
  )

  return { confirm }
}

export const useListModal = () => {
  const { open, close } = useModal()

  const createList = useCallback(
    (onSubmit: (data: any) => void) => {
      return open({
        type: 'create-list',
        onConfirm: () => onSubmit({}),
        onCancel: close,
      })
    },
    [open, close]
  )

  const editList = useCallback(
    (listData: any, onSubmit: (data: any) => void) => {
      return open({
        type: 'edit-list',
        data: listData,
        onConfirm: () => onSubmit(listData),
        onCancel: close,
      })
    },
    [open, close]
  )

  const deleteList = useCallback(
    (listData: any, onConfirm: () => void) => {
      return open({
        type: 'delete-list',
        data: listData,
        onConfirm,
        onCancel: close,
      })
    },
    [open, close]
  )

  return { createList, editList, deleteList }
}

export const useTaskModal = () => {
  const { open, close } = useModal()

  const createTask = useCallback(
    (listId: string, onSubmit: (data: any) => void) => {
      return open({
        type: 'create-task',
        data: { listId },
        onConfirm: () => onSubmit({ listId }),
        onCancel: close,
      })
    },
    [open, close]
  )

  const editTask = useCallback(
    (taskData: any, onSubmit: (data: any) => void) => {
      return open({
        type: 'edit-task',
        data: taskData,
        onConfirm: () => onSubmit(taskData),
        onCancel: close,
      })
    },
    [open, close]
  )

  const deleteTask = useCallback(
    (taskData: any, onConfirm: () => void) => {
      return open({
        type: 'delete-task',
        data: taskData,
        onConfirm,
        onCancel: close,
      })
    },
    [open, close]
  )

  return { createTask, editTask, deleteTask }
}
