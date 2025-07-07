import { create } from 'zustand'

export interface SelectionState {
  // Selected items
  selectedTaskIds: Set<string>
  selectedListIds: Set<string>

  // Task selection actions
  selectTask: (taskId: string) => void
  deselectTask: (taskId: string) => void
  toggleTaskSelection: (taskId: string) => void
  selectAllTasks: (taskIds: string[]) => void
  deselectAllTasks: () => void
  isTaskSelected: (taskId: string) => boolean
  getSelectedTaskIds: () => string[]
  getSelectedTaskCount: () => number

  // List selection actions
  selectList: (listId: string) => void
  deselectList: (listId: string) => void
  toggleListSelection: (listId: string) => void
  selectAllLists: (listIds: string[]) => void
  deselectAllLists: () => void
  isListSelected: (listId: string) => boolean
  getSelectedListIds: () => string[]
  getSelectedListCount: () => number

  // Bulk operations
  clearAllSelections: () => void
  hasSelections: () => boolean
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedTaskIds: new Set(),
  selectedListIds: new Set(),

  // Task selection actions
  selectTask: (taskId: string) => {
    set((state) => ({
      selectedTaskIds: new Set(state.selectedTaskIds.add(taskId)),
    }))
  },

  deselectTask: (taskId: string) => {
    set((state) => {
      const newSelection = new Set(state.selectedTaskIds)
      newSelection.delete(taskId)
      return { selectedTaskIds: newSelection }
    })
  },

  toggleTaskSelection: (taskId: string) => {
    const { selectedTaskIds } = get()
    if (selectedTaskIds.has(taskId)) {
      get().deselectTask(taskId)
    } else {
      get().selectTask(taskId)
    }
  },

  selectAllTasks: (taskIds: string[]) => {
    set(() => ({
      selectedTaskIds: new Set(taskIds),
    }))
  },

  deselectAllTasks: () => {
    set(() => ({
      selectedTaskIds: new Set(),
    }))
  },

  isTaskSelected: (taskId: string) => {
    return get().selectedTaskIds.has(taskId)
  },

  getSelectedTaskIds: () => {
    return Array.from(get().selectedTaskIds)
  },

  getSelectedTaskCount: () => {
    return get().selectedTaskIds.size
  },

  // List selection actions
  selectList: (listId: string) => {
    set((state) => ({
      selectedListIds: new Set(state.selectedListIds.add(listId)),
    }))
  },

  deselectList: (listId: string) => {
    set((state) => {
      const newSelection = new Set(state.selectedListIds)
      newSelection.delete(listId)
      return { selectedListIds: newSelection }
    })
  },

  toggleListSelection: (listId: string) => {
    const { selectedListIds } = get()
    if (selectedListIds.has(listId)) {
      get().deselectList(listId)
    } else {
      get().selectList(listId)
    }
  },

  selectAllLists: (listIds: string[]) => {
    set(() => ({
      selectedListIds: new Set(listIds),
    }))
  },

  deselectAllLists: () => {
    set(() => ({
      selectedListIds: new Set(),
    }))
  },

  isListSelected: (listId: string) => {
    return get().selectedListIds.has(listId)
  },

  getSelectedListIds: () => {
    return Array.from(get().selectedListIds)
  },

  getSelectedListCount: () => {
    return get().selectedListIds.size
  },

  // Bulk operations
  clearAllSelections: () => {
    set(() => ({
      selectedTaskIds: new Set(),
      selectedListIds: new Set(),
    }))
  },

  hasSelections: () => {
    const { selectedTaskIds, selectedListIds } = get()
    return selectedTaskIds.size > 0 || selectedListIds.size > 0
  },
}))
