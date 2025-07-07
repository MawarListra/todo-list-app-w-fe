import React, { useRef, useState, useEffect } from 'react'
import { Check, Trash2, Edit, Archive } from 'lucide-react'

export interface SwipeAction {
  id: string
  label: string
  icon: React.ReactNode
  color: 'red' | 'green' | 'blue' | 'yellow' | 'gray'
  onAction: () => void
}

export interface SwipeActionsProps {
  children: React.ReactNode
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  leftAction?: SwipeAction
  rightAction?: SwipeAction
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  threshold?: number
  disabled?: boolean
  className?: string
}

const ACTION_COLORS = {
  red: 'bg-red-500 text-white',
  green: 'bg-green-500 text-white',
  blue: 'bg-blue-500 text-white',
  yellow: 'bg-yellow-500 text-white',
  gray: 'bg-gray-500 text-white',
}

export const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  leftActions = [],
  rightActions = [],
  threshold = 80,
  disabled = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activeAction, setActiveAction] = useState<SwipeAction | null>(null)

  // Combine single actions with arrays
  const allLeftActions = leftAction ? [leftAction, ...leftActions] : leftActions
  const allRightActions = rightAction
    ? [rightAction, ...rightActions]
    : rightActions

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return

    const touch = e.touches[0]
    setStartX(touch.clientX)
    setCurrentX(touch.clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging) return

    const touch = e.touches[0]
    setCurrentX(touch.clientX)

    const deltaX = touch.clientX - startX
    const maxTranslate = Math.min(120, Math.max(-120, deltaX))
    setTranslateX(maxTranslate)

    // Determine active action based on swipe distance
    if (deltaX > threshold && allRightActions.length > 0) {
      setActiveAction(allRightActions[0])
    } else if (deltaX < -threshold && allLeftActions.length > 0) {
      setActiveAction(allLeftActions[0])
    } else {
      setActiveAction(null)
    }

    // Prevent default to avoid scrolling
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    if (disabled || !isDragging) return

    const deltaX = currentX - startX

    // Execute action if threshold is met
    if (Math.abs(deltaX) > threshold && activeAction) {
      activeAction.onAction()

      // Trigger callback functions
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }

    // Reset state
    setIsDragging(false)
    setTranslateX(0)
    setActiveAction(null)
  }

  // Mouse event handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return

    setStartX(e.clientX)
    setCurrentX(e.clientX)
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !isDragging) return

    setCurrentX(e.clientX)

    const deltaX = e.clientX - startX
    const maxTranslate = Math.min(120, Math.max(-120, deltaX))
    setTranslateX(maxTranslate)

    // Determine active action
    if (deltaX > threshold && allRightActions.length > 0) {
      setActiveAction(allRightActions[0])
    } else if (deltaX < -threshold && allLeftActions.length > 0) {
      setActiveAction(allLeftActions[0])
    } else {
      setActiveAction(null)
    }
  }

  const handleMouseUp = () => {
    if (disabled || !isDragging) return

    const deltaX = currentX - startX

    if (Math.abs(deltaX) > threshold && activeAction) {
      activeAction.onAction()

      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }

    setIsDragging(false)
    setTranslateX(0)
    setActiveAction(null)
  }

  // Add global mouse events when dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        setCurrentX(e.clientX)

        const deltaX = e.clientX - startX
        const maxTranslate = Math.min(120, Math.max(-120, deltaX))
        setTranslateX(maxTranslate)

        if (deltaX > threshold && allRightActions.length > 0) {
          setActiveAction(allRightActions[0])
        } else if (deltaX < -threshold && allLeftActions.length > 0) {
          setActiveAction(allLeftActions[0])
        } else {
          setActiveAction(null)
        }
      }

      const handleGlobalMouseUp = () => {
        const deltaX = currentX - startX

        if (Math.abs(deltaX) > threshold && activeAction) {
          activeAction.onAction()

          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        }

        setIsDragging(false)
        setTranslateX(0)
        setActiveAction(null)
      }

      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [
    isDragging,
    startX,
    currentX,
    threshold,
    activeAction,
    allRightActions,
    allLeftActions,
    onSwipeRight,
    onSwipeLeft,
  ])

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Left actions (shown when swiping right) */}
      {allRightActions.length > 0 && (
        <div className="absolute left-0 top-0 h-full flex items-center">
          {allRightActions.map((action, index) => (
            <div
              key={action.id}
              className={`h-full flex items-center justify-center px-4 ${ACTION_COLORS[action.color]} ${
                activeAction?.id === action.id
                  ? 'bg-opacity-100'
                  : 'bg-opacity-80'
              }`}
              style={{
                width: `${Math.min(120, Math.max(0, translateX))}px`,
                opacity: translateX > 0 ? 1 : 0,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Right actions (shown when swiping left) */}
      {allLeftActions.length > 0 && (
        <div className="absolute right-0 top-0 h-full flex items-center">
          {allLeftActions.map((action, index) => (
            <div
              key={action.id}
              className={`h-full flex items-center justify-center px-4 ${ACTION_COLORS[action.color]} ${
                activeAction?.id === action.id
                  ? 'bg-opacity-100'
                  : 'bg-opacity-80'
              }`}
              style={{
                width: `${Math.min(120, Math.max(0, -translateX))}px`,
                opacity: translateX < 0 ? 1 : 0,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div
        ref={contentRef}
        className="relative z-10 bg-white transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={handleMouseUp}
      >
        {children}
      </div>
    </div>
  )
}

// Pre-defined common actions
export const SWIPE_ACTIONS = {
  complete: (onComplete: () => void): SwipeAction => ({
    id: 'complete',
    label: 'Complete',
    icon: <Check className="h-5 w-5" />,
    color: 'green',
    onAction: onComplete,
  }),
  delete: (onDelete: () => void): SwipeAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <Trash2 className="h-5 w-5" />,
    color: 'red',
    onAction: onDelete,
  }),
  edit: (onEdit: () => void): SwipeAction => ({
    id: 'edit',
    label: 'Edit',
    icon: <Edit className="h-5 w-5" />,
    color: 'blue',
    onAction: onEdit,
  }),
  archive: (onArchive: () => void): SwipeAction => ({
    id: 'archive',
    label: 'Archive',
    icon: <Archive className="h-5 w-5" />,
    color: 'gray',
    onAction: onArchive,
  }),
}
