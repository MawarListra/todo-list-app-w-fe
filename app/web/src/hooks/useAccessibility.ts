import { useEffect, useRef, useCallback } from 'react'
import {
  FocusManager,
  LiveRegionManager,
  AriaUtils,
} from '../utils/accessibility'

export interface UseFocusManagementProps {
  trapFocus?: boolean
  restoreFocus?: boolean
  autoFocus?: boolean
  skipLinks?: Array<{ id: string; label: string }>
}

export const useFocusManagement = ({
  trapFocus = false,
  restoreFocus = false,
  autoFocus = false,
  skipLinks = [],
}: UseFocusManagementProps = {}) => {
  const containerRef = useRef<HTMLElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Setup focus trap
  useEffect(() => {
    if (!trapFocus || !containerRef.current) return

    const cleanup = FocusManager.trapFocus(containerRef.current)
    cleanupRef.current = cleanup || null

    return cleanup
  }, [trapFocus])

  // Setup auto focus
  useEffect(() => {
    if (!autoFocus || !containerRef.current) return

    const focusableElements = FocusManager.getFocusableElements(
      containerRef.current
    )
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }, [autoFocus])

  // Setup skip links
  useEffect(() => {
    if (skipLinks.length === 0) return

    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.className = 'skip-links'
    skipLinksContainer.style.position = 'absolute'
    skipLinksContainer.style.top = '-9999px'
    skipLinksContainer.style.left = '-9999px'
    skipLinksContainer.style.zIndex = '9999'

    skipLinks.forEach((target) => {
      const skipLink = document.createElement('a')
      skipLink.href = `#${target.id}`
      skipLink.textContent = target.label
      skipLink.className =
        'skip-link bg-black text-white px-4 py-2 text-sm font-bold focus:top-0 focus:left-0'

      // Show on focus
      skipLink.addEventListener('focus', () => {
        skipLinksContainer.style.top = '0'
        skipLinksContainer.style.left = '0'
      })

      // Hide on blur
      skipLink.addEventListener('blur', () => {
        skipLinksContainer.style.top = '-9999px'
        skipLinksContainer.style.left = '-9999px'
      })

      skipLinksContainer.appendChild(skipLink)
    })

    document.body.insertBefore(skipLinksContainer, document.body.firstChild)

    return () => {
      if (skipLinksContainer.parentNode) {
        skipLinksContainer.parentNode.removeChild(skipLinksContainer)
      }
    }
  }, [skipLinks])

  // Restore focus on cleanup
  useEffect(() => {
    return () => {
      if (restoreFocus) {
        FocusManager.restoreFocus()
      }
    }
  }, [restoreFocus])

  // Utility functions
  const moveFocus = useCallback((direction: 'next' | 'previous') => {
    FocusManager.moveFocus(direction, containerRef.current || undefined)
  }, [])

  const restoreFocusTo = useCallback((element: HTMLElement) => {
    element.focus()
  }, [])

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    return FocusManager.getFocusableElements(containerRef.current)
  }, [])

  return {
    containerRef,
    moveFocus,
    restoreFocusTo,
    getFocusableElements,
    focusManager: FocusManager,
  }
}

export interface UseAriaProps {
  role?: string
  label?: string
  labelledBy?: string
  describedBy?: string
  expanded?: boolean
  selected?: boolean
  invalid?: boolean
  required?: boolean
  live?: 'polite' | 'assertive' | 'off'
}

export const useAria = ({
  role,
  label,
  labelledBy,
  describedBy,
  expanded,
  selected,
  invalid,
  required,
  live,
}: UseAriaProps = {}) => {
  const elementRef = useRef<HTMLElement>(null)
  const ariaId = useRef(AriaUtils.generateId())

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    // Set basic ARIA attributes
    if (role) element.setAttribute('role', role)
    if (label) element.setAttribute('aria-label', label)
    if (labelledBy) element.setAttribute('aria-labelledby', labelledBy)
    if (describedBy) element.setAttribute('aria-describedby', describedBy)
    if (expanded !== undefined)
      element.setAttribute('aria-expanded', expanded.toString())
    if (selected !== undefined)
      element.setAttribute('aria-selected', selected.toString())
    if (invalid !== undefined)
      element.setAttribute('aria-invalid', invalid.toString())
    if (required !== undefined)
      element.setAttribute('aria-required', required.toString())
    if (live && live !== 'off') element.setAttribute('aria-live', live)

    // Cleanup
    return () => {
      if (role) element.removeAttribute('role')
      if (label) element.removeAttribute('aria-label')
      if (labelledBy) element.removeAttribute('aria-labelledby')
      if (describedBy) element.removeAttribute('aria-describedby')
      if (expanded !== undefined) element.removeAttribute('aria-expanded')
      if (selected !== undefined) element.removeAttribute('aria-selected')
      if (invalid !== undefined) element.removeAttribute('aria-invalid')
      if (required !== undefined) element.removeAttribute('aria-required')
      if (live && live !== 'off') element.removeAttribute('aria-live')
    }
  }, [
    role,
    label,
    labelledBy,
    describedBy,
    expanded,
    selected,
    invalid,
    required,
    live,
  ])

  return {
    elementRef,
    ariaId: ariaId.current,
    ariaUtils: AriaUtils,
  }
}

export interface UseLiveRegionProps {
  id?: string
  priority?: 'polite' | 'assertive'
}

export const useLiveRegion = ({
  id,
  priority = 'polite',
}: UseLiveRegionProps = {}) => {
  const regionId = useRef(id || AriaUtils.generateId('live-region'))

  const announce = useCallback(
    (message: string, urgency?: 'polite' | 'assertive') => {
      LiveRegionManager.announce(message, urgency || priority)
    },
    [priority]
  )

  const announceStatus = useCallback((message: string) => {
    LiveRegionManager.announceStatus(message)
  }, [])

  const announceError = useCallback((message: string) => {
    LiveRegionManager.announceError(message)
  }, [])

  // Setup live region
  useEffect(() => {
    LiveRegionManager.getOrCreateLiveRegion(regionId.current, priority)

    return () => {
      // Don't cleanup here as other components might be using the same region
    }
  }, [priority])

  return {
    regionId: regionId.current,
    announce,
    announceStatus,
    announceError,
    liveRegionManager: LiveRegionManager,
  }
}

export interface UseKeyboardNavigationProps {
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onEnter?: () => void
  onSpace?: () => void
  onEscape?: () => void
  onTab?: () => void
  onHome?: () => void
  onEnd?: () => void
  disabled?: boolean
}

export const useKeyboardNavigation = ({
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  onEnter,
  onSpace,
  onEscape,
  onTab,
  onHome,
  onEnd,
  disabled = false,
}: UseKeyboardNavigationProps = {}) => {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!elementRef.current || disabled) return

    const element = elementRef.current

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          onArrowUp?.()
          break
        case 'ArrowDown':
          onArrowDown?.()
          break
        case 'ArrowLeft':
          onArrowLeft?.()
          break
        case 'ArrowRight':
          onArrowRight?.()
          break
        case 'Enter':
          onEnter?.()
          break
        case ' ':
          onSpace?.()
          break
        case 'Escape':
          onEscape?.()
          break
        case 'Tab':
          onTab?.()
          break
        case 'Home':
          onHome?.()
          break
        case 'End':
          onEnd?.()
          break
      }
    }

    element.addEventListener('keydown', handleKeyDown)

    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    onEnter,
    onSpace,
    onEscape,
    onTab,
    onHome,
    onEnd,
    disabled,
  ])

  return { elementRef }
}

export default useFocusManagement
