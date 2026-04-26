import { useState, useEffect, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useAddItem, useUpdateItem } from '@/hooks/useCollection'
import SelectWithOther from '@/components/SelectWithOther'
import ImageUploader from '@/components/ImageUploader'
import { uploadImage } from '@/lib/storage'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { Category, ItemCondition, CollectionItem } from '@/types/collection'

// ─── Constantes ───────────────────────────────────────────────────────────────

const categories: { value: Category; label: string; emoji: string }[] = [
  { value: 'figures',    label: 'Figura',    emoji: '🦸' },
  { value: 'headphones', label: 'Audífonos', emoji: '🎧' },
  { value: 'vinyls',     label: 'Vinilo',    emoji: '🎵' },
  { value: 'lego',       label: 'LEGO',      emoji: '🧱' },
  { value: 'perfumes',   label: 'Perfume',   emoji: '🌸' },
]

const conditions: { value: ItemCondition; label: string; hint: string }[] = [
  { value: 'sealed',    label: 'Sealed',    hint: 'Sin abrir' },
  { value: 'mint',      label: 'Mint',      hint: 'Perfecto' },
  { value: 'near_mint', label: 'Near Mint', hint: 'Casi' },
  { value: 'good',      label: 'Good',      hint: 'Buen uso' },
  { value: 'fair',      label: 'Fair',      hint: 'Con daños' },
]

const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const currentYear = new Date().getFullYear()
const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i)

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ExtraFields = Record<string, string>

function defaultExtra(cat: Category): ExtraFields {
  if (cat === 'figures')    return { line: '' }
  if (cat === 'headphones') return { type: '', series: '' }
  if (cat === 'vinyls')     return { artist: '', releaseYear: '', label: '' }
  if (cat === 'lego')       return { theme: '', series: '', setNumber: '' }
  return { family: '', aroma: '', concentration: '', sizeMl: '' }
}

function extraFromItem(item: CollectionItem): ExtraFields {
  const e = item.extra as Record<string, unknown>
  const str = (v: unknown) => (v != null ? String(v) : '')
  if (item.category === 'figures')    return { line: item.subcategory }
  if (item.category === 'headphones') return { type: str(e.type), series: item.subcategory }
  if (item.category === 'vinyls')     return { artist: str(e.artist), releaseYear: str(e.release_year), label: str(e.label) }
  if (item.category === 'lego')       return { theme: item.subcategory, series: str(e.series), setNumber: str(e.set_number) }
  return { family: item.subcategory, aroma: str(e.aroma), concentration: str(e.concentration), sizeMl: str(e.size_ml) }
}

// ─── Componente ───────────────────────────────────────────────────────────────

const inputClass = 'w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring'
const labelClass = 'block text-sm font-medium mb-1'

interface Prefill {
  name?: string
  category?: Category
  brand?: string
  price?: number
  notes?: string
}

interface Props {
  open: boolean
  onClose: () => void
  defaultCategory?: Category
  item?: CollectionItem
  prefill?: Prefill
  onSuccess?: () => void
}

export default function AddItemDialog({ open, onClose, defaultCategory, item, prefill, onSuccess }: Props) {
  const isEditing = !!item
  const addItem    = useAddItem()
  const updateItem = useUpdateItem()
  const mutation   = isEditing ? updateItem : addItem
  const { user }   = useAuth()

  const [category, setCategory]       = useState<Category>(item?.category ?? defaultCategory ?? 'figures')
  const [name, setName]               = useState(item?.name ?? '')
  const [brand, setBrand]             = useState(item?.brand ?? '')
  const [condition, setCondition]     = useState<ItemCondition>(item?.condition ?? 'mint')
  const [year, setYear]               = useState(item?.acquisition_year ? String(item.acquisition_year) : '')
  const [month, setMonth]             = useState(item?.acquisition_month ? String(item.acquisition_month) : '')
  const [noDate, setNoDate]           = useState(!item?.acquisition_year)
  const [price, setPrice]             = useState(item?.acquisition_price != null ? String(item.acquisition_price) : '')
  const [estValue, setEstValue]       = useState(item?.estimated_value != null ? String(item.estimated_value) : '')
  const [notes, setNotes]             = useState(item?.notes ?? '')
  const [extra, setExtra]             = useState<ExtraFields>(item ? extraFromItem(item) : defaultExtra(defaultCategory ?? 'figures'))
  const [existingUrls, setExistingUrls] = useState<string[]>(item?.images ?? [])
  const [imageFiles, setImageFiles]   = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  // Re-inicializa cuando el item cambia (al abrir para editar otro)
  useEffect(() => {
    if (!open) return
    const cat = item?.category ?? prefill?.category ?? defaultCategory ?? 'figures'
    setCategory(cat)
    setName(item?.name ?? prefill?.name ?? '')
    setBrand(item?.brand ?? prefill?.brand ?? '')
    setCondition(item?.condition ?? 'mint')
    setYear(item?.acquisition_year ? String(item.acquisition_year) : '')
    setMonth(item?.acquisition_month ? String(item.acquisition_month) : '')
    setNoDate(!item?.acquisition_year)
    setPrice(item?.acquisition_price != null ? String(item.acquisition_price) : prefill?.price != null ? String(prefill.price) : '')
    setEstValue(item?.estimated_value != null ? String(item.estimated_value) : '')
    setNotes(item?.notes ?? prefill?.notes ?? '')
    setExtra(item ? extraFromItem(item) : defaultExtra(cat))
    setExistingUrls(item?.images ?? [])
    setImageFiles([])
    setNewPreviews([])
  }, [open, item])   // eslint-disable-line react-hooks/exhaustive-deps

  const allPreviews = [...existingUrls, ...newPreviews]
  const totalImages = existingUrls.length + imageFiles.length

  function setExtraField(key: string, value: string) {
    setExtra(prev => ({ ...prev, [key]: value }))
  }

  function changeCategory(cat: Category) {
    setCategory(cat)
    setExtra(defaultExtra(cat))
  }

  function addImages(files: File[]) {
    const room = 3 - totalImages
    const toAdd = files.slice(0, room)
    const newFiles = [...imageFiles, ...toAdd]
    const newPrevs = newFiles.map(f => URL.createObjectURL(f))
    setImageFiles(newFiles)
    setNewPreviews(newPrevs)
  }

  function removeImage(i: number) {
    if (i < existingUrls.length) {
      setExistingUrls(prev => prev.filter((_, idx) => idx !== i))
    } else {
      const fileIdx = i - existingUrls.length
      URL.revokeObjectURL(newPreviews[fileIdx])
      const newFiles = imageFiles.filter((_, idx) => idx !== fileIdx)
      setImageFiles(newFiles)
      setNewPreviews(newFiles.map(f => URL.createObjectURL(f)))
    }
  }

  function buildPayload() {
    let subcategory = ''
    const extraJson: Record<string, unknown> = {}
    if (category === 'figures') {
      subcategory = extra.line ?? ''
    } else if (category === 'headphones') {
      subcategory    = extra.series ?? ''
      extraJson.type = extra.type
    } else if (category === 'vinyls') {
      extraJson.artist       = extra.artist
      extraJson.release_year = extra.releaseYear ? parseInt(extra.releaseYear) : null
      extraJson.label        = extra.label
    } else if (category === 'lego') {
      subcategory          = extra.theme ?? ''
      extraJson.series     = extra.series
      extraJson.set_number = extra.setNumber
    } else {
      subcategory             = extra.family ?? ''
      extraJson.aroma         = extra.aroma
      extraJson.concentration = extra.concentration
      extraJson.size_ml       = extra.sizeMl ? parseFloat(extra.sizeMl) : null
    }
    return { subcategory, extraJson }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const { subcategory, extraJson } = buildPayload()

    const uploadedUrls = imageFiles.length > 0
      ? await Promise.all(imageFiles.map(f => uploadImage(f, user!.id)))
      : []

    const images = [...existingUrls, ...uploadedUrls]

    const payload = {
      name,
      category,
      brand,
      subcategory,
      condition,
      status: 'owned' as const,
      acquisition_year:  (!noDate && year)  ? parseInt(year)  : null,
      acquisition_month: (!noDate && month) ? parseInt(month) : null,
      acquisition_price: price    ? parseFloat(price)    : null,
      estimated_value:   estValue ? parseFloat(estValue) : null,
      notes: notes || null,
      images,
      extra: extraJson,
    }

    if (isEditing) {
      await (updateItem as ReturnType<typeof useUpdateItem>).mutateAsync({ id: item!.id, ...payload })
    } else {
      await (addItem as ReturnType<typeof useAddItem>).mutateAsync(payload)
    }

    onSuccess?.()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="font-semibold">{isEditing ? 'Editar ítem' : 'Agregar ítem'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-accent transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">

          {/* Categoría */}
          <div>
            <label className={labelClass}>Categoría</label>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button key={cat.value} type="button"
                  onClick={() => changeCategory(cat.value)}
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
            <label className={labelClass} htmlFor="name">
              {category === 'vinyls' ? 'Álbum *' : 'Nombre *'}
            </label>
            <input id="name" required value={name} onChange={e => setName(e.target.value)}
              placeholder={
                category === 'figures'    ? 'ej. Spider-Man No Way Home' :
                category === 'vinyls'     ? 'ej. Thriller' :
                category === 'headphones' ? 'ej. WF-1000XM5' :
                category === 'lego'       ? 'ej. Batman (CMF Serie 1)' :
                'ej. Bleu de Chanel'
              }
              className={inputClass} />
          </div>

          {/* ── Campos por categoría ── */}

          {category === 'figures' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Línea</label>
                <SelectWithOther
                  options={['Marvel Legends','Mafex','SH Figuarts','Funko Pop','McFarlane Toys','NECA','Inarts']}
                  value={extra.line}
                  onChange={v => setExtraField('line', v)}
                  placeholder="Seleccionar línea"
                  otherPlaceholder="ej. S.H. Monsterarts"
                />
              </div>
              <div>
                <label className={labelClass}>Marca</label>
                <input value={brand} onChange={e => setBrand(e.target.value)}
                  placeholder="ej. Hot Toys" className={inputClass} />
              </div>
            </div>
          )}

          {category === 'headphones' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Marca</label>
                  <SelectWithOther
                    options={['Sony','Bose','Apple','Samsung','Jabra','Sennheiser']}
                    value={brand}
                    onChange={setBrand}
                    placeholder="Seleccionar marca"
                    otherPlaceholder="ej. Anker"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tipo</label>
                  <SelectWithOther
                    options={['TWS (In-ear)','Over-ear','On-ear','Neckband']}
                    value={extra.type}
                    onChange={v => setExtraField('type', v)}
                    placeholder="Tipo"
                    otherPlaceholder="ej. Bone conduction"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Serie / Modelo</label>
                <SelectWithOther
                  options={['WF-1000XM5','WF-1000XM4','WH-1000XM5','WH-1000XM4','QuietComfort 45','QuietComfort Ultra','AirPods Pro']}
                  value={extra.series}
                  onChange={v => setExtraField('series', v)}
                  placeholder="Seleccionar modelo"
                  otherPlaceholder="ej. WF-C700N"
                />
              </div>
            </div>
          )}

          {category === 'vinyls' && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Artista / Banda</label>
                <input value={extra.artist}
                  onChange={e => setExtraField('artist', e.target.value)}
                  placeholder="ej. Michael Jackson" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Género</label>
                  <SelectWithOther
                    options={['Rock','Pop','Jazz','Clásica','Electrónica','Hip-Hop','R&B','Metal','Reggae','Blues']}
                    value={brand}
                    onChange={setBrand}
                    placeholder="Seleccionar género"
                    otherPlaceholder="ej. Bossa Nova"
                  />
                </div>
                <div>
                  <label className={labelClass}>Año de lanzamiento</label>
                  <select value={extra.releaseYear}
                    onChange={e => setExtraField('releaseYear', e.target.value)}
                    className={inputClass}>
                    <option value="">Año</option>
                    {Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Sello discográfico</label>
                <input value={extra.label}
                  onChange={e => setExtraField('label', e.target.value)}
                  placeholder="ej. Epic Records" className={inputClass} />
              </div>
            </div>
          )}

          {category === 'lego' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tema</label>
                  <SelectWithOther
                    options={['CMF','Star Wars','Marvel','DC','Harry Potter','City','Technic','Icons','Creator']}
                    value={extra.theme}
                    onChange={v => setExtraField('theme', v)}
                    placeholder="Seleccionar tema"
                    otherPlaceholder="ej. Ninjago"
                  />
                </div>
                <div>
                  <label className={labelClass}>No. de set</label>
                  <input value={extra.setNumber}
                    onChange={e => setExtraField('setNumber', e.target.value)}
                    placeholder="ej. 71039" className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Serie</label>
                <input value={extra.series}
                  onChange={e => setExtraField('series', e.target.value)}
                  placeholder="ej. CMF Serie 26" className={inputClass} />
              </div>
            </div>
          )}

          {category === 'perfumes' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Casa / Marca</label>
                  <input value={brand} onChange={e => setBrand(e.target.value)}
                    placeholder="ej. Chanel" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Familia olfativa</label>
                  <SelectWithOther
                    options={['Floral','Amaderado','Oriental','Fresco','Cítrico','Acuático','Gourmand','Chipre','Fougère']}
                    value={extra.family}
                    onChange={v => setExtraField('family', v)}
                    placeholder="Seleccionar familia"
                    otherPlaceholder="ej. Especiado"
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Notas / Aroma</label>
                <input value={extra.aroma}
                  onChange={e => setExtraField('aroma', e.target.value)}
                  placeholder="ej. Bergamota, cedro, almizcle" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Concentración</label>
                  <SelectWithOther
                    options={['Parfum','EDP','EDT','EDC','Body Mist']}
                    value={extra.concentration}
                    onChange={v => setExtraField('concentration', v)}
                    placeholder="Seleccionar"
                    otherPlaceholder="ej. Soie de Parfum"
                  />
                </div>
                <div>
                  <label className={labelClass}>Tamaño (ml)</label>
                  <input type="number" min="1" value={extra.sizeMl}
                    onChange={e => setExtraField('sizeMl', e.target.value)}
                    placeholder="ej. 100" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* ── Condición ── */}
          <div>
            <label className={labelClass}>Condición</label>
            <div className="grid grid-cols-5 gap-1.5">
              {conditions.map((c) => (
                <button key={c.value} type="button" onClick={() => setCondition(c.value)}
                  className={cn(
                    'flex flex-col items-center py-2 px-1 rounded-md text-xs font-medium border transition-colors',
                    condition === c.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-accent',
                  )}>
                  <span>{c.label}</span>
                  <span className="opacity-60 text-[10px] mt-0.5 leading-tight text-center">{c.hint}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Fecha ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium">Fecha de adquisición</label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                <input type="checkbox" checked={noDate} onChange={e => setNoDate(e.target.checked)} />
                No recuerdo
              </label>
            </div>
            <div className={cn('grid grid-cols-2 gap-2 transition-opacity', noDate && 'opacity-40 pointer-events-none')}>
              <select value={month} onChange={e => setMonth(e.target.value)} className={inputClass}>
                <option value="">Mes (opcional)</option>
                {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <select value={year} onChange={e => setYear(e.target.value)} className={inputClass}>
                <option value="">Año</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* ── Precio / Valor ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="price">Precio compra</label>
              <input id="price" type="number" min="0" step="0.01" value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="Sin registro" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="estValue">Valor estimado</label>
              <input id="estValue" type="number" min="0" step="0.01" value={estValue}
                onChange={e => setEstValue(e.target.value)}
                placeholder="Sin registro" className={inputClass} />
            </div>
          </div>

          {/* ── Imágenes ── */}
          <div>
            <label className={labelClass}>Imágenes</label>
            <ImageUploader
              previews={allPreviews}
              onAdd={addImages}
              onRemove={removeImage}
            />
          </div>

          {/* ── Notas ── */}
          <div>
            <label className={labelClass} htmlFor="notes">Notas</label>
            <textarea id="notes" rows={2} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Detalles adicionales..."
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
