import { useState } from 'react'
import { Trash2, Pencil, Tag } from 'lucide-react'
import { useDeleteItem } from '@/hooks/useCollection'
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
  sealed: 'Sealed', mint: 'Mint', near_mint: 'Near Mint', good: 'Good', fair: 'Fair',
}
const categoryEmoji: Record<CollectionItem['category'], string> = {
  figures: '🦸', headphones: '🎧', vinyls: '🎵', lego: '🧱', perfumes: '🌸',
}

interface Props {
  item: CollectionItem
  index?: number
  onEdit: (item: CollectionItem) => void
  onDetail: (item: CollectionItem) => void
  onSell?: (item: CollectionItem) => void
  onDeleted?: () => void
}

export default function ItemListRow({ item, index = 0, onEdit, onDetail, onSell, onDeleted }: Props) {
  const deleteItem = useDeleteItem()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    await deleteItem.mutateAsync(item.id)
    onDeleted?.()
  }

  return (
    <div
      className="card-in flex items-center gap-3 px-3 py-2.5 border-b last:border-0 bg-card hover:bg-accent/40 active:bg-accent/60 transition-colors cursor-pointer group"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
      onClick={() => onDetail(item)}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-white flex items-center justify-center text-2xl border">
        {item.images.length > 0
          ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
          : categoryEmoji[item.category]
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-snug">{item.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {[item.brand, item.subcategory].filter(Boolean).join(' · ')}
        </p>
      </div>

      {/* Condition + price */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', conditionStyle[item.condition])}>
          {conditionLabel[item.condition]}
        </span>
        {item.acquisition_price != null
          ? <span className="text-xs text-muted-foreground">${item.acquisition_price.toLocaleString()}</span>
          : <span className="text-xs text-muted-foreground/40">—</span>
        }
      </div>

      {/* Acciones */}
      <div
        className="shrink-0 flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        onClick={e => e.stopPropagation()}
      >
        {confirming ? (
          <>
            <button
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-destructive text-destructive-foreground hover:opacity-80 disabled:opacity-50"
            >
              Sí
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted hover:bg-accent"
            >
              No
            </button>
          </>
        ) : (
          <>
            {onSell && (
              <button
                onClick={e => { e.stopPropagation(); onSell(item) }}
                className="p-1.5 rounded hover:bg-orange-100 hover:text-orange-600 text-muted-foreground transition-colors"
              >
                <Tag size={13} />
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onEdit(item) }}
              className="p-1.5 rounded hover:bg-accent text-muted-foreground"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setConfirming(true) }}
              className="p-1.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
