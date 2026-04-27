import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSwipeX } from '@/hooks/useSwipeX'
import { cn } from '@/lib/utils'

interface Props {
  images: string[]
  initialIndex?: number
  onClose: () => void
}

export default function ImageLightbox({ images, initialIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex)

  function goPrev() { setCurrent(i => Math.max(0, i - 1)) }
  function goNext() { setCurrent(i => Math.min(images.length - 1, i + 1)) }

  const swipeRef = useSwipeX(goPrev, goNext)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Cerrar */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        onClick={onClose}
      >
        <X size={22} />
      </button>

      {/* Área de imagen con swipe */}
      <div
        ref={swipeRef}
        className="flex items-center justify-center w-full h-full select-none"
        style={{ WebkitTouchCallout: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt=""
          className="max-w-[92vw] max-h-[85vh] object-contain rounded-lg pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Flechas de navegación */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); goPrev() }}
            disabled={current === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors z-10"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); goNext() }}
            disabled={current === images.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 transition-colors z-10"
          >
            <ChevronRight size={28} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 flex gap-2 z-10" onClick={e => e.stopPropagation()}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  i === current ? 'bg-white' : 'bg-white/35 hover:bg-white/60',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
