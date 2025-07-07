import React, { useState, useEffect, useRef } from 'react'
import { Home, List, BarChart3, Settings, ArrowLeft } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

// Simple utility for conditional class names
const cn = (...classes: (string | undefined | boolean)[]) => {
  return classes.filter(Boolean).join(' ')
}

export interface MobileTab {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: number
}

export interface MobileNavigationProps {
  activeTab?: string
  onTabChange?: (tabId: string) => void
  tabs?: MobileTab[]
  onBack?: () => void
  showBackButton?: boolean
  className?: string
}

const DEFAULT_TABS: MobileTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home size={20} />,
    path: '/',
  },
  {
    id: 'lists',
    label: 'Lists',
    icon: <List size={20} />,
    path: '/lists',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 size={20} />,
    path: '/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={20} />,
    path: '/settings',
  },
]

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeTab: controlledActiveTab,
  onTabChange,
  tabs = DEFAULT_TABS,
  onBack,
  showBackButton = false,
  className = '',
}) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active tab based on current route
  const getActiveTabFromPath = (path: string) => {
    const matchingTab = tabs.find((tab) => tab.path === path)
    return matchingTab?.id || tabs[0]?.id
  }

  const [activeTab, setActiveTab] = useState(
    controlledActiveTab || getActiveTabFromPath(location.pathname)
  )

  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  // Update active tab when location changes
  useEffect(() => {
    if (!controlledActiveTab) {
      setActiveTab(getActiveTabFromPath(location.pathname))
    }
  }, [location.pathname, controlledActiveTab])

  // Handle tab selection
  const handleTabSelect = (tabId: string) => {
    const selectedTab = tabs.find((tab) => tab.id === tabId)
    if (!selectedTab) return

    if (controlledActiveTab !== undefined) {
      onTabChange?.(tabId)
    } else {
      setActiveTab(tabId)
      navigate(selectedTab.path)
    }
  }

  // Handle back button
  const handleBackButton = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  // Swipe navigation handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return

    const deltaX = currentX - startX
    const threshold = 50

    if (Math.abs(deltaX) > threshold) {
      const currentIndex = tabs.findIndex((tab) => tab.id === activeTab)
      let nextIndex = currentIndex

      if (deltaX > 0 && currentIndex > 0) {
        // Swipe right - go to previous tab
        nextIndex = currentIndex - 1
      } else if (deltaX < 0 && currentIndex < tabs.length - 1) {
        // Swipe left - go to next tab
        nextIndex = currentIndex + 1
      }

      if (nextIndex !== currentIndex) {
        handleTabSelect(tabs[nextIndex].id)
      }
    }

    setIsDragging(false)
    setStartX(0)
    setCurrentX(0)
  }

  // Safe area handling
  const safeAreaClass = 'pb-safe-area-inset-bottom'

  return (
    <div
      ref={navRef}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200',
        'md:hidden', // Only show on mobile
        safeAreaClass,
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between px-4 py-2">
        {/* Back button */}
        {showBackButton && (
          <button
            onClick={handleBackButton}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}

        {/* Navigation tabs */}
        <div className="flex-1 flex items-center justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabSelect(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[60px]',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Menu button or spacer */}
        <div className="w-10 h-10 flex items-center justify-center">
          {/* This could be a menu button or other actions */}
        </div>
      </div>

      {/* Swipe indicator */}
      {isDragging && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200">
          <div
            className="h-full bg-blue-500 transition-all duration-200"
            style={{
              width: `${Math.min(Math.abs(currentX - startX) / 2, 100)}%`,
              transform:
                currentX > startX ? 'translateX(0)' : 'translateX(100%)',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default MobileNavigation
