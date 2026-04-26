import { useState, useEffect, type FormEvent } from 'react'
import { X, Tag } from 'lucide-react'
import { useMarkForSale } from '@/hooks/useCollection'
import { cn } from '@/lib/utils'
import type { CollectionItem } from '@/types/collection'

const inputClass = 'w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring'
const labelClass = 'block text-sm font-medium mb-1'

interface Props {
  open: boolean
  onClose: () => void
  item: CollectionItem | undefined
  onSuccess?: () => void
}

export default function PutForSaleDialog({ open, onClose, item, onSuccess }: Props) {
  const markForSale = useMarkForSale()
  const [askingPrice, setAskingPrice] = useState('')
  const [saleNotes,   setSaleNotes]   = useState('')

  useEffect(() => {
    if (!open) return
    setAskingPrice(item?.asking_price != null ? String(item.asking_price) : '')
    setSaleNotes(item?.sale_notes ?? '')
  }, [open, item])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!item) return
    await markForSale.mutateAsync({
      id:           item.id,
      asking_price: askingPrice ? parseFloat(askingPrice) : null,
      sale_notes:   saleNotes || null,
    })
    onSuccess?.()
    onClose()
  }

  if (!open || !item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-xl w-full max-w-sm mx-4">

        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-primary" />
            <h2 className="font-semibold">Poner en venta</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Ítem */}
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
            <p className="font-medium truncate">{item.name}</p>
            {item.brand && <p className="text-muted-foreground text-xs truncate">{item.brand}</p>}
          </div>

          {/* Precio de oferta */}
          <div>
            <label className={labelClass} htmlFor="asking-price">
              Precio de oferta <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <input
              id="asking-price"
              type="number" min="0" step="0.01"
              value={askingPrice}
              onChange={e => setAskingPrice(e.target.value)}
              placeholder="ej. 1500"
              className={inputClass}
            />
            {item.acquisition_price != null && (
              <p className="text-xs text-muted-foreground mt-1">
                Pagaste: ${item.acquisition_price.toLocaleString()}
              </p>
            )}
          </div>

          {/* Dónde / notas */}
          <div>
            <label className={labelClass} htmlFor="sale-notes">
              Plataforma / notas <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              id="sale-notes" rows={2}
              value={saleNotes}
              onChange={e => setSaleNotes(e.target.value)}
              placeholder="ej. MercadoLibre, Facebook Marketplace..."
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          {markForSale.isError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {(markForSale.error as Error).message}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={markForSale.isPending}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {markForSale.isPending ? 'Guardando...' : 'Poner en venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
