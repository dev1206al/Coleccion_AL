import { useState, useMemo } from 'react'
import {
  Tag, CheckCircle, Undo2, Pencil, Package,
  DollarSign, TrendingUp, TrendingDown, ShoppingBag,
} from 'lucide-react'
import { useSaleItems, useReturnToCollection } from '@/hooks/useCollection'
import MarkSoldDialog from '@/components/MarkSoldDialog'
import AddItemDialog from '@/components/AddItemDialog'
import ItemDetailPanel from '@/components/ItemDetailPanel'
import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/lib/utils'
import type { CollectionItem } from '@/types/collection'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_EMOJI: Record<CollectionItem['category'], string> = {
  figures: '🦸', headphones: '🎧', vinyls: '🎵', lego: '🧱', perfumes: '🌸',
}
const CONDITION_STYLE: Record<CollectionItem['condition'], string> = {
  sealed: 'bg-purple-100 text-purple-800', mint: 'bg-green-100 text-green-800',
  near_mint: 'bg-blue-100 text-blue-800',  good: 'bg-yellow-100 text-yellow-800',
  fair: 'bg-red-100 text-red-800',
}
const CONDITION_LABEL: Record<CollectionItem['condition'], string> = {
  sealed: 'Sealed', mint: 'Mint', near_mint: 'Near Mint', good: 'Good', fair: 'Fair',
}
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

function formatSaleDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-')
  return `${d} ${MONTHS[parseInt(m) - 1]} ${y}`
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color?: string
}) {
  return (
    <div className="border rounded-xl p-4 bg-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className="p-1.5 rounded-md bg-muted"><Icon size={14} className="text-muted-foreground" /></div>
      </div>
      <p className="text-xl font-bold tracking-tight" style={color ? { color } : {}}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function ForSaleCard({ item, onSold, onReturn, onEdit, onDetail }: {
  item: CollectionItem
  onSold:   (i: CollectionItem) => void
  onReturn: (i: CollectionItem) => void
  onEdit:   (i: CollectionItem) => void
  onDetail: (i: CollectionItem) => void
}) {
  const [confirmReturn, setConfirmReturn] = useState(false)

  return (
    <div
      className="border rounded-lg bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onDetail(item)}
    >
      {/* Imagen */}
      <div className="aspect-square bg-white flex items-center justify-center text-5xl overflow-hidden relative">
        {item.images.length > 0
          ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain p-2" />
          : CATEGORY_EMOJI[item.category]}
        <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          En venta
        </span>
      </div>

      <div className="p-3 space-y-2">
        <p className="font-medium text-sm truncate">{item.name}</p>
        {item.brand && <p className="text-xs text-muted-foreground truncate">{item.brand}</p>}

        {/* Precios */}
        <div className="flex items-center justify-between text-xs">
          <span className={cn('px-2 py-0.5 rounded-full font-medium', CONDITION_STYLE[item.condition])}>
            {CONDITION_LABEL[item.condition]}
          </span>
          {item.asking_price != null && (
            <span className="font-semibold text-orange-600">{fmt(item.asking_price)}</span>
          )}
        </div>

        {item.acquisition_price != null && item.asking_price != null && (
          <p className="text-xs text-muted-foreground">
            Comprado en {fmt(item.acquisition_price)}
            {' · '}
            <span className={item.asking_price >= item.acquisition_price ? 'text-green-600' : 'text-red-500'}>
              {item.asking_price >= item.acquisition_price ? '+' : ''}
              {fmt(item.asking_price - item.acquisition_price)}
            </span>
          </p>
        )}

        {item.sale_notes && (
          <p className="text-xs text-muted-foreground truncate">{item.sale_notes}</p>
        )}

        {/* Acciones */}
        <div
          className="flex gap-1 pt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          {confirmReturn ? (
            <div className="flex items-center gap-1 w-full">
              <span className="text-xs text-muted-foreground mr-1">¿Devolver?</span>
              <button onClick={() => onReturn(item)}
                className="px-2 py-1 rounded text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-80">
                Sí
              </button>
              <button onClick={() => setConfirmReturn(false)}
                className="px-2 py-1 rounded text-[11px] font-medium bg-muted hover:bg-accent">
                No
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onSold(item)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium bg-green-600 text-white hover:opacity-90 transition-opacity"
              >
                <CheckCircle size={12} /> Vendido
              </button>
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                title="Editar ítem"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => setConfirmReturn(true)}
                className="p-1.5 rounded-md hover:bg-accent text-muted-foreground transition-colors"
                title="Devolver a colección"
              >
                <Undo2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SoldCard({ item, onReturn, onDetail }: {
  item: CollectionItem
  onReturn: (i: CollectionItem) => void
  onDetail: (i: CollectionItem) => void
}) {
  const [confirmReturn, setConfirmReturn] = useState(false)
  const profit = item.sale_price != null && item.acquisition_price != null
    ? item.sale_price - item.acquisition_price
    : null

  return (
    <div
      className="border rounded-lg bg-card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => onDetail(item)}
    >
      {/* Imagen con overlay gris */}
      <div className="aspect-square bg-white flex items-center justify-center text-5xl overflow-hidden relative">
        {item.images.length > 0
          ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain p-2 opacity-70" />
          : <span className="opacity-50">{CATEGORY_EMOJI[item.category]}</span>}
        <span className="absolute top-2 left-2 bg-slate-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          Vendido
        </span>
      </div>

      <div className="p-3 space-y-2">
        <p className="font-medium text-sm truncate">{item.name}</p>
        {item.brand && <p className="text-xs text-muted-foreground truncate">{item.brand}</p>}

        <div className="flex items-center justify-between text-xs">
          <span className={cn('px-2 py-0.5 rounded-full font-medium', CONDITION_STYLE[item.condition])}>
            {CONDITION_LABEL[item.condition]}
          </span>
          {item.sale_price != null && (
            <span className="font-semibold">{fmt(item.sale_price)}</span>
          )}
        </div>

        {profit !== null && (
          <p className={cn('text-xs font-medium', profit >= 0 ? 'text-green-600' : 'text-red-500')}>
            {profit >= 0 ? '▲ +' : '▼ '}{fmt(Math.abs(profit))}
            {item.acquisition_price != null && (
              <span className="text-muted-foreground font-normal ml-1">
                vs {fmt(item.acquisition_price)}
              </span>
            )}
          </p>
        )}

        {item.sale_date && (
          <p className="text-xs text-muted-foreground">{formatSaleDate(item.sale_date)}</p>
        )}
        {item.sale_notes && (
          <p className="text-xs text-muted-foreground truncate">{item.sale_notes}</p>
        )}

        {/* Devolver */}
        <div
          className="pt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          {confirmReturn ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1">¿Devolver?</span>
              <button onClick={() => onReturn(item)}
                className="px-2 py-1 rounded text-[11px] font-medium bg-primary text-primary-foreground hover:opacity-80">
                Sí
              </button>
              <button onClick={() => setConfirmReturn(false)}
                className="px-2 py-1 rounded text-[11px] font-medium bg-muted hover:bg-accent">
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReturn(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Undo2 size={12} /> Devolver a colección
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

type Tab = 'for_sale' | 'sold'

export default function VentasPage() {
  const { data: allItems = [], isLoading } = useSaleItems()
  const returnToCollection = useReturnToCollection()
  const { toast } = useToast()

  const [tab,          setTab]          = useState<Tab>('for_sale')
  const [soldDialog,   setSoldDialog]   = useState<CollectionItem | undefined>()
  const [editingItem,  setEditingItem]  = useState<CollectionItem | undefined>()
  const [detailItem,   setDetailItem]   = useState<CollectionItem | null>(null)

  const forSaleItems = useMemo(() => allItems.filter(i => i.status === 'for_sale'), [allItems])
  const soldItems    = useMemo(() => allItems.filter(i => i.status === 'sold'),     [allItems])

  const totalRecaudado = soldItems.reduce((s, i) => s + (i.sale_price ?? 0), 0)
  const gananciaNeta   = soldItems.reduce((s, i) => s + ((i.sale_price ?? 0) - (i.acquisition_price ?? 0)), 0)

  async function handleReturn(item: CollectionItem) {
    await returnToCollection.mutateAsync(item.id)
    toast(`"${item.name}" devuelto a la colección`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ventas</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="En venta"
          value={String(forSaleItems.length)}
          sub={forSaleItems.length === 1 ? 'ítem' : 'ítems'}
          icon={Tag}
          color="#f97316"
        />
        <StatCard
          label="Vendidos"
          value={String(soldItems.length)}
          sub={soldItems.length === 1 ? 'ítem' : 'ítems'}
          icon={ShoppingBag}
        />
        <StatCard
          label="Total recaudado"
          value={totalRecaudado > 0 ? fmt(totalRecaudado) : '—'}
          sub={soldItems.length > 0 ? `${soldItems.length} ventas` : undefined}
          icon={DollarSign}
        />
        <StatCard
          label="Ganancia neta"
          value={soldItems.length > 0 ? fmt(Math.abs(gananciaNeta)) : '—'}
          sub={gananciaNeta > 0 ? '▲ Ganancia' : gananciaNeta < 0 ? '▼ Pérdida' : undefined}
          icon={gananciaNeta >= 0 ? TrendingUp : TrendingDown}
          color={soldItems.length > 0 ? (gananciaNeta >= 0 ? '#16a34a' : '#dc2626') : undefined}
        />
      </div>

      {/* Tabs */}
      <div className="flex border-b gap-1">
        {([
          { key: 'for_sale' as Tab, label: 'En venta', count: forSaleItems.length },
          { key: 'sold'     as Tab, label: 'Vendidos', count: soldItems.length },
        ]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
            <span className={cn(
              'ml-2 text-xs px-1.5 py-0.5 rounded-full',
              tab === t.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'for_sale' && (
        forSaleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground space-y-2">
            <Tag size={44} className="opacity-20" />
            <p className="text-lg font-medium">Nada en venta</p>
            <p className="text-sm">Desde tu colección puedes marcar ítems como "En venta".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {forSaleItems.map(item => (
              <ForSaleCard
                key={item.id}
                item={item}
                onSold={i  => setSoldDialog(i)}
                onReturn={handleReturn}
                onEdit={i  => setEditingItem(i)}
                onDetail={i => setDetailItem(i)}
              />
            ))}
          </div>
        )
      )}

      {tab === 'sold' && (
        soldItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground space-y-2">
            <Package size={44} className="opacity-20" />
            <p className="text-lg font-medium">Aún no hay ventas</p>
            <p className="text-sm">Los ítems que marques como vendidos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {soldItems.map(item => (
              <SoldCard
                key={item.id}
                item={item}
                onReturn={handleReturn}
                onDetail={i => setDetailItem(i)}
              />
            ))}
          </div>
        )
      )}

      {/* Dialogs */}
      <MarkSoldDialog
        open={!!soldDialog}
        onClose={() => setSoldDialog(undefined)}
        item={soldDialog}
        onSuccess={() => {
          toast(`"${soldDialog?.name}" marcado como vendido`)
          setSoldDialog(undefined)
        }}
      />

      <AddItemDialog
        open={!!editingItem}
        onClose={() => setEditingItem(undefined)}
        item={editingItem}
        onSuccess={() => toast('Ítem actualizado')}
      />

      <ItemDetailPanel
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={item => { setDetailItem(null); setEditingItem(item) }}
      />
    </div>
  )
}
