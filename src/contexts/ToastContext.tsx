import { createContext, useContext, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS   = { success: CheckCircle, error: AlertCircle, info: Info }
const STYLES  = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error:   'border-red-200 bg-red-50 text-red-800',
  info:    'border-blue-200 bg-blue-50 text-blue-800',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => {
            const Icon = ICONS[t.type]
            return (
              <div
                key={t.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium',
                  'pointer-events-auto animate-toast-in',
                  STYLES[t.type],
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span>{t.message}</span>
                <button onClick={() => remove(t.id)} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
