import { useState, useEffect, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAddWishlistItem, useUpdateWishlistItem } from '@/hooks/useWishlist'
import { cn } from '@/lib/utils'
import type { Category, WishlistItem, WishlistPriority } from '@/types/collection'

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: 'figures',    label: 'Figura',    emoji: '🦸' },
  { value: 'headphones', label: 'Audífonos', emoji: '🎧' },
  { value: 'vinyls',     label: 'Vinilo',    emoji: '🎵' },
  { value: 'lego',       label: 'LEGO',      emoji: '🧱' },
  { value: 'perfumes',   label: 'Perfume',   emoji: '🌸' },
]

const priorities: { value: WishlistPriority; label: string; color: string }[] = [
  { value: 'high',   label: 'Alta',  color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'medium', label: 'Media', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { value: 'low',    label: 'Baja',  color: 'text-green-600 bg-green-50 border-green-200' },
]

const inputClass = 'w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring'
const labelClass = 'block text-sm font-medium mb-1'

interface Props {
  open: boolean
  onClose: () => void
  item?: WishlistItem
}

export default function AddWishlistDialog({ open, onClose, item }: Props) {
  const isEditing = !!item
  const addItem    = useAddWishlistItem()
  const updateItem = useUpdateWishlistItem()
  const mutation   = isEditing ? updateItem : addItem

  const [category,    setCategory]    = useState<Category>(item?.category ?? 'figures')
  const [name,        setName]        = useState(item?.name ?? '')
  const [brand,       setBrand]       = useState(item?.brand ?? '')
  const [priority,    setPriority]    = useState<WishlistPriority>(item?.priority ?? 'medium')
  const [targetPrice, setTargetPrice] = useState(item?.target_price != null ? String(item.target_price) : '')
  const [sourceUrl,   setSourceUrl]   = useState(item?.source_url ?? '')
  const [notes,       setNotes]       = useState(item?.notes ?? '')

  useEffect(() => {
    if (!open) return
    setCategory(item?.category ?? 'figures')
    setName(item?.name ?? '')
    setBrand(item?.brand ?? '')
    setPriority(item?.priority ?? 'medium')
    setTargetPrice(item?.target_price != null ? String(item.target_price) : '')
    setSourceUrl(item?.source_url ?? '')
    setNotes(item?.notes ?? '')
  }, [open, item])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      name,
      category,
      brand,
      priority,
      target_price: targetPrice ? parseFloat(targetPrice) : null,
      source_url:   sourceUrl || null,
      notes:        notes || null,
    }
    if (isEditing) {
      await updateItem.mutateAsync({ id: item!.id, ...payload })
    } else {
      await addItem.mutateAsync(payload)
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="font-semibold">{isEditing ? 'Editar deseo' : 'Agregar a wishlist'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          {/* Categoría */}
          <div>
            <label className={labelClass}>Categoría</label>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat.value} type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                    category === cat.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent',
                  )}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className={labelClass} htmlFor="wl-name">Nombre *</label>
            <input id="wl-name" required value={name} onChange={e => setName(e.target.value)}
              placeholder="ej. Spider-Man 2099 Marvel Legends"
              className={inputClass} />
          </div>

          {/* Marca */}
          <div>
            <label className={labelClass} htmlFor="wl-brand">Marca / Serie</label>
            <input id="wl-brand" value={brand} onChange={e => setBrand(e.target.value)}
              placeholder="ej. Hasbro"
              className={inputClass} />
          </div>

          {/* Prioridad */}
          <div>
            <label className={labelClass}>Prioridad</label>
            <div className="grid grid-cols-3 gap-2">
              {priorities.map(p => (
                <button key={p.value} type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    'py-2 rounded-md text-sm font-medium border transition-colors',
                    priority === p.value ? p.color : 'bg-background hover:bg-accent',
                  )}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Precio objetivo */}
          <div>
            <label className={labelClass} htmlFor="wl-price">Precio objetivo</label>
            <input id="wl-price" type="number" min="0" step="0.01" value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder="Sin registro" className={inputClass} />
          </div>

          {/* URL fuente */}
          <div>
            <label className={labelClass} htmlFor="wl-url">Link / Fuente</label>
            <input id="wl-url" type="url" value={sourceUrl}
              onChange={e => setSourceUrl(e.target.value)}
              placeholder="https://..." className={inputClass} />
          </div>

          {/* Notas */}
          <div>
            <label className={labelClass} htmlFor="wl-notes">Notas</label>
            <textarea id="wl-notes" rows={2} value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detalles, variantes buscadas..."
              className={cn(inputClass, 'resize-none')} />
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {(mutation.error as Error).message}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {mutation.isPending
                ? (isEditing ? 'Guardando...' : 'Agregando...')
                : (isEditing ? 'Guardar cambios' : 'Agregar')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
