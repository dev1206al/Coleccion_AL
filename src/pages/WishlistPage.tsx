import { useState, useMemo } from 'react'
import { Heart, Trash2, Pencil, ExternalLink, Search, Package, ArrowUpDown, CheckCircle2, SlidersHorizontal, X as XIcon } from 'lucide-react'
import { useWishlistItems, useDeleteWishlistItem } from '@/hooks/useWishlist'
import AddWishlistDialog from '@/components/AddWishlistDialog'
import AddItemDialog from '@/components/AddItemDialog'
import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/lib/utils'
import type { WishlistItem, WishlistPriority, Category } from '@/types/collection'

type WishlistSortKey =
  | 'created_desc' | 'created_asc'
  | 'name_asc'     | 'name_desc'
  | 'price_asc'    | 'price_desc'
  | 'priority'

const WISHLIST_SORT_OPTIONS: { value: WishlistSortKey; label: string }[] = [
  { value: 'created_desc', label: 'Más reciente agregado' },
  { value: 'created_asc',  label: 'Más antiguo agregado' },
  { value: 'name_asc',     label: 'Nombre A → Z' },
  { value: 'name_desc',    label: 'Nombre Z → A' },
  { value: 'price_asc',    label: 'Precio objetivo: menor a mayor' },
  { value: 'price_desc',   label: 'Precio objetivo: mayor a menor' },
  { value: 'priority',     label: 'Por prioridad' },
]

const PRIORITY_ORDER: Record<WishlistPriority, number> = { high: 0, medium: 1, low: 2 }

function sortWishlist(items: WishlistItem[], key: WishlistSortKey): WishlistItem[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case 'created_desc': return a.created_at < b.created_at ? 1 : -1
      case 'created_asc':  return a.created_at > b.created_at ? 1 : -1
      case 'name_asc':     return a.name.localeCompare(b.name, 'es')
      case 'name_desc':    return b.name.localeCompare(a.name, 'es')
      case 'price_asc':    return (a.target_price ?? -1) - (b.target_price ?? -1)
      case 'price_desc':   return (b.target_price ?? -1) - (a.target_price ?? -1)
      case 'priority':     return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      default: return 0
    }
  })
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const PRIORITY_STYLE: Record<WishlistPriority, string> = {
  high:   'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:    'bg-green-100 text-green-700 border-green-200',
}
const PRIORITY_LABEL: Record<WishlistPriority, string> = {
  high: 'Alta', medium: 'Media', low: 'Baja',
}
const CATEGORY_EMOJI: Record<Category, string> = {
  figures: '🦸', headphones: '🎧', vinyls: '🎵', lego: '🧱', perfumes: '🌸',
}
const CATEGORY_LABEL: Record<Category, string> = {
  figures: 'Figuras', headphones: 'Audífonos', vinyls: 'Vinilos', lego: 'LEGO', perfumes: 'Perfumes',
}
const ALL_CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[]

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  item: WishlistItem
  onEdit: (i: WishlistItem) => void
  onObtained: (i: WishlistItem) => void
  onDeleted: () => void
}

function WishlistCard({ item, onEdit, onObtained, onDeleted }: CardProps) {
  const deleteItem  = useDeleteWishlistItem()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    await deleteItem.mutateAsync(item.id)
    onDeleted()
  }

  return (
    <div className="border rounded-lg bg-card p-4 hover:shadow-md transition-shadow group space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="text-2xl shrink-0 leading-none mt-0.5">{CATEGORY_EMOJI[item.category]}</span>
          <div className="min-w-0">
            <p className="font-medium text-sm leading-snug">{item.name}</p>
            {item.brand && (
              <p className="text-xs text-muted-foreground truncate">{item.brand}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
          {confirming ? (
            <>
              <button
                onClick={handleDelete}
                disabled={deleteItem.isPending}
                className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                Sí
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-muted hover:bg-accent transition-colors"
              >
                No
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onObtained(item)}
                title="Lo obtuve"
                className="p-1 rounded hover:bg-green-100 hover:text-green-700 text-muted-foreground transition-colors"
              >
                <CheckCircle2 size={14} />
              </button>
              <button
                onClick={() => onEdit(item)}
                className="p-1 rounded hover:bg-accent text-muted-foreground"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setConfirming(true)}
                className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium border', PRIORITY_STYLE[item.priority])}>
          {PRIORITY_LABEL[item.priority]}
        </span>
        {item.target_price != null && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
            ${item.target_price.toLocaleString()}
          </span>
        )}
        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-0.5 hover:underline"
            onClick={e => e.stopPropagation()}
          >
            Ver <ExternalLink size={10} />
          </a>
        )}
      </div>

      {/* Notas */}
      {item.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>
      )}
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const { data: items = [], isLoading } = useWishlistItems()
  const { toast }                         = useToast()
  const deleteWishlist                    = useDeleteWishlistItem()
  const [dialogOpen,      setDialogOpen]      = useState(false)
  const [editingItem,     setEditingItem]     = useState<WishlistItem | undefined>()
  const [obtainingItem,   setObtainingItem]   = useState<WishlistItem | undefined>()
  const [search,          setSearch]          = useState('')
  const [filterCat,       setFilterCat]       = useState<Category | 'all'>('all')
  const [filterPri,       setFilterPri]       = useState<WishlistPriority | 'all'>('all')
  const [sortBy,          setSortBy]          = useState<WishlistSortKey>('created_desc')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const base = items.filter(i => {
      if (filterCat !== 'all' && i.category !== filterCat) return false
      if (filterPri !== 'all' && i.priority !== filterPri) return false
      if (q && !i.name.toLowerCase().includes(q) && !i.brand.toLowerCase().includes(q)) return false
      return true
    })
    return sortWishlist(base, sortBy)
  }, [items, search, filterCat, filterPri, sortBy])

  function openAdd() {
    setEditingItem(undefined)
    setDialogOpen(true)
  }

  function openEdit(item: WishlistItem) {
    setEditingItem(item)
    setDialogOpen(true)
  }

  async function handleObtained(wishlistItem: WishlistItem) {
    setObtainingItem(wishlistItem)
  }

  async function handleCollectionSuccess() {
    if (obtainingItem) {
      await deleteWishlist.mutateAsync(obtainingItem.id)
      toast(`"${obtainingItem.name}" movido a la colección`)
      setObtainingItem(undefined)
    }
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
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wishlist</h2>
          {items.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
              {filtered.length !== items.length && ` · ${filtered.length} mostrados`}
            </p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Heart size={16} />
          Agregar deseo
        </button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground space-y-2">
          <Heart size={48} className="opacity-20" />
          <p className="text-lg font-medium">Tu wishlist está vacía</p>
          <p className="text-sm">Agrega ítems que quieres conseguir.</p>
        </div>
      ) : (
        <>
          {/* Filtros */}
          <div className="space-y-3">
            {/* Buscador + controles */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar en wishlist..."
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="w-full pl-9 pr-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Mobile/tablet: botón de filtros */}
              {(() => {
                const badge = (filterCat !== 'all' ? 1 : 0) + (filterPri !== 'all' ? 1 : 0)
                return (
                  <button
                    onClick={() => setFilterSheetOpen(true)}
                    className={cn(
                      'lg:hidden flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors shrink-0',
                      badge > 0
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-background hover:bg-accent',
                    )}
                  >
                    <SlidersHorizontal size={15} />
                    Filtros
                    {badge > 0 && (
                      <span className="bg-primary text-primary-foreground rounded-full min-w-[18px] h-[18px] text-[10px] flex items-center justify-center font-bold leading-none px-1">
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })()}

              {/* Desktop: sort select */}
              <div className="hidden lg:block relative">
                <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as WishlistSortKey)}
                  className="pl-7 pr-8 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer text-foreground"
                >
                  {WISHLIST_SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desktop: Categoría + Prioridad */}
            <div className="hidden lg:flex gap-2 overflow-x-auto pb-0.5 flex-nowrap lg:flex-wrap scrollbar-none">
              <button
                onClick={() => setFilterCat('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                  filterCat === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent',
                )}
              >
                Todas
              </button>
              {ALL_CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => setFilterCat(filterCat === cat ? 'all' : cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                    filterCat === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent',
                  )}
                >
                  {CATEGORY_EMOJI[cat]} {CATEGORY_LABEL[cat]}
                </button>
              ))}
              <span className="w-px bg-border self-stretch mx-1" />
              {(['high', 'medium', 'low'] as WishlistPriority[]).map(p => (
                <button key={p}
                  onClick={() => setFilterPri(filterPri === p ? 'all' : p)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                    filterPri === p
                      ? PRIORITY_STYLE[p]
                      : 'bg-background hover:bg-accent',
                  )}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile/tablet: filter bottom sheet */}
          {filterSheetOpen && (
            <>
              <div
                className="fixed inset-0 z-[55] bg-black/40"
                onClick={() => setFilterSheetOpen(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 z-[60] bg-card rounded-t-2xl shadow-2xl animate-detail-panel">
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                  <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
                  <h3 className="font-semibold text-base">Filtros</h3>
                  <div className="flex items-center gap-3">
                    {(filterCat !== 'all' || filterPri !== 'all' || sortBy !== 'created_desc') && (
                      <button
                        onClick={() => { setFilterCat('all'); setFilterPri('all'); setSortBy('created_desc') }}
                        className="text-xs text-primary font-medium"
                      >
                        Limpiar todo
                      </button>
                    )}
                    <button
                      onClick={() => setFilterSheetOpen(false)}
                      className="p-1.5 rounded-md hover:bg-accent transition-colors"
                    >
                      <XIcon size={18} />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto overscroll-contain max-h-[62vh] px-5 py-4 space-y-5">

                  {/* Ordenar por */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ordenar por</p>
                    <div className="relative">
                      <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as WishlistSortKey)}
                        className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none text-foreground"
                      >
                        {WISHLIST_SORT_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Categoría</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setFilterCat('all')}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                          filterCat === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent',
                        )}
                      >
                        Todas
                      </button>
                      {ALL_CATEGORIES.map(cat => (
                        <button key={cat}
                          onClick={() => setFilterCat(filterCat === cat ? 'all' : cat)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                            filterCat === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent',
                          )}
                        >
                          {CATEGORY_EMOJI[cat]} {CATEGORY_LABEL[cat]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prioridad */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Prioridad</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setFilterPri('all')}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                          filterPri === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-accent',
                        )}
                      >
                        Todas
                      </button>
                      {(['high', 'medium', 'low'] as WishlistPriority[]).map(p => (
                        <button key={p}
                          onClick={() => setFilterPri(filterPri === p ? 'all' : p)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
                            filterPri === p ? PRIORITY_STYLE[p] : 'bg-background hover:bg-accent',
                          )}
                        >
                          {PRIORITY_LABEL[p]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ height: 'env(safe-area-inset-bottom)' }} />
                </div>
              </div>
            </>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-2">
              <Package size={40} className="opacity-20" />
              <p className="text-sm">No hay ítems con esos filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(item => (
                <WishlistCard
                  key={item.id}
                  item={item}
                  onEdit={openEdit}
                  onObtained={handleObtained}
                  onDeleted={() => toast('Ítem eliminado de la wishlist')}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AddWishlistDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingItem(undefined) }}
        item={editingItem}
      />

      {/* "Lo obtuve" → abre formulario de colección pre-llenado */}
      <AddItemDialog
        open={!!obtainingItem}
        onClose={() => setObtainingItem(undefined)}
        prefill={obtainingItem ? {
          name:     obtainingItem.name,
          category: obtainingItem.category,
          brand:    obtainingItem.brand,
          price:    obtainingItem.target_price ?? undefined,
          notes:    obtainingItem.notes ?? undefined,
        } : undefined}
        onSuccess={handleCollectionSuccess}
      />
    </div>
  )
}
