import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { CollectionItem, Category, ItemStatus } from '@/types/collection'

export interface CollectionFilters {
  category?: Category
  subcategory?: string
  brand?: string
  condition?: string
  status?: ItemStatus
}

export function useCollectionItems(filters: CollectionFilters = {}) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['collection', user?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('collection_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters.category)    query = query.eq('category', filters.category)
      if (filters.subcategory) query = query.eq('subcategory', filters.subcategory)
      if (filters.brand)       query = query.eq('brand', filters.brand)
      if (filters.condition)   query = query.eq('condition', filters.condition)
      if (filters.status)      query = query.eq('status', filters.status)

      const { data, error } = await query
      if (error) throw error
      return data as CollectionItem[]
    },
    enabled: !!user,
  })
}

export function useSaleItems() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['sale-items', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('*')
        .in('status', ['for_sale', 'sold'])
        .order('updated_at', { ascending: false })
      if (error) throw error
      return data as CollectionItem[]
    },
    enabled: !!user,
  })
}

type NewItem = Omit<CollectionItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export function useAddItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (item: NewItem) => {
      const { data, error } = await supabase
        .from('collection_items')
        .insert({ ...item, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as CollectionItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-counts'] })
    },
  })
}

type UpdateItem = Partial<NewItem> & { id: string }

export function useUpdateItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdateItem) => {
      const { data, error } = await supabase
        .from('collection_items')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as CollectionItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-counts'] })
    },
  })
}

export function useMarkForSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, asking_price, sale_notes }: {
      id: string
      asking_price?: number | null
      sale_notes?: string | null
    }) => {
      const { error } = await supabase
        .from('collection_items')
        .update({ status: 'for_sale', asking_price: asking_price ?? null, sale_notes: sale_notes ?? null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-counts'] })
    },
  })
}

export function useMarkSold() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, sale_price, sale_date, sale_notes }: {
      id: string
      sale_price: number
      sale_date?: string | null
      sale_notes?: string | null
    }) => {
      const { error } = await supabase
        .from('collection_items')
        .update({ status: 'sold', sale_price, sale_date: sale_date ?? null, sale_notes: sale_notes ?? null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-counts'] })
    },
  })
}

export function useReturnToCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collection_items')
        .update({ status: 'owned', asking_price: null, sale_price: null, sale_date: null, sale_notes: null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-counts'] })
    },
  })
}

export function useCollectionCounts() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['collection-counts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_items')
        .select('category')
        .eq('status', 'owned')
      if (error) throw error
      return (data as { category: string }[]).reduce<Record<string, number>>((acc, { category }) => {
        acc[category] = (acc[category] ?? 0) + 1
        return acc
      }, {})
    },
    enabled: !!user,
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('collection_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection'] })
      queryClient.invalidateQueries({ queryKey: ['collection-counts'] })
    },
  })
}
