import { useEffect, useState } from 'react'
import LogoBanner from '@/components/LogoBanner'
import { useAuth } from '@/contexts/AuthContext'

export default function SplashScreen() {
  const { loading } = useAuth()
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (!loading) {
      setFading(true)
      const t = setTimeout(() => setVisible(false), 320)
      return () => clearTimeout(t)
    }
  }, [loading])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <LogoBanner className="w-3/5 max-w-xs text-blue-600 dark:text-blue-400" />
    </div>
  )
}
