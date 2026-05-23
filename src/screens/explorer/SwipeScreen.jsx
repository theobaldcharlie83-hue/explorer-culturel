import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useExplorerStore, { CATEGORIES } from '../../store/useExplorerStore'
import SwipeCard from '../../components/explorer/SwipeCard'
import TabBar    from '../../components/explorer/TabBar'
import './SwipeScreen.css'

export default function SwipeScreen() {
  const navigate = useNavigate()
  const { activities, currentIndex, isLoading, displayCity, radius,
    selectedCategories, favorites, swipeYes, swipeNo, toggleCategory, reset } = useExplorerStore()

  useEffect(() => {
    if (!isLoading && activities.length === 0) navigate('/', { replace: true })
  }, [activities.length, isLoading, navigate])

  const visible  = activities.slice(currentIndex, currentIndex + 3)
  const isDone   = currentIndex >= activities.length && activities.length > 0
  const progress = activities.length > 0 ? (currentIndex / activities.length) * 100 : 0

  return (
    <div className="swipe">
      <header className="swipe__header">
        <button className="swipe__back" onClick={() => navigate('/')} aria-label="Retour">←</button>
        <div className="swipe__loc">
          <span className="swipe__city">{displayCity || 'Explorer'}</span>
          <span className="swipe__radius">📍 {radius} km</span>
        </div>
        <button className="swipe__fav" onClick={() => navigate('/favorites')} aria-label="Favoris">
          ♥{favorites.length > 0 && <span className="swipe__fav-n">{favorites.length}</span>}
        </button>
      </header>

      <div className="swipe__cats">
        {Object.entries(CATEGORIES).map(([key, cat]) => (
          <button key={key} className={`swipe__cat${selectedCategories.includes(key) ? ' swipe__cat--on' : ''}`}
            onClick={() => toggleCategory(key)} title={cat.label} aria-pressed={selectedCategories.includes(key)}>
            {cat.emoji}
          </button>
        ))}
      </div>

      <div className="swipe__prog-track">
        <div className="swipe__prog-fill" style={{ width: `${progress}%` }} />
      </div>
      <p className="swipe__count">{currentIndex} / {activities.length} activités</p>

      <div className="swipe__stage">
        {isLoading ? (
          <div className="swipe__state">
            <div className="swipe__spinner" />
            <p>Recherche des activités…</p>
          </div>
        ) : isDone ? (
          <div className="swipe__state">
            <span className="swipe__done-ico">🎉</span>
            <h2>Tout vu !</h2>
            <p>Vous avez parcouru toutes les activités.</p>
            {favorites.length > 0 && <p><strong>{favorites.length}</strong> favori{favorites.length > 1 ? 's' : ''} enregistré{favorites.length > 1 ? 's' : ''} 🎊</p>}
            <div className="swipe__done-btns">
              <button className="btn-p" onClick={() => navigate('/favorites')}>♥ Voir mes favoris</button>
              <button className="btn-s" onClick={() => { reset(); navigate('/') }}>🔄 Nouvelle recherche</button>
            </div>
          </div>
        ) : (
          <div className="swipe__stack">
            {visible.map((activity, i) => (
              <SwipeCard key={activity.id} activity={activity} stackIndex={i} isTop={i === 0}
                onSwipeLeft={swipeYes}   /* ← gauche = OUI */
                onSwipeRight={swipeNo}   /* → droite = NON */
              />
            ))}
          </div>
        )}
      </div>

      <TabBar />
    </div>
  )
}
