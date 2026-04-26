import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

function FullPageSpinner() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#0a0a0f',
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0077ff" strokeWidth="2"
        style={{ animation: 'spin 0.9s linear infinite' }}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
      </svg>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <FullPageSpinner />
  if (!user)   return <Navigate to="/login" replace />
  return children
}
