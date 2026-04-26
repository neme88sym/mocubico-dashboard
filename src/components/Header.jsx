export default function Header({ projectCount, onNew }) {
  return (
    <header style={{
      backgroundColor: 'rgba(15,15,26,0.85)',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Contatore — nascosto su schermi piccoli */}
          <div className="header-count" style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#e8e8f0', lineHeight: 1 }}>
              {projectCount}
            </div>
            <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>Progetti</div>
          </div>

          {/* Nuovo progetto */}
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
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuovo
          </button>
        </div>
      </div>
    </header>
  )
}
