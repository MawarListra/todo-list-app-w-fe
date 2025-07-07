import { useFilterStore } from '../stores/filterStore'
import { useMemo } from 'react'
import type { Task } from '../types/task.types'
import type { List } from '../types/list.types'

export function useFilters() {
  const {
    searchQuery,
    taskFilters,
    listFilters,
    quickFilters,
    taskSort,
    listSort,
    viewMode,
    setSearchQuery,
    setTaskFilters,
    setListFilters,
    setQuickFilter,
    setTaskSort,
    setListSort,
    setViewMode,
    clearSearch,
    clearTaskFilters,
    clearListFilters,
    clearQuickFilters,
    resetAllFilters,
    saveSearch,
    loadSearch,
    deleteSearch,
    savedSearches,
  } = useFilterStore()

  // Filter functions
  const filterTasks = useMemo(() => {
    return (tasks: Task[]) => {
      let filtered = tasks

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query))
        )
      }

      // Apply status filter
      if (taskFilters.status !== 'all') {
        const now = new Date()
        filtered = filtered.filter((task) => {
          switch (taskFilters.status) {
            case 'pending':
              return !task.completed
            case 'completed':
              return task.completed
            case 'overdue':
              return (
                !task.completed &&
                task.deadline &&
                new Date(task.deadline) < now
              )
            default:
              return true
          }
        })
      }

      // Apply priority filter
      if (taskFilters.priority.length > 0) {
        filtered = filtered.filter(
          (task) =>
            task.priority && taskFilters.priority.includes(task.priority)
        )
      }

      // Apply list filter
      if (taskFilters.listIds.length > 0) {
        filtered = filtered.filter((task) =>
          taskFilters.listIds.includes(task.listId)
        )
      }

      // Apply tags filter
      // Note: Task type doesn't have tags, so we skip this filter
      // if (taskFilters.tags.length > 0) {
      //   filtered = filtered.filter(task =>
      //     task.tags && taskFilters.tags.some(tag => task.tags!.includes(tag))
      //   );
      // }

      // Apply date range filter
      if (taskFilters.dateRange.start || taskFilters.dateRange.end) {
        filtered = filtered.filter((task) => {
          const taskDate = new Date(task.createdAt)
          const start = taskFilters.dateRange.start
          const end = taskFilters.dateRange.end

          if (start && end) {
            return taskDate >= start && taskDate <= end
          } else if (start) {
            return taskDate >= start
          } else if (end) {
            return taskDate <= end
          }
          return true
        })
      }

      // Apply quick filters
      if (quickFilters.dueToday) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        filtered = filtered.filter(
          (task) =>
            task.deadline &&
            new Date(task.deadline) >= today &&
            new Date(task.deadline) < tomorrow
        )
      }

      if (quickFilters.dueThisWeek) {
        const today = new Date()
        const weekFromToday = new Date(today)
        weekFromToday.setDate(weekFromToday.getDate() + 7)

        filtered = filtered.filter(
          (task) =>
            task.deadline &&
            new Date(task.deadline) >= today &&
            new Date(task.deadline) <= weekFromToday
        )
      }

      if (quickFilters.overdue) {
        const now = new Date()
        filtered = filtered.filter(
          (task) =>
            !task.completed && task.deadline && new Date(task.deadline) < now
        )
      }

      if (quickFilters.highPriority) {
        filtered = filtered.filter((task) => task.priority === 'high')
      }

      return filtered
    }
  }, [searchQuery, taskFilters, quickFilters])

  const filterLists = useMemo(() => {
    return (lists: List[]) => {
      let filtered = lists

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (list) =>
            list.name.toLowerCase().includes(query) ||
            (list.description && list.description.toLowerCase().includes(query))
        )
      }

      // Apply date range filter
      if (listFilters.dateRange.start || listFilters.dateRange.end) {
        filtered = filtered.filter((list) => {
          const listDate = new Date(list.createdAt)
          const start = listFilters.dateRange.start
          const end = listFilters.dateRange.end

          if (start && end) {
            return listDate >= start && listDate <= end
          } else if (start) {
            return listDate >= start
          } else if (end) {
            return listDate <= end
          }
          return true
        })
      }

      return filtered
    }
  }, [searchQuery, listFilters])

  // Sort functions
  const sortTasks = useMemo(() => {
    return (tasks: Task[]) => {
      const sorted = [...tasks]

      sorted.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (taskSort.field) {
          case 'name':
            aValue = a.title.toLowerCase()
            bValue = b.title.toLowerCase()
            break
          case 'created':
            aValue = new Date(a.createdAt)
            bValue = new Date(b.createdAt)
            break
          case 'updated':
            aValue = new Date(a.updatedAt)
            bValue = new Date(b.updatedAt)
            break
          case 'priority':
            const priorityOrder = { low: 1, medium: 2, high: 3 }
            aValue = priorityOrder[a.priority || 'low']
            bValue = priorityOrder[b.priority || 'low']
            break
          case 'dueDate':
            aValue = a.deadline ? new Date(a.deadline) : new Date('9999-12-31')
            bValue = b.deadline ? new Date(b.deadline) : new Date('9999-12-31')
            break
          case 'completed':
            aValue = a.completed ? 1 : 0
            bValue = b.completed ? 1 : 0
            break
          default:
            return 0
        }

        if (aValue < bValue) return taskSort.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return taskSort.direction === 'asc' ? 1 : -1
        return 0
      })

      return sorted
    }
  }, [taskSort])

  const sortLists = useMemo(() => {
    return (lists: List[]) => {
      const sorted = [...lists]

      sorted.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (listSort.field) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'created':
            aValue = new Date(a.createdAt)
            bValue = new Date(b.createdAt)
            break
          case 'updated':
            aValue = new Date(a.updatedAt)
            bValue = new Date(b.updatedAt)
            break
          default:
            return 0
        }

        if (aValue < bValue) return listSort.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return listSort.direction === 'asc' ? 1 : -1
        return 0
      })

      return sorted
    }
  }, [listSort])

  // Combined filter and sort function
  const processTasksData = useMemo(() => {
    return (tasks: Task[]) => {
      const filtered = filterTasks(tasks)
      return sortTasks(filtered)
    }
  }, [filterTasks, sortTasks])

  const processListsData = useMemo(() => {
    return (lists: List[]) => {
      const filtered = filterLists(lists)
      return sortLists(filtered)
    }
  }, [filterLists, sortLists])

  // Filter summary
  const filterSummary = useMemo(() => {
    const activeFilters = []

    if (searchQuery) activeFilters.push('Search')
    if (taskFilters.status !== 'all') activeFilters.push('Status')
    if (taskFilters.priority.length > 0) activeFilters.push('Priority')
    if (taskFilters.listIds.length > 0) activeFilters.push('Lists')
    if (taskFilters.tags.length > 0) activeFilters.push('Tags')
    if (taskFilters.dateRange.start || taskFilters.dateRange.end)
      activeFilters.push('Date Range')

    const quickFiltersActive = Object.values(quickFilters).some(
      (active) => active
    )
    if (quickFiltersActive) activeFilters.push('Quick Filters')

    return {
      activeCount: activeFilters.length,
      activeFilters,
      hasActiveFilters: activeFilters.length > 0,
    }
  }, [searchQuery, taskFilters, quickFilters])

  return {
    // State
    searchQuery,
    taskFilters,
    listFilters,
    quickFilters,
    taskSort,
    listSort,
    viewMode,
    savedSearches,

    // Actions
    setSearchQuery,
    setTaskFilters,
    setListFilters,
    setQuickFilter,
    setTaskSort,
    setListSort,
    setViewMode,
    clearSearch,
    clearTaskFilters,
    clearListFilters,
    clearQuickFilters,
    resetAllFilters,
    saveSearch,
    loadSearch,
    deleteSearch,

    // Processing functions
    filterTasks,
    filterLists,
    sortTasks,
    sortLists,
    processTasksData,
    processListsData,

    // Summary
    filterSummary,
  }
}
