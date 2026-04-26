import { useState, useEffect, type FormEvent } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { useMarkSold } from '@/hooks/useCollection'
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

export default function MarkSoldDialog({ open, onClose, item, onSuccess }: Props) {
  const markSold = useMarkSold()
  const [salePrice,  setSalePrice]  = useState('')
  const [saleDate,   setSaleDate]   = useState('')
  const [saleNotes,  setSaleNotes]  = useState('')

  useEffect(() => {
    if (!open) return
    setSalePrice(item?.sale_price != null ? String(item.sale_price) : '')
    setSaleDate(item?.sale_date ?? new Date().toISOString().slice(0, 10))
    setSaleNotes(item?.sale_notes ?? '')
  }, [open, item])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!item || !salePrice) return
    await markSold.mutateAsync({
      id:         item.id,
      sale_price: parseFloat(salePrice),
      sale_date:  saleDate || null,
      sale_notes: saleNotes || null,
    })
    onSuccess?.()
    onClose()
  }

  if (!open || !item) return null

  const profit = salePrice && item.acquisition_price != null
    ? parseFloat(salePrice) - item.acquisition_price
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-xl w-full max-w-sm mx-4">

        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            <h2 className="font-semibold">Marcar como vendido</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Ítem */}
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
            <p className="font-medium truncate">{item.name}</p>
            {item.brand && <p className="text-muted-foreground text-xs">{item.brand}</p>}
          </div>

          {/* Precio de venta */}
          <div>
            <label className={labelClass} htmlFor="sale-price">Precio de venta *</label>
            <input
              id="sale-price" required
              type="number" min="0" step="0.01"
              value={salePrice}
              onChange={e => setSalePrice(e.target.value)}
              placeholder="ej. 1200"
              className={inputClass}
            />
            {/* Vista previa ganancia/pérdida */}
            {profit !== null && (
              <p className={cn('text-xs mt-1 font-medium', profit >= 0 ? 'text-green-600' : 'text-red-500')}>
                {profit >= 0 ? '▲ Ganancia' : '▼ Pérdida'}: ${Math.abs(profit).toLocaleString()}
                {item.acquisition_price != null && (
                  <span className="text-muted-foreground font-normal ml-1">
                    (comprado en ${item.acquisition_price.toLocaleString()})
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Fecha de venta */}
          <div>
            <label className={labelClass} htmlFor="sale-date">Fecha de venta</label>
            <input
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={e => setSaleDate(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Notas */}
          <div>
            <label className={labelClass} htmlFor="sold-notes">
              Notas <span className="text-muted-foreground font-normal">(comprador, plataforma…)</span>
            </label>
            <textarea
              id="sold-notes" rows={2}
              value={saleNotes}
              onChange={e => setSaleNotes(e.target.value)}
              placeholder="ej. Vendido a Juan, MercadoLibre"
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          {markSold.isError && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
              {(markSold.error as Error).message}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 border rounded-md text-sm font-medium hover:bg-accent transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={markSold.isPending || !salePrice}
              className="flex-1 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {markSold.isPending ? 'Guardando...' : 'Confirmar venta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
