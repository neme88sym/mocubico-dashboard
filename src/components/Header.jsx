import { useAuth } from '../lib/AuthContext'

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function Header({ projectCount, onNew }) {
  const { user, isAdmin, loading: authLoading, logout } = useAuth()

  const email = user?.email ?? ''
  const shortEmail = email.length > 22 ? email.slice(0, 20) + '…' : email

  return (
    <header style={{
      backgroundColor: 'rgba(15,15,26,0.88)',
      borderBottom: '1px solid #1e1e30',
      position: 'sticky', top: 0, zIndex: 50,
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '0 24px',
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #0077ff 0%, #60b0ff 100%)',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '14px', color: '#fff', letterSpacing: '-0.5px',
          }}>
            MC
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#e8e8f0', letterSpacing: '-0.3px' }}>
              MoCubico
            </div>
            <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '-2px' }}>Studio Dashboard</div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Email utente */}
          {user && (
            <span className="header-email" style={{
              fontSize: '12px', color: '#44445a',
              maxWidth: '180px', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {shortEmail}
            </span>
          )}

          {/* Logout */}
          {user && (
            <button
              onClick={logout}
              title="Logout"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#8888aa',
                cursor: 'pointer',
                transition: 'background-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'
                e.currentTarget.style.color = '#f87171'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.color = '#8888aa'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              }}
            >
              <LogoutIcon />
            </button>
          )}

          {/* Contatore — nascosto su schermi piccoli */}
          <div className="header-count" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#e8e8f0', lineHeight: 1 }}>
              {projectCount}
            </div>
            <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>Progetti</div>
          </div>

          {/* Nuovo progetto — solo admin, nascosto durante caricamento auth */}
          {!authLoading && isAdmin && (
            <button
              onClick={onNew}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                height: '36px', padding: '0 14px',
                background: 'linear-gradient(135deg, #0077ff 0%, #60b0ff 100%)',
                border: 'none', borderRadius: '9px',
                color: '#fff', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(0,119,255,0.35)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuovo
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
