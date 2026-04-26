import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { WishlistItem } from '@/types/collection'

export function useWishlistItems() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as WishlistItem[]
    },
    enabled: !!user,
  })
}

type NewWishlistItem = Omit<WishlistItem, 'id' | 'user_id' | 'created_at'>

export function useAddWishlistItem() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (item: NewWishlistItem) => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({ ...item, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as WishlistItem
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

type UpdateWishlistItem = Partial<NewWishlistItem> & { id: string }

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdateWishlistItem) => {
      const { data, error } = await supabase
        .from('wishlist_items')
        .update(fields)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as WishlistItem
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}
