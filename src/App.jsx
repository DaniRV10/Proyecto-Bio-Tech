import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import BottomNav from './components/BottomNav'
import AuthPage from './pages/AuthPage'
import HomePage from './pages/HomePage'
import MapaPage from './pages/MapaPage'
import RegistrarPage from './pages/RegistrarPage'
import CreditosPage from './pages/CreditosPage'
import ComerciosPage from './pages/ComerciosPage'
import ConductorPage from './pages/ConductorPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}><div className="spinner" /></div>
  if (!user) return <Navigate to="/auth" replace />
  return children
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 16 }}>
      <div style={{ fontSize: 40 }}>🌿</div>
      <div className="spinner" />
    </div>
  )

  const esConductor = profile?.rol === 'conductor'

  return (
    <div className="app-layout">
      <Routes>
        <Route path="/auth" element={user ? <Navigate to={esConductor ? '/conductor' : '/'} replace /> : <AuthPage />} />
        <Route path="/" element={<ProtectedRoute>{esConductor ? <Navigate to="/conductor" replace /> : <HomePage />}</ProtectedRoute>} />
        <Route path="/conductor" element={<ProtectedRoute><ConductorPage /></ProtectedRoute>} />
        <Route path="/mapa" element={<ProtectedRoute><MapaPage /></ProtectedRoute>} />
        <Route path="/registrar" element={<ProtectedRoute><RegistrarPage /></ProtectedRoute>} />
        <Route path="/creditos" element={<ProtectedRoute><CreditosPage /></ProtectedRoute>} />
        <Route path="/comercios" element={<ProtectedRoute><ComerciosPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? (esConductor ? '/conductor' : '/') : '/auth'} replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
