import { SOFTWARE_CONFIG, STATUS, ALL_FILTER } from '../data/projects'

const softwareFilters = [ALL_FILTER, ...Object.keys(SOFTWARE_CONFIG)]
const statusFilters   = [ALL_FILTER, ...Object.values(STATUS)]

const statusColors = {
  [STATUS.RENDERING]: '#f59e0b',
  [STATUS.CONCLUSO]:  '#10b981',
  [STATUS.REVISIONE]: '#ec4899',
  [STATUS.PAUSA]:     '#6366f1',
  [STATUS.BRIEF]:     '#3b82f6',
}

export default function FilterBar({ softwareFilter, setSoftwareFilter, statusFilter, setStatusFilter, search, setSearch }) {
  return (
    <div style={{ backgroundColor: 'rgba(15,15,26,0.7)', borderBottom: '1px solid #1e1e30', padding: '10px 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <div className="filter-scroll">
          {/* Ricerca */}
          <div style={{ position: 'relative', flex: '0 0 auto', width: '200px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#44445a" strokeWidth="2"
              style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Cerca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(19,19,31,0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
                padding: '7px 11px 7px 32px',
                color: '#e8e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ width: '1px', height: '22px', backgroundColor: '#1e1e30', flexShrink: 0 }} />

          {/* Software */}
          <div className="filter-pill-group">
            {softwareFilters.map((f) => {
              const color = SOFTWARE_CONFIG[f]?.color
              return (
                <FilterPill key={f} label={f === ALL_FILTER ? 'Tutti' : (SOFTWARE_CONFIG[f]?.short ?? f)}
                  active={softwareFilter === f} onClick={() => setSoftwareFilter(f)} color={color} />
              )
            })}
          </div>

          <div style={{ width: '1px', height: '22px', backgroundColor: '#1e1e30', flexShrink: 0 }} />

          {/* Stato */}
          <div className="filter-pill-group">
            {statusFilters.map((f) => (
              <FilterPill key={f} label={f} active={statusFilter === f}
                onClick={() => setStatusFilter(f)} color={statusColors[f]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterPill({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 11px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
        cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
        border:           active ? `1px solid ${color || '#7b2fff'}` : '1px solid rgba(255,255,255,0.07)',
        backgroundColor:  active ? `${(color || '#7b2fff')}22` : 'rgba(19,19,31,0.8)',
        color:            active ? (color || '#9999ff') : '#8888aa',
        transition: 'all 0.15s',
        display: 'flex', alignItems: 'center', gap: '4px',
        flexShrink: 0,
      }}
    >
      {active && color && (
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      )}
      {label}
    </button>
  )
}
