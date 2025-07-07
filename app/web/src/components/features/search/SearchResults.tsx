import React from 'react'
import { Search, FileText, CheckSquare, AlertCircle } from 'lucide-react'
import { Task } from '../../../types/task.types'
import { List } from '../../../types/list.types'

export interface SearchResultsProps {
  query: string
  results: {
    tasks: Task[]
    lists: List[]
  }
  isLoading?: boolean
  onTaskClick?: (task: Task) => void
  onListClick?: (list: List) => void
  className?: string
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  isLoading = false,
  onTaskClick,
  onListClick,
  className = '',
}) => {
  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    )
    const parts = text.split(regex)

    return parts.map((part, index) => {
      const isMatch = part.toLowerCase() === query.toLowerCase()
      return (
        <span
          key={index}
          className={isMatch ? 'bg-yellow-200 font-medium' : ''}
        >
          {part}
        </span>
      )
    })
  }

  const totalResults = results.tasks.length + results.lists.length

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Searching...</span>
        </div>
      </div>
    )
  }

  if (!query.trim()) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Start typing to search
        </h3>
        <p className="text-gray-500">Search through your tasks and lists</p>
      </div>
    )
  }

  if (totalResults === 0) {
    return (
      <div className={`p-6 text-center ${className}`}>
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No results found
        </h3>
        <p className="text-gray-500">
          No tasks or lists match "{query}". Try different search terms.
        </p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          {totalResults} result{totalResults === 1 ? '' : 's'} for "{query}"
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {/* Lists Section */}
        {results.lists.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Lists ({results.lists.length})
            </h3>
            <div className="space-y-2">
              {results.lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => onListClick?.(list)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {highlightText(list.name, query)}
                      </h4>
                      {list.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {highlightText(list.description, query)}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm text-gray-500">
                        {list.taskCount} task{list.taskCount === 1 ? '' : 's'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {list.completedTaskCount} completed
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Section */}
        {results.tasks.length > 0 && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks ({results.tasks.length})
            </h3>
            <div className="space-y-2">
              {results.tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                        task.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${
                          task.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {highlightText(task.title, query)}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {highlightText(task.description, query)}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            task.priority === 'high'
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {task.deadline && (
                          <span>
                            Due: {new Date(task.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
