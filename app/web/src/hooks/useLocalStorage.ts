import { useState, useEffect, useCallback } from 'react'

export type LocalStorageValue<T> = T | undefined

export interface UseLocalStorageOptions<T> {
  defaultValue?: T
  serializer?: {
    stringify: (value: T) => string
    parse: (value: string) => T
  }
}

export const useLocalStorage = <T>(
  key: string,
  options: UseLocalStorageOptions<T> = {}
): [LocalStorageValue<T>, (value: T | undefined) => void, () => void] => {
  const { defaultValue, serializer = JSON } = options

  // Get initial value from localStorage
  const getStoredValue = useCallback((): T | undefined => {
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return serializer.parse(item)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  }, [key, defaultValue, serializer])

  const [storedValue, setStoredValue] = useState<T | undefined>(getStoredValue)

  // Set value in localStorage
  const setValue = useCallback(
    (value: T | undefined) => {
      if (typeof window === 'undefined') {
        console.warn('localStorage is not available in this environment')
        return
      }

      try {
        setStoredValue(value)

        if (value === undefined) {
          window.localStorage.removeItem(key)
        } else {
          window.localStorage.setItem(key, serializer.stringify(value))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, serializer]
  )

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    setValue(undefined)
  }, [setValue])

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key) return

      try {
        const newValue = e.newValue ? serializer.parse(e.newValue) : undefined
        setStoredValue(newValue)
      } catch (error) {
        console.warn(
          `Error parsing localStorage value for key "${key}":`,
          error
        )
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, serializer])

  return [storedValue, setValue, removeValue]
}

// Specialized hooks for common use cases
export const useTheme = () => {
  return useLocalStorage<'light' | 'dark'>('theme', { defaultValue: 'light' })
}

export const useViewPreferences = () => {
  return useLocalStorage<{
    listView: 'grid' | 'list'
    taskView: 'list' | 'kanban'
    sidebarCollapsed: boolean
    cardSize: 'small' | 'medium' | 'large'
  }>('viewPreferences', {
    defaultValue: {
      listView: 'grid',
      taskView: 'list',
      sidebarCollapsed: false,
      cardSize: 'medium',
    },
  })
}

export const useFilterPreferences = () => {
  return useLocalStorage<{
    defaultSort: string
    defaultFilter: string
    showCompleted: boolean
    showArchived: boolean
  }>('filterPreferences', {
    defaultValue: {
      defaultSort: 'createdAt',
      defaultFilter: 'all',
      showCompleted: true,
      showArchived: false,
    },
  })
}

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory, clearSearchHistory] = useLocalStorage<
    string[]
  >('searchHistory', {
    defaultValue: [],
  })

  const addToSearchHistory = useCallback(
    (query: string) => {
      if (!query.trim()) return

      const currentHistory = searchHistory || []
      const newHistory = [
        query,
        ...currentHistory.filter((item) => item !== query),
      ].slice(0, 10)
      setSearchHistory(newHistory)
    },
    [searchHistory, setSearchHistory]
  )

  const removeFromSearchHistory = useCallback(
    (query: string) => {
      const currentHistory = searchHistory || []
      setSearchHistory(currentHistory.filter((item) => item !== query))
    },
    [searchHistory, setSearchHistory]
  )

  return {
    searchHistory: searchHistory || [],
    addToSearchHistory,
    removeFromSearchHistory,
    clearSearchHistory,
  }
}

export const useRecentItems = <
  T extends { id: string; name: string; timestamp?: number },
>(
  key: string,
  maxItems = 10
) => {
  const [recentItems, setRecentItems] = useLocalStorage<T[]>(`recent-${key}`, {
    defaultValue: [],
  })

  const addToRecent = useCallback(
    (item: Omit<T, 'timestamp'>) => {
      const currentItems = recentItems || []
      const itemWithTimestamp = { ...item, timestamp: Date.now() } as T

      const newItems = [
        itemWithTimestamp,
        ...currentItems.filter((existing) => existing.id !== item.id),
      ].slice(0, maxItems)

      setRecentItems(newItems)
    },
    [recentItems, setRecentItems, maxItems]
  )

  const removeFromRecent = useCallback(
    (id: string) => {
      const currentItems = recentItems || []
      setRecentItems(currentItems.filter((item) => item.id !== id))
    },
    [recentItems, setRecentItems]
  )

  const clearRecent = useCallback(() => {
    setRecentItems([])
  }, [setRecentItems])

  return {
    recentItems: recentItems || [],
    addToRecent,
    removeFromRecent,
    clearRecent,
  }
}

export const useOnboardingState = () => {
  return useLocalStorage<{
    hasSeenWelcome: boolean
    hasCreatedFirstList: boolean
    hasCreatedFirstTask: boolean
    hasUsedFilters: boolean
    hasUsedDragAndDrop: boolean
    completedSteps: string[]
  }>('onboardingState', {
    defaultValue: {
      hasSeenWelcome: false,
      hasCreatedFirstList: false,
      hasCreatedFirstTask: false,
      hasUsedFilters: false,
      hasUsedDragAndDrop: false,
      completedSteps: [],
    },
  })
}

export const useFeatureFlags = () => {
  return useLocalStorage<{
    [key: string]: boolean
  }>('featureFlags', {
    defaultValue: {},
  })
}
