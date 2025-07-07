import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

export interface UseKeyboardShortcutsProps {
  shortcuts?: KeyboardShortcut[]
  disabled?: boolean
  onNewTask?: () => void
  onSearch?: () => void
  onHelp?: () => void
  onSave?: () => void
  onCancel?: () => void
}

export const useKeyboardShortcuts = ({
  shortcuts = [],
  disabled = false,
  onNewTask,
  onSearch,
  onHelp,
  onSave,
  onCancel,
}: UseKeyboardShortcutsProps = {}) => {
  const navigate = useNavigate()
  const shortcutsRef = useRef<KeyboardShortcut[]>([])

  // Create default shortcuts with actual handlers
  const createDefaultShortcuts = useCallback((): KeyboardShortcut[] => {
    return [
      {
        key: 'n',
        ctrlKey: true,
        action: () => {
          onNewTask?.()
        },
        description: 'Create new task (Ctrl+N)',
        preventDefault: true,
      },
      {
        key: 'n',
        metaKey: true,
        action: () => {
          onNewTask?.()
        },
        description: 'Create new task (⌘+N)',
        preventDefault: true,
      },
      {
        key: 'k',
        ctrlKey: true,
        action: () => {
          onSearch?.()
        },
        description: 'Open search (Ctrl+K)',
        preventDefault: true,
      },
      {
        key: 'k',
        metaKey: true,
        action: () => {
          onSearch?.()
        },
        description: 'Open search (⌘+K)',
        preventDefault: true,
      },
      {
        key: '/',
        ctrlKey: true,
        action: () => {
          onHelp?.()
        },
        description: 'Show help (Ctrl+/)',
        preventDefault: true,
      },
      {
        key: '/',
        metaKey: true,
        action: () => {
          onHelp?.()
        },
        description: 'Show help (⌘+/)',
        preventDefault: true,
      },
      {
        key: 's',
        ctrlKey: true,
        action: () => {
          onSave?.()
        },
        description: 'Save (Ctrl+S)',
        preventDefault: true,
      },
      {
        key: 's',
        metaKey: true,
        action: () => {
          onSave?.()
        },
        description: 'Save (⌘+S)',
        preventDefault: true,
      },
      {
        key: 'Escape',
        action: () => {
          onCancel?.()
        },
        description: 'Cancel/Close (Escape)',
        preventDefault: true,
      },
      // Navigation shortcuts
      {
        key: '1',
        ctrlKey: true,
        action: () => navigate('/'),
        description: 'Go to Dashboard (Ctrl+1)',
        preventDefault: true,
      },
      {
        key: '2',
        ctrlKey: true,
        action: () => navigate('/lists'),
        description: 'Go to Lists (Ctrl+2)',
        preventDefault: true,
      },
      {
        key: '3',
        ctrlKey: true,
        action: () => navigate('/analytics'),
        description: 'Go to Analytics (Ctrl+3)',
        preventDefault: true,
      },
      {
        key: '4',
        ctrlKey: true,
        action: () => navigate('/settings'),
        description: 'Go to Settings (Ctrl+4)',
        preventDefault: true,
      },
    ]
  }, [onNewTask, onSearch, onHelp, onSave, onCancel, navigate])

  // Combine default shortcuts with custom ones
  const allShortcuts = [...createDefaultShortcuts(), ...shortcuts]
  shortcutsRef.current = allShortcuts

  // Check if key event matches a shortcut
  const matchesShortcut = (
    event: KeyboardEvent,
    shortcut: KeyboardShortcut
  ): boolean => {
    const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
    const ctrlMatches = Boolean(event.ctrlKey) === Boolean(shortcut.ctrlKey)
    const metaMatches = Boolean(event.metaKey) === Boolean(shortcut.metaKey)
    const altMatches = Boolean(event.altKey) === Boolean(shortcut.altKey)
    const shiftMatches = Boolean(event.shiftKey) === Boolean(shortcut.shiftKey)

    return (
      keyMatches && ctrlMatches && metaMatches && altMatches && shiftMatches
    )
  }

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return

      // Don't handle shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow some global shortcuts even in input fields
        const globalShortcuts = ['Escape', 'k'] // Escape and Ctrl+K should work everywhere
        if (!globalShortcuts.includes(event.key)) {
          return
        }
      }

      // Find matching shortcut
      const matchingShortcut = shortcutsRef.current.find((shortcut) =>
        matchesShortcut(event, shortcut)
      )

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault) {
          event.preventDefault()
        }
        matchingShortcut.action()
      }
    },
    [disabled]
  )

  // Handle arrow key navigation
  const handleArrowNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return

      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      // Find focusable elements
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const focusableArray = Array.from(focusableElements) as HTMLElement[]
      const currentIndex = focusableArray.indexOf(
        document.activeElement as HTMLElement
      )

      if (currentIndex === -1) return

      let nextIndex = currentIndex

      switch (event.key) {
        case 'ArrowUp':
          nextIndex = Math.max(0, currentIndex - 1)
          break
        case 'ArrowDown':
          nextIndex = Math.min(focusableArray.length - 1, currentIndex + 1)
          break
        case 'ArrowLeft':
          if (event.ctrlKey || event.metaKey) {
            nextIndex = Math.max(0, currentIndex - 1)
          }
          break
        case 'ArrowRight':
          if (event.ctrlKey || event.metaKey) {
            nextIndex = Math.min(focusableArray.length - 1, currentIndex + 1)
          }
          break
        default:
          return
      }

      if (nextIndex !== currentIndex) {
        event.preventDefault()
        focusableArray[nextIndex]?.focus()
      }
    },
    [disabled]
  )

  // Set up event listeners
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      handleKeyDown(event)
      handleArrowNavigation(event)
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyDown, handleArrowNavigation])

  // Get shortcuts for display (e.g., in help dialog)
  const getShortcuts = useCallback(() => {
    return shortcutsRef.current.map((shortcut) => ({
      ...shortcut,
      displayKey: formatShortcutKey(shortcut),
    }))
  }, [])

  // Format shortcut key for display
  const formatShortcutKey = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = []

    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.metaKey) parts.push('⌘')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')

    parts.push(shortcut.key.toUpperCase())

    return parts.join(' + ')
  }

  return {
    shortcuts: allShortcuts,
    getShortcuts,
    formatShortcutKey,
  }
}

export default useKeyboardShortcuts
