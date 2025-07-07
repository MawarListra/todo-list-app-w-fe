import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SortOption =
  | 'name'
  | 'created'
  | 'updated'
  | 'priority'
  | 'dueDate'
  | 'completed'
export type SortDirection = 'asc' | 'desc'
export type ViewMode = 'grid' | 'list' | 'kanban'
export type Priority = 'low' | 'medium' | 'high'
export type TaskStatus = 'all' | 'pending' | 'completed' | 'overdue'

export interface DateRange {
  start: Date | null
  end: Date | null
}

export interface TaskFilters {
  priority: Priority[]
  status: TaskStatus
  dateRange: DateRange
  listIds: string[]
  tags: string[]
}

export interface ListFilters {
  showEmpty: boolean
  showCompleted: boolean
  dateRange: DateRange
}

export interface FilterState {
  // Search query
  searchQuery: string
  setSearchQuery: (query: string) => void
  clearSearch: () => void

  // Task filters
  taskFilters: TaskFilters
  setTaskFilters: (filters: Partial<TaskFilters>) => void
  clearTaskFilters: () => void

  // List filters
  listFilters: ListFilters
  setListFilters: (filters: Partial<ListFilters>) => void
  clearListFilters: () => void

  // Sort preferences
  taskSort: {
    field: SortOption
    direction: SortDirection
  }
  setTaskSort: (field: SortOption, direction?: SortDirection) => void

  listSort: {
    field: SortOption
    direction: SortDirection
  }
  setListSort: (field: SortOption, direction?: SortDirection) => void

  // View preferences
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Quick filters
  quickFilters: {
    dueToday: boolean
    dueThisWeek: boolean
    overdue: boolean
    highPriority: boolean
  }
  setQuickFilter: (
    filter: keyof FilterState['quickFilters'],
    enabled: boolean
  ) => void
  clearQuickFilters: () => void

  // Filter history and saved searches
  savedSearches: Array<{
    id: string
    name: string
    query: string
    filters: TaskFilters
    createdAt: Date
  }>
  saveSearch: (name: string) => void
  loadSearch: (id: string) => void
  deleteSearch: (id: string) => void

  // Reset all filters
  resetAllFilters: () => void
}

const defaultTaskFilters: TaskFilters = {
  priority: [],
  status: 'all',
  dateRange: { start: null, end: null },
  listIds: [],
  tags: [],
}

const defaultListFilters: ListFilters = {
  showEmpty: true,
  showCompleted: true,
  dateRange: { start: null, end: null },
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      // Search query
      searchQuery: '',
      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },
      clearSearch: () => {
        set({ searchQuery: '' })
      },

      // Task filters
      taskFilters: defaultTaskFilters,
      setTaskFilters: (filters: Partial<TaskFilters>) => {
        set((state) => ({
          taskFilters: { ...state.taskFilters, ...filters },
        }))
      },
      clearTaskFilters: () => {
        set({ taskFilters: defaultTaskFilters })
      },

      // List filters
      listFilters: defaultListFilters,
      setListFilters: (filters: Partial<ListFilters>) => {
        set((state) => ({
          listFilters: { ...state.listFilters, ...filters },
        }))
      },
      clearListFilters: () => {
        set({ listFilters: defaultListFilters })
      },

      // Sort preferences
      taskSort: {
        field: 'created',
        direction: 'desc',
      },
      setTaskSort: (field: SortOption, direction?: SortDirection) => {
        set((state) => ({
          taskSort: {
            field,
            direction:
              direction ||
              (state.taskSort.field === field &&
              state.taskSort.direction === 'asc'
                ? 'desc'
                : 'asc'),
          },
        }))
      },

      listSort: {
        field: 'created',
        direction: 'desc',
      },
      setListSort: (field: SortOption, direction?: SortDirection) => {
        set((state) => ({
          listSort: {
            field,
            direction:
              direction ||
              (state.listSort.field === field &&
              state.listSort.direction === 'asc'
                ? 'desc'
                : 'asc'),
          },
        }))
      },

      // View preferences
      viewMode: 'grid',
      setViewMode: (mode: ViewMode) => {
        set({ viewMode: mode })
      },

      // Quick filters
      quickFilters: {
        dueToday: false,
        dueThisWeek: false,
        overdue: false,
        highPriority: false,
      },
      setQuickFilter: (
        filter: keyof FilterState['quickFilters'],
        enabled: boolean
      ) => {
        set((state) => ({
          quickFilters: { ...state.quickFilters, [filter]: enabled },
        }))
      },
      clearQuickFilters: () => {
        set({
          quickFilters: {
            dueToday: false,
            dueThisWeek: false,
            overdue: false,
            highPriority: false,
          },
        })
      },

      // Filter history and saved searches
      savedSearches: [],
      saveSearch: (name: string) => {
        const state = get()
        const newSearch = {
          id: `search-${Date.now()}-${Math.random()}`,
          name,
          query: state.searchQuery,
          filters: state.taskFilters,
          createdAt: new Date(),
        }
        set((state) => ({
          savedSearches: [...state.savedSearches, newSearch],
        }))
      },
      loadSearch: (id: string) => {
        const state = get()
        const search = state.savedSearches.find((s) => s.id === id)
        if (search) {
          set({
            searchQuery: search.query,
            taskFilters: search.filters,
          })
        }
      },
      deleteSearch: (id: string) => {
        set((state) => ({
          savedSearches: state.savedSearches.filter((s) => s.id !== id),
        }))
      },

      // Reset all filters
      resetAllFilters: () => {
        set({
          searchQuery: '',
          taskFilters: defaultTaskFilters,
          listFilters: defaultListFilters,
          quickFilters: {
            dueToday: false,
            dueThisWeek: false,
            overdue: false,
            highPriority: false,
          },
        })
      },
    }),
    {
      name: 'filter-store',
      partialize: (state) => ({
        taskSort: state.taskSort,
        listSort: state.listSort,
        viewMode: state.viewMode,
        savedSearches: state.savedSearches,
        taskFilters: state.taskFilters,
        listFilters: state.listFilters,
      }),
    }
  )
)
