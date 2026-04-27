import { useRef, useEffect } from 'react'

export function useSwipeDown(onClose: () => void, threshold = 72) {
  const startY     = useRef<number | null>(null)
  const panelRef   = useRef<HTMLDivElement>(null)
  const handleRef  = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose  // siempre fresco sin añadir al dep array

  // Sin deps array → corre después de cada render hasta que los refs estén poblados.
  // Necesario porque el panel se monta condicionalmente (item !== null / open === true).
  useEffect(() => {
    const handle = handleRef.current
    const panel  = panelRef.current
    if (!handle || !panel) return

    // Captura non-null para que TypeScript lo reconozca dentro de los closures
    const p = panel

    function onTouchStart(e: TouchEvent) {
      startY.current = e.touches[0].clientY
    }

    function onTouchMove(e: TouchEvent) {
      if (startY.current === null) return
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0) return
      e.preventDefault()  // evita scroll del fondo — solo funciona con passive:false
      p.style.transform  = `translateY(${dy}px)`
      p.style.transition = 'none'
    }

    function onTouchEnd(e: TouchEvent) {
      if (startY.current === null) return
      const dy = e.changedTouches[0].clientY - startY.current
      startY.current = null
      if (dy > threshold) {
        p.style.transform  = ''
        p.style.transition = ''
        onCloseRef.current()
      } else {
        p.style.transition = 'transform 0.22s ease'
        p.style.transform  = ''
      }
    }

    handle.addEventListener('touchstart', onTouchStart, { passive: true })
    handle.addEventListener('touchmove',  onTouchMove,  { passive: false })  // clave
    handle.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      handle.removeEventListener('touchstart', onTouchStart)
      handle.removeEventListener('touchmove',  onTouchMove)
      handle.removeEventListener('touchend',   onTouchEnd)
    }
  })  // sin []

  return { panelRef, handleRef }
}
