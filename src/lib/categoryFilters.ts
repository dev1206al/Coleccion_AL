import type { Category } from '@/types/collection'

export interface FilterDef {
  key: 'subcategory' | 'brand' | 'condition'
  label: string
  options: string[]
}

export const categoryFilters: Record<Category, FilterDef[]> = {
  figures: [
    {
      key: 'subcategory',
      label: 'Línea',
      options: ['Marvel Legends', 'Mafex', 'SH Figuarts', 'Funko Pop', 'McFarlane Toys', 'NECA', 'Inarts', 'Otra'],
    },
    {
      key: 'condition',
      label: 'Condición',
      options: ['sealed', 'mint', 'near_mint', 'good', 'fair'],
    },
  ],
  headphones: [
    {
      key: 'brand',
      label: 'Marca',
      options: ['Sony', 'Bose', 'Apple', 'Otra'],
    },
    {
      key: 'subcategory',
      label: 'Serie',
      options: ['Sony WF', 'Sony WH', 'Bose', 'Apple AirPods', 'Otra'],
    },
  ],
  vinyls: [
    {
      key: 'subcategory',
      label: 'Género',
      options: ['Rock', 'Pop', 'Jazz', 'Clásica', 'Electrónica', 'Hip-Hop', 'Otra'],
    },
    {
      key: 'condition',
      label: 'Condición',
      options: ['sealed', 'mint', 'near_mint', 'good', 'fair'],
    },
  ],
  lego: [
    {
      key: 'subcategory',
      label: 'Tema',
      options: ['CMF', 'Star Wars', 'Marvel', 'DC', 'Harry Potter', 'City', 'Otra'],
    },
    {
      key: 'condition',
      label: 'Condición',
      options: ['sealed', 'mint', 'near_mint', 'good', 'fair'],
    },
  ],
  perfumes: [
    {
      key: 'subcategory',
      label: 'Familia',
      options: ['Floral', 'Amaderado', 'Oriental', 'Fresco', 'Cítrico', 'Otro'],
    },
    {
      key: 'condition',
      label: 'Condición',
      options: ['sealed', 'mint', 'near_mint', 'good', 'fair'],
    },
  ],
}

export const conditionLabel: Record<string, string> = {
  sealed:    'Sealed',
  mint:      'Mint',
  near_mint: 'Near Mint',
  good:      'Good',
  fair:      'Fair',
}
