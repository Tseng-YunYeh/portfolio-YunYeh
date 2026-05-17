import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { utilisateur } = useAuth()
  if (!utilisateur || utilisateur.estAdmin !== true) return <Navigate to="/" replace />
  return children
}
