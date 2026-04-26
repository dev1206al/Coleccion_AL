export type Category = 'figures' | 'headphones' | 'vinyls' | 'lego' | 'perfumes'

export type ItemStatus = 'owned' | 'for_sale' | 'sold'

export type ItemCondition = 'sealed' | 'mint' | 'near_mint' | 'good' | 'fair'

export interface CollectionItem {
  id: string
  user_id: string
  name: string
  category: Category
  status: ItemStatus
  condition: ItemCondition
  brand: string
  subcategory: string
  acquisition_year: number | null
  acquisition_month: number | null
  acquisition_price: number | null
  estimated_value: number | null
  images: string[]
  notes: string | null
  extra: Record<string, unknown>
  // Venta
  asking_price: number | null
  sale_price: number | null
  sale_date: string | null
  sale_notes: string | null
  created_at: string
  updated_at: string
}

export type WishlistPriority = 'high' | 'medium' | 'low'

export interface WishlistItem {
  id: string
  user_id: string
  name: string
  category: Category
  brand: string
  priority: WishlistPriority
  target_price: number | null
  source_url: string | null
  notes: string | null
  created_at: string
}
