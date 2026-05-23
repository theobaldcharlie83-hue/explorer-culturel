import { Routes, Route, Navigate } from 'react-router-dom'
import ExplorerHome    from './screens/explorer/ExplorerHome'
import SwipeScreen     from './screens/explorer/SwipeScreen'
import FavoritesScreen from './screens/explorer/FavoritesScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<ExplorerHome />} />
      <Route path="/swipe"      element={<SwipeScreen />} />
      <Route path="/favorites"  element={<FavoritesScreen />} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  )
}
