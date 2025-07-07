import React, { useState } from 'react'
import {
  useFocusManagement,
  useLiveRegion,
  useKeyboardNavigation,
} from '../../../hooks/useAccessibility'
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts'

export const AccessibilityDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [count, setCount] = useState(0)

  // Focus management for modal
  const { containerRef: modalRef } = useFocusManagement({
    trapFocus: isModalOpen,
    restoreFocus: true,
    autoFocus: isModalOpen,
  })

  // Live region for announcements
  const { announce, announceStatus, announceError } = useLiveRegion({
    id: 'accessibility-demo-announcements',
    priority: 'polite',
  })

  // Keyboard navigation for tabs
  const { elementRef: tabListRef } = useKeyboardNavigation({
    onArrowLeft: () => setSelectedTab((prev) => Math.max(0, prev - 1)),
    onArrowRight: () => setSelectedTab((prev) => Math.min(2, prev + 1)),
    onHome: () => setSelectedTab(0),
    onEnd: () => setSelectedTab(2),
  })

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => {
      announce('New task shortcut pressed')
      setCount((prev) => prev + 1)
    },
    onSearch: () => {
      announce('Search shortcut pressed')
      document.getElementById('search-input')?.focus()
    },
    onHelp: () => {
      announce('Help shortcut pressed')
      setIsModalOpen(true)
    },
    onSave: () => {
      announceStatus('Save shortcut pressed')
    },
    onCancel: () => {
      announceStatus('Cancel shortcut pressed')
      setIsModalOpen(false)
    },
  })

  const tabs = [
    {
      id: 'tab1',
      label: 'Focus Management',
      content: 'Focus management demo content',
    },
    { id: 'tab2', label: 'ARIA Labels', content: 'ARIA labels demo content' },
    { id: 'tab3', label: 'Live Regions', content: 'Live regions demo content' },
  ]

  const handleOpenModal = () => {
    setIsModalOpen(true)
    announce('Modal opened')
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    announce('Modal closed')
  }

  const handleToggleExpanded = () => {
    setIsExpanded((prev) => {
      const newState = !prev
      announce(`Section ${newState ? 'expanded' : 'collapsed'}`)
      return newState
    })
  }

  const handleAnnounceSuccess = () => {
    announceStatus('Operation completed successfully!')
  }

  const handleAnnounceError = () => {
    announceError('An error occurred!')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Accessibility Features Demo</h1>

      {/* Skip Links */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Skip Links</h2>
        <p className="text-gray-700">
          Press Tab to see skip links. They appear at the top of the page when
          focused.
        </p>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Global Keyboard Shortcuts
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Ctrl/Cmd + N:</strong> New task (Count: {count})
          </div>
          <div>
            <strong>Ctrl/Cmd + K:</strong> Focus search
          </div>
          <div>
            <strong>Ctrl/Cmd + /:</strong> Show help (opens modal)
          </div>
          <div>
            <strong>Ctrl/Cmd + S:</strong> Save
          </div>
          <div>
            <strong>Escape:</strong> Cancel/Close modal
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Search Input</h2>
        <input
          id="search-input"
          type="text"
          placeholder="Search (Ctrl/Cmd + K to focus)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search tasks and lists"
        />
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Tab Navigation (Arrow Keys)
        </h2>
        <div
          ref={tabListRef as any}
          role="tablist"
          aria-label="Accessibility features"
          className="flex space-x-2 mb-4"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              id={tab.id}
              role="tab"
              aria-selected={selectedTab === index}
              aria-controls={`${tab.id}-panel`}
              tabIndex={selectedTab === index ? 0 : -1}
              onClick={() => setSelectedTab(index)}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedTab === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {tabs.map((tab, index) => (
          <div
            key={`${tab.id}-panel`}
            id={`${tab.id}-panel`}
            role="tabpanel"
            aria-labelledby={tab.id}
            className={selectedTab === index ? 'block' : 'hidden'}
          >
            <p className="text-gray-700">{tab.content}</p>
          </div>
        ))}
      </div>

      {/* Expandable Content */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Expandable Content</h2>
        <button
          onClick={handleToggleExpanded}
          aria-expanded={isExpanded}
          aria-controls="expandable-content"
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <span>{isExpanded ? 'Collapse' : 'Expand'} Details</span>
          <span
            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </button>

        <div
          id="expandable-content"
          className={`mt-4 p-4 bg-white rounded-md border ${isExpanded ? 'block' : 'hidden'}`}
          aria-hidden={!isExpanded}
        >
          <p className="text-gray-700">
            This is the expandable content. Screen readers will be notified when
            this content is expanded or collapsed.
          </p>
        </div>
      </div>

      {/* Live Region Announcements */}
      <div className="mb-6 p-4 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Live Region Announcements
        </h2>
        <div className="space-x-4">
          <button
            onClick={handleAnnounceSuccess}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Announce Success
          </button>
          <button
            onClick={handleAnnounceError}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Announce Error
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          These buttons will announce messages to screen readers without visual
          changes.
        </p>
      </div>

      {/* Modal Dialog */}
      <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Modal Dialog (Focus Trap)
        </h2>
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Open Modal
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Modal will trap focus and restore it when closed. Press Escape to
          close.
        </p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef as any}
            role="dialog"
            aria-modal="true"
            aria-label="Accessibility Demo Modal"
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <h2 className="text-xl font-semibold mb-4">
              Help - Keyboard Shortcuts
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Ctrl/Cmd + N:</strong> Create new task
              </div>
              <div>
                <strong>Ctrl/Cmd + K:</strong> Open search
              </div>
              <div>
                <strong>Ctrl/Cmd + /:</strong> Show this help
              </div>
              <div>
                <strong>Ctrl/Cmd + S:</strong> Save
              </div>
              <div>
                <strong>Escape:</strong> Cancel/Close
              </div>
              <div>
                <strong>Tab:</strong> Navigate between elements
              </div>
              <div>
                <strong>Arrow Keys:</strong> Navigate within components
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessibilityDemo
