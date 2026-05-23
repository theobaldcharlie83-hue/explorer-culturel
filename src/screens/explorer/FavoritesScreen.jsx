import { useNavigate } from 'react-router-dom'
import useExplorerStore, { CATEGORIES } from '../../store/useExplorerStore'
import TabBar from '../../components/explorer/TabBar'
import './FavoritesScreen.css'

export default function FavoritesScreen() {
  const navigate = useNavigate()
  const { favorites, removeFavorite } = useExplorerStore()

  const grouped = Object.keys(CATEGORIES).reduce((acc, key) => {
    const items = favorites.filter(f => f.category === key)
    if (items.length) acc[key] = items
    return acc
  }, {})

  return (
    <div className="favs">
      <header className="favs__header">
        <button className="favs__back" onClick={() => navigate(-1)} aria-label="Retour">←</button>
        <h1>Mes Favoris</h1>
        <span className="favs__badge">{favorites.length}</span>
      </header>

      <div className="favs__content">
        {!favorites.length ? (
          <div className="favs__empty">
            <span>💭</span>
            <h2>Aucun favori pour l'instant</h2>
            <p>Swipez <strong>à gauche</strong> sur les activités qui vous plaisent pour les retrouver ici.</p>
            <button className="btn-p" onClick={() => navigate('/swipe')}>🗺️ Explorer maintenant</button>
          </div>
        ) : Object.entries(grouped).map(([catKey, items]) => {
          const cat = CATEGORIES[catKey]
          return (
            <section key={catKey} className="fav-group">
              <h2 className="fav-group__title">
                <span>{cat.emoji}</span><span>{cat.label}</span>
                <span className="fav-group__count">{items.length}</span>
              </h2>
              <div className="fav-group__list">
                {items.map(a => <FavCard key={a.id} activity={a} cat={cat} onRemove={() => removeFavorite(a.id)} />)}
              </div>
            </section>
          )
        })}
      </div>

      <TabBar />
    </div>
  )
}

function FavCard({ activity, cat, onRemove }) {
  const mapsUrl = activity.lat && activity.lng
    ? `https://www.google.com/maps/search/?api=1&query=${activity.lat},${activity.lng}` : null
  return (
    <article className="fav-card">
      <div className="fav-card__thumb" style={{ background: cat.gradient }}><span>{cat.emoji}</span></div>
      <div className="fav-card__info">
        <h3 className="fav-card__name">{activity.name}</h3>
        <div className="fav-card__meta">
          {activity.distance     && <span>📍 {activity.distance}</span>}
          {activity.openingHours && <span>🕒 {activity.openingHours}</span>}
        </div>
        {activity.description && <p className="fav-card__desc">{activity.description}</p>}
        <div className="fav-card__links">
          {activity.website && <a href={activity.website} target="_blank" rel="noopener noreferrer" className="fav-link">🌐 Site web</a>}
          {mapsUrl           && <a href={mapsUrl}          target="_blank" rel="noopener noreferrer" className="fav-link">🗺️ Maps</a>}
        </div>
      </div>
      <button className="fav-card__del" onClick={onRemove} aria-label="Supprimer">×</button>
    </article>
  )
}
