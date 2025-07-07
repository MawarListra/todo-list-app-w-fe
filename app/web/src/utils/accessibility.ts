/**
 * Accessibility utilities for focus management, ARIA labels, and live regions
 */

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = []

  // Trap focus within a container
  static trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }

      if (event.key === 'Escape') {
        this.restoreFocus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // Store current focus and focus first element
    if (document.activeElement) {
      this.focusStack.push(document.activeElement as HTMLElement)
    }
    firstElement.focus()

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }

  // Restore focus to previous element
  static restoreFocus() {
    const previousElement = this.focusStack.pop()
    if (previousElement) {
      previousElement.focus()
    }
  }

  // Get all focusable elements in container
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    return Array.from(focusableElements) as HTMLElement[]
  }

  // Move focus to next/previous element
  static moveFocus(direction: 'next' | 'previous', container?: HTMLElement) {
    const root = container || document.body
    const focusableElements = this.getFocusableElements(root)
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    )

    if (currentIndex === -1) return

    let nextIndex: number
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % focusableElements.length
    } else {
      nextIndex =
        (currentIndex - 1 + focusableElements.length) % focusableElements.length
    }

    focusableElements[nextIndex]?.focus()
  }
}

// Live region utilities
export class LiveRegionManager {
  private static liveRegions: Map<string, HTMLElement> = new Map()

  // Create or get live region
  static getOrCreateLiveRegion(
    id: string,
    priority: 'polite' | 'assertive' = 'polite'
  ): HTMLElement {
    if (this.liveRegions.has(id)) {
      return this.liveRegions.get(id)!
    }

    const liveRegion = document.createElement('div')
    liveRegion.id = id
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only' // Screen reader only
    liveRegion.style.position = 'absolute'
    liveRegion.style.left = '-9999px'
    liveRegion.style.width = '1px'
    liveRegion.style.height = '1px'
    liveRegion.style.overflow = 'hidden'

    document.body.appendChild(liveRegion)
    this.liveRegions.set(id, liveRegion)

    return liveRegion
  }

  // Announce message to screen readers
  static announce(
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) {
    const liveRegion = this.getOrCreateLiveRegion(
      'global-announcements',
      priority
    )
    liveRegion.textContent = message

    // Clear after a short delay to allow for repeated announcements
    setTimeout(() => {
      liveRegion.textContent = ''
    }, 1000)
  }

  // Announce status updates
  static announceStatus(message: string) {
    this.announce(message, 'polite')
  }

  // Announce errors or urgent messages
  static announceError(message: string) {
    this.announce(message, 'assertive')
  }

  // Clean up live regions
  static cleanup() {
    this.liveRegions.forEach((region) => {
      if (region.parentNode) {
        region.parentNode.removeChild(region)
      }
    })
    this.liveRegions.clear()
  }
}

// ARIA utilities
export class AriaUtils {
  // Generate unique IDs for ARIA relationships
  static generateId(prefix: string = 'aria'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Set ARIA attributes for form field and label
  static linkFormField(
    input: HTMLElement,
    label: HTMLElement,
    error?: HTMLElement
  ) {
    const labelId = label.id || this.generateId('label')
    const inputId = input.id || this.generateId('input')

    label.id = labelId
    input.id = inputId
    input.setAttribute('aria-labelledby', labelId)

    if (error) {
      const errorId = error.id || this.generateId('error')
      error.id = errorId
      input.setAttribute('aria-describedby', errorId)
      input.setAttribute('aria-invalid', 'true')
    }
  }

  // Set ARIA attributes for expandable content
  static linkExpandableContent(
    trigger: HTMLElement,
    content: HTMLElement,
    expanded: boolean
  ) {
    const contentId = content.id || this.generateId('content')
    content.id = contentId

    trigger.setAttribute('aria-expanded', expanded.toString())
    trigger.setAttribute('aria-controls', contentId)

    if (!expanded) {
      content.setAttribute('aria-hidden', 'true')
    } else {
      content.removeAttribute('aria-hidden')
    }
  }

  // Set ARIA attributes for tab panel
  static linkTabPanel(tab: HTMLElement, panel: HTMLElement, selected: boolean) {
    const panelId = panel.id || this.generateId('panel')
    const tabId = tab.id || this.generateId('tab')

    tab.id = tabId
    panel.id = panelId

    tab.setAttribute('aria-controls', panelId)
    tab.setAttribute('aria-selected', selected.toString())

    panel.setAttribute('aria-labelledby', tabId)

    if (!selected) {
      panel.setAttribute('aria-hidden', 'true')
    } else {
      panel.removeAttribute('aria-hidden')
    }
  }

  // Set ARIA attributes for modal dialog
  static setupModalDialog(dialog: HTMLElement, title?: HTMLElement) {
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')

    if (title) {
      const titleId = title.id || this.generateId('title')
      title.id = titleId
      dialog.setAttribute('aria-labelledby', titleId)
    }
  }
}

// Skip link utilities
export class SkipLinkManager {
  // Create skip links for navigation
  static createSkipLinks(targets: Array<{ id: string; label: string }>) {
    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.className = 'skip-links'
    skipLinksContainer.style.position = 'absolute'
    skipLinksContainer.style.top = '-9999px'
    skipLinksContainer.style.left = '-9999px'
    skipLinksContainer.style.zIndex = '9999'

    targets.forEach((target) => {
      const skipLink = document.createElement('a')
      skipLink.href = `#${target.id}`
      skipLink.textContent = target.label
      skipLink.className = 'skip-link'

      // Style skip link
      skipLink.style.position = 'absolute'
      skipLink.style.top = '0'
      skipLink.style.left = '0'
      skipLink.style.padding = '8px 16px'
      skipLink.style.backgroundColor = '#000'
      skipLink.style.color = '#fff'
      skipLink.style.textDecoration = 'none'
      skipLink.style.fontSize = '14px'
      skipLink.style.fontWeight = 'bold'
      skipLink.style.zIndex = '9999'

      // Show on focus
      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0'
        skipLink.style.left = '0'
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

    return skipLinksContainer
  }
}

// Utility hook for managing accessibility features
export const useAccessibility = () => {
  return {
    FocusManager,
    LiveRegionManager,
    AriaUtils,
    SkipLinkManager,
  }
}
