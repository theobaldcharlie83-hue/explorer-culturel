import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useExplorerStore, { CATEGORIES } from '../../store/useExplorerStore'
import { geocodeCity, reverseGeocode } from '../../services/geocodingService'
import { fetchActivities } from '../../services/overpassService'
import { MOCK_ACTIVITIES } from '../../services/mockData'
import './ExplorerHome.css'

export default function ExplorerHome() {
  const navigate = useNavigate()
  const { city, setCity, setDisplayCity, setCoordinates, radius, setRadius,
    selectedCategories, toggleCategory, loadActivities, setLoading, setError,
    isLoading, favorites } = useExplorerStore()

  const [localCity,   setLocalCity]   = useState(city)
  const [localCoords, setLocalCoords] = useState(null)
  const [locating,    setLocating]    = useState(false)
  const [fieldErr,    setFieldErr]    = useState(null)

  const handleGPS = () => {
    if (!navigator.geolocation) { setFieldErr('Géolocalisation non supportée'); return }
    setLocating(true); setFieldErr(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude }
        setLocalCoords(pos)
        try { setLocalCity(await reverseGeocode(pos.lat, pos.lng)) } catch { setLocalCity('Ma position') }
        setLocating(false)
      },
      () => { setFieldErr('Position indisponible'); setLocating(false) },
      { timeout: 10000 }
    )
  }

  const handleDiscover = async () => {
    if (!localCity.trim() && !localCoords) { setFieldErr('Entrez une ville ou utilisez le GPS'); return }
    if (!selectedCategories.length) { setFieldErr('Sélectionnez au moins une catégorie'); return }
    setFieldErr(null); setLoading(true); setError(null)
    try {
      let coords, displayName
      if (localCoords) {
        coords = localCoords; displayName = localCity || 'Ma position'
      } else {
        const geo = await geocodeCity(localCity)
        coords = { lat: geo.lat, lng: geo.lng }; displayName = geo.displayName
      }
      setCoordinates(coords); setCity(localCity); setDisplayCity(displayName)

      let activities
      try {
        activities = await fetchActivities(coords.lat, coords.lng, radius, selectedCategories)
        if (activities.length < 3) throw new Error('Résultats insuffisants')
      } catch {
        activities = MOCK_ACTIVITIES.filter(a => selectedCategories.includes(a.category))
      }
      loadActivities(activities)
      navigate('/swipe')
    } catch (err) {
      setFieldErr(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const fillPct = `${((radius - 0.5) / 19.5) * 100}%`

  return (
    <div className="home">
      <div className="home__blob" aria-hidden="true" />

      <header className="home__header">
        <div className="home__icon">🗺️</div>
        <h1>Explorer</h1>
        <p>Découvrez les activités<br />culturelles autour de vous</p>
      </header>

      <main className="home__main">
        {/* Ville */}
        <div className="field">
          <label className="field__label">Ville</label>
          <div className="field__row">
            <input className={`field__input${fieldErr ? ' field__input--err' : ''}`}
              type="text" placeholder="Paris, Lyon, Bordeaux…"
              value={localCity}
              onChange={e => { setLocalCity(e.target.value); setLocalCoords(null); setFieldErr(null) }}
              onKeyDown={e => e.key === 'Enter' && handleDiscover()} />
            <button className="field__gps" onClick={handleGPS} disabled={locating} aria-label="Position GPS">
              {locating ? <span className="spin-sm" /> : '📍'}
            </button>
          </div>
          {fieldErr && <p className="field__err">{fieldErr}</p>}
        </div>

        {/* Rayon */}
        <div className="field">
          <label className="field__label">Rayon : <strong>{radius} km</strong></label>
          <input className="field__slider" type="range" min="0.5" max="20" step="0.5" value={radius}
            onChange={e => setRadius(parseFloat(e.target.value))}
            style={{ background: `linear-gradient(to right,#5b4cf5 ${fillPct},#e2e4f2 ${fillPct})` }} />
          <div className="field__slider-labels"><span>0.5 km</span><span>20 km</span></div>
        </div>

        {/* Catégories */}
        <div className="field">
          <label className="field__label">Catégories</label>
          <div className="cats">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button key={key} className={`cat-chip${selectedCategories.includes(key) ? ' cat-chip--on' : ''}`}
                onClick={() => toggleCategory(key)}>
                <span>{cat.emoji}</span><span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <footer className="home__footer">
        <button className="btn-discover" onClick={handleDiscover} disabled={isLoading}>
          {isLoading ? <span className="spin" /> : '🔍 Découvrir'}
        </button>
        {favorites.length > 0 && (
          <button className="btn-favs" onClick={() => navigate('/favorites')}>
            ♥ Mes favoris ({favorites.length})
          </button>
        )}
      </footer>

      <div className="home__version">v1 · Lucas V.</div>
    </div>
  )
}
