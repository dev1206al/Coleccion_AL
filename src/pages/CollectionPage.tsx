import { useState, useMemo, useEffect } from 'react'
import { Package, Plus, X, Search, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useCollectionItems, useCollectionCounts, type CollectionFilters } from '@/hooks/useCollection'
import { useSwipeDown } from '@/hooks/useSwipeDown'
import ItemCard from '@/components/ItemCard'
import SkeletonCard from '@/components/SkeletonCard'
import ItemDetailPanel from '@/components/ItemDetailPanel'
import AddItemDialog from '@/components/AddItemDialog'
import PutForSaleDialog from '@/components/PutForSaleDialog'
import { categoryFilters, conditionLabel } from '@/lib/categoryFilters'
import { useToast } from '@/contexts/ToastContext'
import { cn } from '@/lib/utils'
import type { Category, CollectionItem } from '@/types/collection'

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortKey =
  | 'created_desc' | 'created_asc'
  | 'name_asc'     | 'name_desc'
  | 'price_asc'    | 'price_desc'
  | 'value_asc'    | 'value_desc'
  | 'year_desc'    | 'year_asc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'created_desc', label: 'Más reciente agregado' },
  { value: 'created_asc',  label: 'Más antiguo agregado' },
  { value: 'name_asc',     label: 'Nombre A → Z' },
  { value: 'name_desc',    label: 'Nombre Z → A' },
  { value: 'price_asc',    label: 'Precio: menor a mayor' },
  { value: 'price_desc',   label: 'Precio: mayor a menor' },
  { value: 'value_asc',    label: 'Valor estimado: menor a mayor' },
  { value: 'value_desc',   label: 'Valor estimado: mayor a menor' },
  { value: 'year_desc',    label: 'Compra: más reciente' },
  { value: 'year_asc',     label: 'Compra: más antigua' },
]

function sortItems(items: CollectionItem[], key: SortKey): CollectionItem[] {
  return [...items].sort((a, b) => {
    switch (key) {
      case 'created_desc': return a.created_at < b.created_at ? 1 : -1
      case 'created_asc':  return a.created_at > b.created_at ? 1 : -1
      case 'name_asc':     return a.name.localeCompare(b.name, 'es')
      case 'name_desc':    return b.name.localeCompare(a.name, 'es')
      case 'price_asc':    return (a.acquisition_price ?? -1) - (b.acquisition_price ?? -1)
      case 'price_desc':   return (b.acquisition_price ?? -1) - (a.acquisition_price ?? -1)
      case 'value_asc':    return (a.estimated_value ?? -1) - (b.estimated_value ?? -1)
      case 'value_desc':   return (b.estimated_value ?? -1) - (a.estimated_value ?? -1)
      case 'year_desc': {
        const ya = (a.acquisition_year ?? 0) * 12 + (a.acquisition_month ?? 0)
        const yb = (b.acquisition_year ?? 0) * 12 + (b.acquisition_month ?? 0)
        return yb - ya
      }
      case 'year_asc': {
        const ya = (a.acquisition_year ?? 9999) * 12 + (a.acquisition_month ?? 0)
        const yb = (b.acquisition_year ?? 9999) * 12 + (b.acquisition_month ?? 0)
        return ya - yb
      }
      default: return 0
    }
  })
}

// ─── Paginación ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 20

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)
  if (totalPages <= 1) return null

  const pages: (number | '…')[] = []
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i)
  } else {
    pages.push(0)
    if (page > 2) pages.push('…')
    for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i)
    if (page < totalPages - 3) pages.push('…')
    pages.push(totalPages - 1)
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Móvil: indicador compacto */}
      <span className="sm:hidden text-sm text-muted-foreground px-3 min-w-[80px] text-center">
        {page + 1} / {totalPages}
      </span>

      {/* Desktop: botones numerados */}
      <div className="hidden sm:flex items-center gap-1">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={cn(
                'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                page === p
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-foreground',
              )}
            >
              {(p as number) + 1}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-1.5 rounded-md hover:bg-accent disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─── Categorías ───────────────────────────────────────────────────────────────

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: 'figures',    label: 'Figuras',   emoji: '🦸' },
  { value: 'headphones', label: 'Audífonos', emoji: '🎧' },
  { value: 'vinyls',     label: 'Vinilos',   emoji: '🎵' },
  { value: 'lego',       label: 'LEGO',      emoji: '🧱' },
  { value: 'perfumes',   label: 'Perfumes',  emoji: '🌸' },
]

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CollectionPage() {
  const [activeCategory, setActiveCategory] = useState<Category | undefined>(() =>
    (localStorage.getItem('col_cat') as Category | null) ?? undefined
  )
  const [activeFilters, setActiveFilters] = useState<Omit<CollectionFilters, 'category'>>(() => {
    try { return JSON.parse(localStorage.getItem('col_filters') ?? '{}') } catch { return {} }
  })
  const [dialogOpen,      setDialogOpen]      = useState(false)
  const [editingItem,     setEditingItem]      = useState<CollectionItem | undefined>()
  const [duplicatingItem, setDuplicatingItem]  = useState<CollectionItem | undefined>()
  const [detailItem,      setDetailItem]       = useState<CollectionItem | null>(null)
  const [sellingItem,     setSellingItem]      = useState<CollectionItem | undefined>()
  const [search,          setSearch]           = useState('')
  const [sortBy,          setSortByState]      = useState<SortKey>(() =>
    (localStorage.getItem('col_sort') as SortKey) ?? 'created_desc'
  )
  const [page,            setPage]             = useState(0)
  const [filterSheetOpen, setFilterSheetOpen]  = useState(false)

  const { toast } = useToast()
  const filterSheet = useSwipeDown(() => setFilterSheetOpen(false))

  function setSortBy(key: SortKey) {
    setSortByState(key)
    localStorage.setItem('col_sort', key)
  }

  const filters: CollectionFilters = { ...activeFilters, category: activeCategory, status: 'owned' }
  const { data: items, isLoading }  = useCollectionItems(filters)
  const { data: counts = {} }       = useCollectionCounts()

  const q = search.trim().toLowerCase()

  const visibleItems = useMemo(() => {
    if (!items) return []
    const filtered = q
      ? items.filter(item => {
          const extra = item.extra as Record<string, unknown>
          return (
            item.name.toLowerCase().includes(q) ||
            item.brand.toLowerCase().includes(q) ||
            item.subcategory.toLowerCase().includes(q) ||
            String(extra.artist ?? '').toLowerCase().includes(q)
          )
        })
      : items
    return sortItems(filtered, sortBy)
  }, [items, q, sortBy])

  useEffect(() => { setPage(0) }, [search, sortBy, activeCategory, activeFilters])

  const pagedItems = visibleItems.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)
  const totalItems = visibleItems.length

  function selectCategory(cat: Category | undefined) {
    setActiveCategory(cat)
    setActiveFilters({})
    if (cat) localStorage.setItem('col_cat', cat)
    else localStorage.removeItem('col_cat')
    localStorage.setItem('col_filters', '{}')
  }

  function toggleFilter(key: keyof Omit<CollectionFilters, 'category'>, value: string) {
    setActiveFilters(prev => {
      const next = { ...prev, [key]: prev[key] === value ? undefined : value }
      localStorage.setItem('col_filters', JSON.stringify(next))
      return next
    })
  }

  function setFilter(key: keyof Omit<CollectionFilters, 'category'>, value: string) {
    setActiveFilters(prev => {
      const next = { ...prev, [key]: value || undefined }
      localStorage.setItem('col_filters', JSON.stringify(next))
      return next
    })
  }

  function changePage(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filtersForCategory = activeCategory ? categoryFilters[activeCategory] : []
  const activeFilterCount  = Object.values(activeFilters).filter(Boolean).length
  const hasActiveSearch    = q.length > 0
  const mobileFilterBadge  = (activeCategory !== undefined ? 1 : 0) + activeFilterCount

  function getFilterLabel(key: string, value: string) {
    if (key === 'condition') return conditionLabel[value] ?? value
    return value
  }

  function handleDeleted() {
    toast('Ítem eliminado')
    setDetailItem(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">Mi Colección</h2>
          {items && (
            <p className="text-sm text-muted-foreground">
              {hasActiveSearch
                ? `${totalItems} de ${items.length} ${items.length === 1 ? 'ítem' : 'ítems'}`
                : `${items.length} ${items.length === 1 ? 'ítem' : 'ítems'}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus size={16} />
          Agregar ítem
        </button>
      </div>

      {/* Buscador + controles */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca, artista..."
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            className="w-full pl-9 pr-9 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Mobile/tablet: botón de filtros */}
        <button
          onClick={() => setFilterSheetOpen(true)}
          className={cn(
            'lg:hidden flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium transition-colors shrink-0',
            mobileFilterBadge > 0
              ? 'bg-primary/10 border-primary/40 text-primary'
              : 'bg-background hover:bg-accent',
          )}
        >
          <SlidersHorizontal size={15} />
          Filtros
          {mobileFilterBadge > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full min-w-[18px] h-[18px] text-[10px] flex items-center justify-center font-bold leading-none px-1">
              {mobileFilterBadge}
            </span>
          )}
        </button>

        {/* Desktop: select de ordenar */}
        <div className="hidden lg:block relative">
          <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
            className="pl-7 pr-8 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer text-foreground"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop: filtros de categoría */}
      <div className="hidden lg:flex gap-2 overflow-x-auto pb-0.5 flex-nowrap lg:flex-wrap scrollbar-none">
        <button
          onClick={() => selectCategory(undefined)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            !activeCategory
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-accent',
          )}
        >
          Todos {Object.values(counts).reduce((a, b) => a + b, 0) > 0 &&
            <span className="ml-1 opacity-70">({Object.values(counts).reduce((a, b) => a + b, 0)})</span>}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => selectCategory(activeCategory === cat.value ? undefined : cat.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              activeCategory === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent',
            )}
          >
            {cat.emoji} {cat.label}
            {counts[cat.value] != null &&
              <span className="ml-1 opacity-70">({counts[cat.value]})</span>}
          </button>
        ))}
      </div>

      {/* Desktop: filtros específicos */}
      {filtersForCategory.length > 0 && (
        <div className="hidden lg:block space-y-2 border rounded-lg p-3 bg-muted/30">
          {filtersForCategory.map((filterDef) => (
            <div key={filterDef.key} className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                {filterDef.label}
              </span>
              {filterDef.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleFilter(filterDef.key, opt)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                    activeFilters[filterDef.key] === opt
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent border-border',
                  )}
                >
                  {getFilterLabel(filterDef.key, opt)}
                </button>
              ))}
            </div>
          ))}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { setActiveFilters({}); localStorage.setItem('col_filters', '{}') }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              <X size={12} />
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Grid de ítems */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : pagedItems.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pagedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={item => { setEditingItem(item) }}
                onDetail={setDetailItem}
                onSell={setSellingItem}
                onDeleted={handleDeleted}
              />
            ))}
          </div>
          <Pagination page={page} total={totalItems} onChange={changePage} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground space-y-2">
          <Package size={48} className="opacity-20" />
          <p className="text-lg font-medium">
            {hasActiveSearch
              ? `Sin resultados para "${search}"`
              : activeFilterCount > 0
              ? 'Sin resultados para estos filtros'
              : activeCategory
              ? 'No hay ítems en esta categoría'
              : 'Tu colección está vacía'}
          </p>
          <p className="text-sm">
            {hasActiveSearch || activeFilterCount > 0
              ? 'Prueba con otros términos o limpia los filtros.'
              : 'Agrega tu primer ítem para comenzar.'}
          </p>
        </div>
      )}

      {/* Dialogs */}
      <AddItemDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        defaultCategory={activeCategory}
        onSuccess={() => toast('Ítem agregado a la colección')}
      />
      <AddItemDialog
        open={!!editingItem}
        onClose={() => setEditingItem(undefined)}
        item={editingItem}
        onSuccess={() => toast('Ítem actualizado')}
      />
      <AddItemDialog
        open={!!duplicatingItem}
        onClose={() => setDuplicatingItem(undefined)}
        item={duplicatingItem}
        isDuplicate
        onSuccess={() => toast('Ítem duplicado')}
      />

      {/* Panel detalle */}
      <ItemDetailPanel
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={item => { setDetailItem(null); setEditingItem(item) }}
        onDuplicate={item => { setDetailItem(null); setDuplicatingItem(item) }}
        onSell={item => { setDetailItem(null); setSellingItem(item) }}
      />

      {/* Poner en venta */}
      <PutForSaleDialog
        open={!!sellingItem}
        onClose={() => setSellingItem(undefined)}
        item={sellingItem}
        onSuccess={() => {
          toast(`"${sellingItem?.name}" movido a ventas`)
          setSellingItem(undefined)
        }}
      />

      {/* Mobile/tablet: filter bottom sheet */}
      {filterSheetOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/40"
            onClick={() => setFilterSheetOpen(false)}
          />
          <div
            ref={filterSheet.panelRef}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-card rounded-t-2xl shadow-2xl animate-detail-panel"
          >
            <div
              ref={filterSheet.handleRef}
              className="flex justify-center pt-3 pb-1 shrink-0 touch-none cursor-grab"
            >
              <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
              <h3 className="font-semibold text-base">Filtros</h3>
              <div className="flex items-center gap-3">
                {(mobileFilterBadge > 0 || sortBy !== 'created_desc') && (
                  <button
                    onClick={() => { selectCategory(undefined); setSortBy('created_desc') }}
                    className="text-xs text-primary font-medium"
                  >
                    Limpiar todo
                  </button>
                )}
                <button
                  onClick={() => setFilterSheetOpen(false)}
                  className="p-1.5 rounded-md hover:bg-accent transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto overscroll-contain max-h-[62vh] px-5 py-4 space-y-5">

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Ordenar por
                </p>
                <div className="relative">
                  <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortKey)}
                    className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none text-foreground"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Categoría
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => selectCategory(undefined)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                      !activeCategory
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-accent',
                    )}
                  >
                    Todos
                    {Object.values(counts).reduce((a, b) => a + b, 0) > 0 &&
                      <span className="ml-1 opacity-70">({Object.values(counts).reduce((a, b) => a + b, 0)})</span>}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => selectCategory(activeCategory === cat.value ? undefined : cat.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                        activeCategory === cat.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-accent',
                      )}
                    >
                      {cat.emoji} {cat.label}
                      {counts[cat.value] != null &&
                        <span className="ml-1 opacity-70">({counts[cat.value]})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {filtersForCategory.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Filtros específicos
                  </p>
                  {filtersForCategory.map((filterDef) => (
                    <div key={filterDef.key}>
                      <label className="block text-sm font-medium mb-1.5">{filterDef.label}</label>
                      <select
                        value={activeFilters[filterDef.key] ?? ''}
                        onChange={e => setFilter(filterDef.key, e.target.value)}
                        className="w-full px-3 py-2.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                      >
                        <option value="">Todos</option>
                        {filterDef.options.map(opt => (
                          <option key={opt} value={opt}>{getFilterLabel(filterDef.key, opt)}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ height: 'env(safe-area-inset-bottom)' }} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
