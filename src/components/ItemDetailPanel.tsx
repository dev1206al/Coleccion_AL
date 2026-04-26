import { X, Pencil, Tag } from 'lucide-react'
import ImageCarousel from '@/components/ImageCarousel'
import { cn } from '@/lib/utils'
import type { CollectionItem } from '@/types/collection'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<CollectionItem['category'], string> = {
  figures: '🦸', headphones: '🎧', vinyls: '🎵', lego: '🧱', perfumes: '🌸',
}
const CATEGORY_LABEL: Record<CollectionItem['category'], string> = {
  figures: 'Figura', headphones: 'Audífonos', vinyls: 'Vinilo', lego: 'LEGO', perfumes: 'Perfume',
}
const CONDITION_LABEL: Record<CollectionItem['condition'], string> = {
  sealed: 'Sealed', mint: 'Mint', near_mint: 'Near Mint', good: 'Good', fair: 'Fair',
}
const CONDITION_STYLE: Record<CollectionItem['condition'], string> = {
  sealed:    'bg-purple-100 text-purple-800',
  mint:      'bg-green-100 text-green-800',
  near_mint: 'bg-blue-100 text-blue-800',
  good:      'bg-yellow-100 text-yellow-800',
  fair:      'bg-red-100 text-red-800',
}
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

function getExtraRows(item: CollectionItem): { label: string; value: string }[] {
  const e = item.extra as Record<string, unknown>
  const str = (v: unknown) => (v != null && v !== '' ? String(v) : '')

  const rows: { label: string; value: string }[] = []
  const push = (label: string, value: string) => { if (value) rows.push({ label, value }) }

  if (item.category === 'figures') {
    push('Línea', item.subcategory)
    push('Marca', item.brand)
  } else if (item.category === 'headphones') {
    push('Marca',  item.brand)
    push('Tipo',   str(e.type))
    push('Serie',  item.subcategory)
  } else if (item.category === 'vinyls') {
    push('Artista',       str(e.artist))
    push('Género',        item.brand)
    push('Año lanz.',     str(e.release_year))
    push('Sello',         str(e.label))
  } else if (item.category === 'lego') {
    push('Tema',    item.subcategory)
    push('No. set', str(e.set_number))
    push('Serie',   str(e.series))
  } else {
    push('Marca',         item.brand)
    push('Familia',       item.subcategory)
    push('Concentración', str(e.concentration))
    push('Notas',         str(e.aroma))
    push('Tamaño',        e.size_ml ? `${e.size_ml} ml` : '')
  }
  return rows
}

// ─── Componente ───────────────────────────────────────────────────────────────

interface Props {
  item: CollectionItem | null
  onClose: () => void
  onEdit: (item: CollectionItem) => void
  onSell?: (item: CollectionItem) => void
}

export default function ItemDetailPanel({ item, onClose, onEdit, onSell }: Props) {
  if (!item) return null

  const dateStr = item.acquisition_year
    ? item.acquisition_month
      ? `${MONTHS[item.acquisition_month - 1]} ${item.acquisition_year}`
      : String(item.acquisition_year)
    : null

  const diff = (item.estimated_value ?? 0) - (item.acquisition_price ?? 0)
  const extraRows = getExtraRows(item)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-card border-l shadow-2xl flex flex-col animate-slide-in-right">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{CATEGORY_EMOJI[item.category]}</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {CATEGORY_LABEL[item.category]}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {onSell && item.status === 'owned' && (
              <button
                onClick={() => { onClose(); onSell(item) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-orange-100 hover:text-orange-600 transition-colors text-muted-foreground"
              >
                <Tag size={14} />
                Vender
              </button>
            )}
            <button
              onClick={() => { onClose(); onEdit(item) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-accent transition-colors text-muted-foreground"
            >
              <Pencil size={14} />
              Editar
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-accent transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scroll content */}
        <div className="flex-1 overflow-y-auto">

          {/* Imagen */}
          <div className="aspect-square bg-white w-full">
            {item.images.length > 0
              ? <ImageCarousel images={item.images} alt={item.name} className="w-full h-full" />
              : <div className="w-full h-full flex items-center justify-center text-7xl">
                  {CATEGORY_EMOJI[item.category]}
                </div>
            }
          </div>

          <div className="px-5 py-4 space-y-5">

            {/* Nombre + condición */}
            <div>
              <h2 className="text-lg font-bold leading-snug">{item.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', CONDITION_STYLE[item.condition])}>
                  {CONDITION_LABEL[item.condition]}
                </span>
                {dateStr && (
                  <span className="text-xs text-muted-foreground">{dateStr}</span>
                )}
              </div>
            </div>

            {/* Precios */}
            {(item.acquisition_price != null || item.estimated_value != null) && (
              <div className="grid grid-cols-2 gap-3">
                {item.acquisition_price != null && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Precio compra</p>
                    <p className="font-semibold text-sm">{fmt(item.acquisition_price)}</p>
                  </div>
                )}
                {item.estimated_value != null && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">Valor estimado</p>
                    <p className="font-semibold text-sm">{fmt(item.estimated_value)}</p>
                  </div>
                )}
                {item.acquisition_price != null && item.estimated_value != null && (
                  <div className={cn('col-span-2 rounded-lg p-3', diff >= 0 ? 'bg-green-50' : 'bg-red-50')}>
                    <p className="text-xs text-muted-foreground mb-0.5">Diferencia</p>
                    <p className={cn('font-semibold text-sm', diff >= 0 ? 'text-green-700' : 'text-red-600')}>
                      {diff >= 0 ? '+' : ''}{fmt(diff)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Detalles de categoría */}
            {extraRows.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Detalles</p>
                {extraRows.map(row => (
                  <div key={row.label} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium text-right max-w-[60%]">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notas */}
            {item.notes && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notas</p>
                <p className="text-sm leading-relaxed text-foreground/80">{item.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
