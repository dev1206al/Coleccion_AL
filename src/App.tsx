import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import SplashScreen from '@/components/SplashScreen'
import CollectionPage from '@/pages/CollectionPage'
import WishlistPage from '@/pages/WishlistPage'
import LoginPage from '@/pages/LoginPage'

const StatsPage  = lazy(() => import('@/pages/StatsPage'))
const VentasPage = lazy(() => import('@/pages/VentasPage'))

const Spinner = (
  <div className="flex justify-center py-24">
    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function App() {
  return (
    <>
    <SplashScreen />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/collection" replace />} />
        <Route path="collection" element={<CollectionPage />} />
        <Route path="wishlist"   element={<WishlistPage />} />
        <Route path="ventas"     element={<Suspense fallback={Spinner}><VentasPage /></Suspense>} />
        <Route path="stats"      element={<Suspense fallback={Spinner}><StatsPage /></Suspense>} />
      </Route>
    </Routes>
    </>
  )
}
