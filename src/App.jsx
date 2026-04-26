import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import Header from './components/Header'
import FilterBar from './components/FilterBar'
import ProjectCard from './components/ProjectCard'
import AmbientOrbs from './components/AmbientOrbs'
import NewProjectModal from './components/NewProjectModal'
import { useAuth } from './lib/AuthContext'
import { ALL_FILTER, STATUS } from './data/projects'
import { fetchProjects } from './lib/projectsApi'

const STATUS_ORDER = {
  [STATUS.RENDERING]: 0,
  [STATUS.REVISIONE]: 1,
  [STATUS.BRIEF]:     2,
  [STATUS.PAUSA]:     3,
  [STATUS.CONCLUSO]:  4,
}

const STATUS_COLORS = {
  [STATUS.RENDERING]: '#f59e0b',
  [STATUS.CONCLUSO]:  '#10b981',
  [STATUS.REVISIONE]: '#ec4899',
  [STATUS.PAUSA]:     '#6366f1',
  [STATUS.BRIEF]:     '#3b82f6',
}

const CARD_VARIANTS = {
  hidden:  { opacity: 0, y: 18, scale: 0.94 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.32, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, scale: 0.9, y: -6, transition: { duration: 0.15, ease: 'easeIn' } },
}

/* ── Skeleton card ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="glass-card" style={{
      backgroundColor: 'rgba(16,14,28,0.55)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '14px', overflow: 'hidden',
    }}>
      <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: 'rgba(255,255,255,0.04)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.05) 50%,transparent 100%)', animation: 'shimmer 1.6s infinite' }} />
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ height: '14px', width: '68%', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div style={{ height: '11px', width: '44%', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div style={{ height: '22px', width: '92px', borderRadius: '20px', backgroundColor: 'rgba(255,255,255,0.04)', marginTop: '6px' }} />
      </div>
    </div>
  )
}

/* ── Stats bar ────────────────────────────────────────────── */
function StatsBar({ projects: list }) {
  const counts = useMemo(() => {
    const c = {}
    list.forEach((p) => { c[p.status] = (c[p.status] || 0) + 1 })
    return c
  }, [list])

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '18px 24px 0', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {Object.entries(counts).map(([status, count]) => (
        <div key={status} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          backgroundColor: 'rgba(19,19,31,0.55)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          border: `1px solid ${STATUS_COLORS[status]}28`,
          borderRadius: '8px', padding: '5px 11px', fontSize: '12px',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: STATUS_COLORS[status], boxShadow: `0 0 6px ${STATUS_COLORS[status]}99`, flexShrink: 0 }} />
          <span style={{ color: '#8888aa' }}>{status}</span>
          <span style={{ color: STATUS_COLORS[status], fontWeight: 700 }}>{count}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Main app ─────────────────────────────────────────────── */
export default function App() {
  const { isAdmin } = useAuth()

  const [softwareFilter, setSoftwareFilter] = useState(ALL_FILTER)
  const [statusFilter,   setStatusFilter]   = useState(ALL_FILTER)
  const [search,         setSearch]         = useState('')
  const [showModal,      setShowModal]      = useState(false)

  const [allProjects, setAllProjects] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    let cancelled = false
    fetchProjects()
      .then((data) => { if (!cancelled) { setAllProjects(data); setLoading(false) } })
      .catch((err)  => { if (!cancelled) { setError(err.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const handleStatusChange = useCallback((id, newStatus) => {
    setAllProjects(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
  }, [])

  const handleDelete = useCallback((id) => {
    setAllProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const handleProjectCreated = useCallback((newProject) => {
    setAllProjects(prev => [newProject, ...prev])
  }, [])

  const filtered = useMemo(() => {
    return allProjects
      .filter((p) => {
        const swArray  = Array.isArray(p.software) ? p.software : [p.software].filter(Boolean)
        const matchSW  = softwareFilter === ALL_FILTER || swArray.includes(softwareFilter)
        const matchSt  = statusFilter   === ALL_FILTER || p.status === statusFilter
        const q        = search.toLowerCase()
        const matchSq  = !q ||
          p.title.toLowerCase().includes(q) ||
          p.client.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q))
        return matchSW && matchSt && matchSq
      })
      .sort((a, b) => (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99))
  }, [allProjects, softwareFilter, statusFilter, search])

  const hasActiveFilter = softwareFilter !== ALL_FILTER || statusFilter !== ALL_FILTER || search

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <AmbientOrbs softwareFilter={softwareFilter} />

      <Header
        projectCount={loading ? '—' : allProjects.length}
        onNew={() => setShowModal(true)}
      />
      <FilterBar
        softwareFilter={softwareFilter} setSoftwareFilter={setSoftwareFilter}
        statusFilter={statusFilter}     setStatusFilter={setStatusFilter}
        search={search}                 setSearch={setSearch}
      />

      <main>
        {!loading && <StatsBar projects={filtered} />}

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '18px 24px 56px' }}>

          {/* Errore */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.30)',
              borderRadius: '12px', padding: '20px 24px', color: '#fca5a5', fontSize: '13px',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Errore di connessione al database</div>
                <div style={{ color: '#f87171', opacity: 0.8 }}>{error}</div>
              </div>
            </div>
          )}

          {/* Skeleton caricamento */}
          {loading && !error && (
            <div className="projects-grid">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Griglia progetti */}
          {!loading && !error && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <span style={{ fontSize: '13px', color: '#8888aa' }}>
                  {filtered.length === allProjects.length
                    ? `${allProjects.length} progetti`
                    : `${filtered.length} di ${allProjects.length} progetti`}
                </span>
                {hasActiveFilter && (
                  <button
                    onClick={() => { setSoftwareFilter(ALL_FILTER); setStatusFilter(ALL_FILTER); setSearch('') }}
                    style={{ fontSize: '12px', color: '#60b0ff', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', textDecoration: 'underline', fontFamily: 'inherit' }}
                  >
                    Rimuovi filtri
                  </button>
                )}
              </div>

              {filtered.length > 0 ? (
                <div className="projects-grid">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((project, i) => (
                      <motion.div
                        key={project.id}
                        variants={CARD_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        custom={i}
                        layout
                        style={{ overflow: 'visible' }}
                      >
                        <ProjectCard
                          project={project}
                          isAdmin={isAdmin}
                          onDelete={handleDelete}
                          onStatusChange={handleStatusChange}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#44445a' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2a2a45" strokeWidth="1.5"
                    style={{ margin: '0 auto 16px', display: 'block' }}>
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  <p style={{ fontSize: '14px', margin: 0 }}>Nessun progetto trovato</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal nuovo progetto — solo admin */}
      {isAdmin && showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  )
}
