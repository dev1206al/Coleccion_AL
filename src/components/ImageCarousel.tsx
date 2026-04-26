import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
  alt?: string
  className?: string
}

export default function ImageCarousel({ images, alt = '', className }: Props) {
  const [index, setIndex] = useState(0)

  if (images.length === 0) return null

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setIndex(i => (i - 1 + images.length) % images.length)
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setIndex(i => (i + 1) % images.length)
  }

  return (
    <div className={cn('relative w-full h-full group', className)}>
      <img
        src={images[index]}
        alt={alt}
        className="w-full h-full object-contain p-2"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={14} className="text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={14} className="text-white" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setIndex(i) }}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  i === index ? 'bg-white' : 'bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
