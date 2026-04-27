import { useState } from 'react'
import { Trash2, Pencil, Tag } from 'lucide-react'
import { useDeleteItem } from '@/hooks/useCollection'
import ImageCarousel from '@/components/ImageCarousel'
import { cn } from '@/lib/utils'
import type { CollectionItem } from '@/types/collection'

const conditionStyle: Record<CollectionItem['condition'], string> = {
  sealed:    'bg-purple-100 text-purple-800',
  mint:      'bg-green-100 text-green-800',
  near_mint: 'bg-blue-100 text-blue-800',
  good:      'bg-yellow-100 text-yellow-800',
  fair:      'bg-red-100 text-red-800',
}

const conditionLabel: Record<CollectionItem['condition'], string> = {
  sealed:    'Sealed',
  mint:      'Mint',
  near_mint: 'Near Mint',
  good:      'Good',
  fair:      'Fair',
}

const categoryEmoji: Record<CollectionItem['category'], string> = {
  figures:    '🦸',
  headphones: '🎧',
  vinyls:     '🎵',
  lego:       '🧱',
  perfumes:   '🌸',
}

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function formatDate(year: number | null, month: number | null): string | null {
  if (!year) return null
  if (month) return `${monthNames[month - 1]} ${year}`
  return `${year}`
}

interface Props {
  item: CollectionItem
  index?: number
  onEdit: (item: CollectionItem) => void
  onDetail: (item: CollectionItem) => void
  onSell?: (item: CollectionItem) => void
  onDeleted?: () => void
}

export default function ItemCard({ item, index = 0, onEdit, onDetail, onSell, onDeleted }: Props) {
  const deleteItem = useDeleteItem()
  const [confirming, setConfirming] = useState(false)
  const dateStr = formatDate(item.acquisition_year, item.acquisition_month)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    await deleteItem.mutateAsync(item.id)
    onDeleted?.()
  }

  return (
    <div
      className="card-in border rounded-lg bg-card overflow-hidden hover:shadow-md transition-all group cursor-pointer active:scale-[0.97] active:shadow-sm"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
      onClick={() => onDetail(item)}
    >
      <div className="aspect-square bg-white flex items-center justify-center text-5xl overflow-hidden">
        {item.images.length > 0
          ? <ImageCarousel images={item.images} alt={item.name} className="w-full h-full" />
          : categoryEmoji[item.category]
        }
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.name}</p>
            {item.brand && (
              <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
            )}
          </div>

          {/* Acciones */}
          <div
            className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
            onClick={e => e.stopPropagation()}
          >
            {confirming ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  disabled={deleteItem.isPending}
                  className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  Sí
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(false) }}
                  className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted hover:bg-accent transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <>
                {onSell && (
                  <button
                    onClick={e => { e.stopPropagation(); onSell(item) }}
                    className="p-1 rounded hover:bg-orange-100 hover:text-orange-600 text-muted-foreground transition-colors"
                    title="Poner en venta"
                  >
                    <Tag size={14} />
                  </button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onEdit(item) }}
                  className="p-1 rounded hover:bg-accent text-muted-foreground"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(true) }}
                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-1">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', conditionStyle[item.condition])}>
            {conditionLabel[item.condition]}
          </span>
          {item.acquisition_price != null
            ? <span className="text-xs text-muted-foreground">${item.acquisition_price.toLocaleString()}</span>
            : <span className="text-xs text-muted-foreground/50">Sin registro</span>
          }
        </div>

        {(item.subcategory || dateStr) && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{item.subcategory}</span>
            {dateStr && <span className="shrink-0 ml-1">{dateStr}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
