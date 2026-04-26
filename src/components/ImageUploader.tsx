import { useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX = 3

interface Props {
  previews: string[]       // object URLs locales
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
}

export default function ImageUploader({ previews, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const remaining = MAX - previews.length
    onAdd(files.slice(0, remaining))
    e.target.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border group shrink-0">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} className="text-white" />
            </button>
          </div>
        ))}

        {previews.length < MAX && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              'w-20 h-20 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1',
              'text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0',
            )}
          >
            <ImagePlus size={20} />
            <span className="text-[10px]">{previews.length === 0 ? 'Agregar' : 'Más'}</span>
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Máximo {MAX} imágenes · JPG, PNG, WEBP
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  )
}
