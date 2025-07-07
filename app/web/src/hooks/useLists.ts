import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listsService, ListsQueryOptions } from '../services/listsService'
import { queryKeys, invalidationPatterns } from '../services/queryKeys'
import {
  ListCreateData,
  ListUpdateData,
  ListWithStats,
} from '../types/list.types'
import { useToast } from './useToast'

export const useLists = (options: ListsQueryOptions = {}) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  // Fetch lists query
  const listsQuery = useQuery({
    queryKey: queryKeys.filteredLists(options),
    queryFn: () => listsService.getLists(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  })

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: (data: ListCreateData) => listsService.createList(data),
    onSuccess: (newList) => {
      // Update the cache with the new list
      queryClient.setQueryData<ListWithStats[]>(
        queryKeys.filteredLists(options),
        (oldLists = []) => [...oldLists, newList as ListWithStats]
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lists })

      toast.success(`"${newList.name}" has been created successfully.`, {
        title: 'List Created',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while creating the list.',
        {
          title: 'Failed to Create List',
        }
      )
    },
  })

  // Update list mutation
  const updateListMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ListUpdateData }) =>
      listsService.updateList(id, data),
    onSuccess: (updatedList) => {
      // Update the cache with the updated list
      queryClient.setQueryData<ListWithStats[]>(
        queryKeys.filteredLists(options),
        (oldLists = []) =>
          oldLists.map((list) =>
            list.id === updatedList.id ? { ...list, ...updatedList } : list
          )
      )

      // Invalidate related queries
      invalidationPatterns
        .invalidateList(updatedList.id)
        .forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey })
        })

      toast.success(`"${updatedList.name}" has been updated successfully.`, {
        title: 'List Updated',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while updating the list.',
        {
          title: 'Failed to Update List',
        }
      )
    },
  })

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: (id: string) => listsService.deleteList(id),
    onSuccess: (_, deletedId) => {
      // Remove the list from cache
      queryClient.setQueryData<ListWithStats[]>(
        queryKeys.filteredLists(options),
        (oldLists = []) => oldLists.filter((list) => list.id !== deletedId)
      )

      // Invalidate related queries
      invalidationPatterns.invalidateList(deletedId).forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey })
      })

      toast.success('The list has been deleted successfully.', {
        title: 'List Deleted',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while deleting the list.',
        {
          title: 'Failed to Delete List',
        }
      )
    },
  })

  // Archive list mutation
  const archiveListMutation = useMutation({
    mutationFn: (id: string) => listsService.archiveList(id),
    onSuccess: (archivedList) => {
      // Update the cache
      queryClient.setQueryData<ListWithStats[]>(
        queryKeys.filteredLists(options),
        (oldLists = []) =>
          oldLists.map((list) =>
            list.id === archivedList.id ? { ...list, ...archivedList } : list
          )
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lists })

      toast.success(`"${archivedList.name}" has been archived.`, {
        title: 'List Archived',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while archiving the list.',
        {
          title: 'Failed to Archive List',
        }
      )
    },
  })

  // Duplicate list mutation
  const duplicateListMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName?: string }) =>
      listsService.duplicateList(id, newName),
    onSuccess: (duplicatedList) => {
      // Add the duplicated list to cache
      queryClient.setQueryData<ListWithStats[]>(
        queryKeys.filteredLists(options),
        (oldLists = []) => [...oldLists, duplicatedList as ListWithStats]
      )

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.lists })

      toast.success(`"${duplicatedList.name}" has been created as a copy.`, {
        title: 'List Duplicated',
      })
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'An error occurred while duplicating the list.',
        {
          title: 'Failed to Duplicate List',
        }
      )
    },
  })

  return {
    // Data
    lists: listsQuery.data ?? [],

    // Loading states
    isLoading: listsQuery.isLoading,
    isError: listsQuery.isError,
    error: listsQuery.error,

    // Mutation states
    isCreating: createListMutation.isPending,
    isUpdating: updateListMutation.isPending,
    isDeleting: deleteListMutation.isPending,
    isArchiving: archiveListMutation.isPending,
    isDuplicating: duplicateListMutation.isPending,

    // Actions
    createList: createListMutation.mutate,
    updateList: updateListMutation.mutate,
    deleteList: deleteListMutation.mutate,
    archiveList: archiveListMutation.mutate,
    duplicateList: duplicateListMutation.mutate,

    // Utility methods
    refetch: listsQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.lists }),
  }
}

// Hook for getting a single list
export const useList = (id: string) => {
  const listQuery = useQuery({
    queryKey: queryKeys.list(id),
    queryFn: () => listsService.getList(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const statsQuery = useQuery({
    queryKey: [...queryKeys.list(id), 'stats'],
    queryFn: () => listsService.getListStats(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // Stats change more frequently
    gcTime: 5 * 60 * 1000,
  })

  return {
    list: listQuery.data,
    stats: statsQuery.data,
    isLoading: listQuery.isLoading || statsQuery.isLoading,
    isError: listQuery.isError || statsQuery.isError,
    error: listQuery.error || statsQuery.error,
    refetch: () => {
      listQuery.refetch()
      statsQuery.refetch()
    },
  }
}
