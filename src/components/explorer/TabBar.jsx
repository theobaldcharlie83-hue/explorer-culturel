import { useNavigate, useLocation } from 'react-router-dom'
import useExplorerStore from '../../store/useExplorerStore'
import './TabBar.css'

const TABS = [
  { path: '/',          icon: '🏠', label: 'Accueil' },
  { path: '/swipe',     icon: '🗺️', label: 'Explorer' },
  { path: '/favorites', icon: '♥',  label: 'Favoris' },
]

export default function TabBar() {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const favCount  = useExplorerStore(s => s.favorites.length)

  return (
    <nav className="tabbar">
      {TABS.map(tab => {
        const active = pathname === tab.path
        const badge  = tab.path === '/favorites' && favCount > 0 ? favCount : 0
        return (
          <button key={tab.path} className={`tabbar__item${active ? ' tabbar__item--on' : ''}`} onClick={() => navigate(tab.path)}>
            <span className="tabbar__icon">
              {tab.icon}
              {badge > 0 && <span className="tabbar__badge">{badge > 99 ? '99+' : badge}</span>}
            </span>
            <span className="tabbar__label">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
