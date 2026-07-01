import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const HomeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const MapIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
const PlusIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
const CoinIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9.5 9.5C9.5 8.1 10.6 7 12 7s2.5 1.1 2.5 2.5c0 2.5-5 2.5-5 5C9.5 16 10.6 17 12 17s2.5-1.1 2.5-2.5"/></svg>
const StoreIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-6h16l1 6"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/><path d="M5 9v11h14V9"/></svg>
const TruckIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>

export default function BottomNav() {
  const { user, profile } = useAuth()
  if (!user) return null

  if (profile?.rol === 'conductor') {
    return (
      <nav className="bottom-nav">
        <NavLink to="/conductor" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <TruckIcon /><span>Panel</span>
        </NavLink>
        <NavLink to="/mapa" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          <MapIcon /><span>Mapa</span>
        </NavLink>
      </nav>
    )
  }

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <HomeIcon /><span>Inicio</span>
      </NavLink>
      <NavLink to="/mapa" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <MapIcon /><span>Mapa</span>
      </NavLink>
      <NavLink to="/registrar" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <PlusIcon /><span>Donar</span>
      </NavLink>
      <NavLink to="/creditos" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <CoinIcon /><span>Créditos</span>
      </NavLink>
      <NavLink to="/comercios" className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
        <StoreIcon /><span>Comercios</span>
      </NavLink>
    </nav>
  )
}
