import { useState, useRef, useEffect } from 'react'
import { CATEGORIES } from '../../store/useExplorerStore'
import './SwipeCard.css'

const THRESHOLD = 90

export default function SwipeCard({ activity, stackIndex, isTop, onSwipeLeft, onSwipeRight }) {
  const [offset, setOffset]     = useState(0)
  const [isDragging, setIsDrag] = useState(false)
  const [exitDir, setExitDir]   = useState(null)
  const startX = useRef(0)
  const config = CATEGORIES[activity.category] || CATEGORIES.museum

  const startDrag = (x) => { if (!isTop || exitDir) return; startX.current = x; setIsDrag(true) }
  const moveDrag  = (x) => { if (!isDragging) return; setOffset(x - startX.current) }
  const endDrag   = () => {
    if (!isDragging) return
    setIsDrag(false)
    if      (offset < -THRESHOLD) { setExitDir('left');  setTimeout(onSwipeLeft,  320) }
    else if (offset >  THRESHOLD) { setExitDir('right'); setTimeout(onSwipeRight, 320) }
    else setOffset(0)
  }

  useEffect(() => {
    if (!isDragging) return
    const mm = (e) => moveDrag(e.clientX)
    const mu = () => endDrag()
    window.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', mu)
    return () => { window.removeEventListener('mousemove', mm); window.removeEventListener('mouseup', mu) }
  })

  const onMouseDown  = (e) => { if (e.target.closest('button,a')) return; e.preventDefault(); startDrag(e.clientX) }
  const onTouchStart = (e) => { if (e.target.closest('button,a')) return; startDrag(e.touches[0].clientX) }
  const onTouchMove  = (e) => { if (!isDragging) return; e.preventDefault(); setOffset(e.touches[0].clientX - startX.current) }
  const onTouchEnd   = () => endDrag()

  const triggerLeft  = (e) => { e.stopPropagation(); if (exitDir) return; setExitDir('left');  setTimeout(onSwipeLeft,  320) }
  const triggerRight = (e) => { e.stopPropagation(); if (exitDir) return; setExitDir('right'); setTimeout(onSwipeRight, 320) }

  const rot        = offset * 0.07
  const ouiOpacity = Math.min(Math.max((-offset - 20) / 80, 0), 1)
  const nonOpacity = Math.min(Math.max(( offset - 20) / 80, 0), 1)

  let transform
  if      (exitDir === 'left')  transform = 'translateX(-130vw) rotate(-25deg)'
  else if (exitDir === 'right') transform = 'translateX(130vw) rotate(25deg)'
  else if (!isTop)              transform = `scale(${1 - stackIndex * 0.04}) translateY(${stackIndex * 14}px)`
  else                          transform = `translateX(${offset}px) rotate(${rot}deg)`

  const transition = isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)'

  return (
    <div
      className={`sc${isTop ? ' sc--top' : ''}`}
      style={{ transform, transition, zIndex: 10 - stackIndex }}
      onMouseDown={isTop ? onMouseDown : undefined}
      onTouchStart={isTop ? onTouchStart : undefined}
      onTouchMove={isTop ? onTouchMove : undefined}
      onTouchEnd={isTop ? onTouchEnd : undefined}
    >
      {isTop && (
        <>
          <div className="sc-overlay sc-overlay--oui" style={{ opacity: ouiOpacity }}>♥ OUI</div>
          <div className="sc-overlay sc-overlay--non" style={{ opacity: nonOpacity }}>✕ NON</div>
        </>
      )}

      <div className="sc__hero" style={{ background: config.gradient }}>
        <span className="sc__emoji" role="img" aria-hidden="true">{config.emoji}</span>
        <span className="sc__cat">{config.label}</span>
      </div>

      <div className="sc__body">
        <h2 className="sc__name">{activity.name}</h2>
        <div className="sc__meta">
          {activity.distance    && <span>📍 {activity.distance}</span>}
          {activity.openingHours && <span>🕒 {activity.openingHours}</span>}
        </div>
        {activity.description && <p className="sc__desc">{activity.description}</p>}
        {activity.address     && <p className="sc__addr">{activity.address}</p>}
      </div>

      {isTop && (
        <div className="sc__actions">
          <button className="sc__btn sc__btn--oui" onClick={triggerLeft}  onMouseDown={e => e.stopPropagation()} aria-label="J'aime">
            <span>♥</span><small>OUI</small>
          </button>
          <button className="sc__btn sc__btn--non" onClick={triggerRight} onMouseDown={e => e.stopPropagation()} aria-label="Pas intéressé">
            <span>✕</span><small>NON</small>
          </button>
        </div>
      )}
    </div>
  )
}
