import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Heart, BarChart2, LogOut, Sun, Moon, Tag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import LogoBanner from '@/components/LogoBanner'

const navItems = [
  { to: '/collection', label: 'Colección',    short: 'Colección', icon: LayoutGrid },
  { to: '/wishlist',   label: 'Wishlist',      short: 'Wishlist',  icon: Heart },
  { to: '/ventas',     label: 'Ventas',        short: 'Ventas',    icon: Tag },
  { to: '/stats',      label: 'Estadísticas',  short: 'Stats',     icon: BarChart2 },
]

function getInitialDark(): boolean {
  const stored = localStorage.getItem('theme')
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(getInitialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo banner (icono + título en un solo SVG) */}
        <LogoBanner className="h-10 w-auto shrink-0 text-blue-600 dark:text-blue-400" />

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Nav — solo visible en desktop (lg+) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 lg:border-l lg:pl-4">
            <button
              onClick={() => setIsDark(d => !d)}
              className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user?.email && (
              <div
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 select-none"
                title={user.email}
              >
                {user.email[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal — pb-20 deja espacio para el bottom nav en móvil/tablet */}
      <main className="flex-1 p-4 sm:p-6 pb-28 lg:pb-6">
        <Outlet />
      </main>

      {/* Bottom nav — móvil y tablet (< lg) */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex h-16">
          {navItems.map(({ to, short, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn('p-1 rounded-lg transition-colors', isActive && 'bg-primary/10')}>
                    <Icon size={20} />
                  </div>
                  <span>{short}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
