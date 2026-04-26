import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fetchProjectById } from '../lib/projectsApi'
import { SOFTWARE_CONFIG } from '../data/projects'
import AmbientOrbs from '../components/AmbientOrbs'

const STATUS_CONFIG = {
  'Rendering':  { color: '#f59e0b', dot: true },
  'Concluso':   { color: '#10b981', dot: false },
  'Revisione':  { color: '#ec4899', dot: false },
  'In Pausa':   { color: '#6366f1', dot: false },
  'In Brief':   { color: '#3b82f6', dot: false },
}

function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
}

function SoftwareBadge({ sw }) {
  const cfg = SOFTWARE_CONFIG[sw] || { short: sw.slice(0,3), color: '#8888aa' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 10px', borderRadius: '6px',
      backgroundColor: `${cfg.color}18`, border: `1px solid ${cfg.color}33`,
      fontSize: '12px', fontWeight: 700, color: cfg.color,
    }}>
      <span style={{ fontSize: '10px', fontWeight: 800 }}>{cfg.short}</span>
      {sw}
    </span>
  )
}

function CopyLinkButton() {
  const [state, setState] = useState('idle') // 'idle' | 'copied'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setState('copied')
      setTimeout(() => setState('idle'), 2200)
    } catch {
      // fallback per ambienti non HTTPS
      const input = document.createElement('input')
      input.value = window.location.href
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setState('copied')
      setTimeout(() => setState('idle'), 2200)
    }
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        height: '34px', padding: '0 14px',
        backgroundColor: state === 'copied' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
        border: state === 'copied' ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: state === 'copied' ? '#10b981' : '#8888aa',
        fontSize: '12px', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.25s ease', whiteSpace: 'nowrap',
      }}
    >
      {state === 'copied' ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copiato!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Copia Link
        </>
      )}
    </button>
  )
}

function MuteButton({ muted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={muted ? 'Attiva audio' : 'Disattiva audio'}
      style={{
        position: 'absolute', top: '16px', right: '16px', zIndex: 10,
        width: '36px', height: '36px', borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#e8e8f0', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background-color 0.2s',
      }}
    >
      {muted ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState(null)
  const [muted, setMuted]      = useState(true)
  const videoRef = useRef()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchProjectById(id)
      .then((data) => { if (!cancelled) { setProject(data); setLoading(false) } })
      .catch((err)  => { if (!cancelled) { setError(err.message); setLoading(false) } })
    return () => { cancelled = true }
  }, [id])

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !muted
      setMuted(!muted)
    }
  }

  const swList    = project ? (Array.isArray(project.software) ? project.software : [project.software]).filter(Boolean) : []
  const primarySw = swList[0]
  const accentColor = primarySw ? SOFTWARE_CONFIG[primarySw]?.color : null
  const stCfg = project ? STATUS_CONFIG[project.status] : null

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100dvh', backgroundColor: '#060410' }}>
      <AmbientOrbs accentColor={accentColor} />

      {/* Nav bar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(6,4,16,0.82)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px', height: '56px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px',
      }}>
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#8888aa', textDecoration: 'none', fontSize: '13px', fontWeight: 500,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#e8e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#8888aa'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#e8e8f0', letterSpacing: '-0.2px' }}>
            MoCubico
          </div>
          <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <CopyLinkButton />
        </div>
      </nav>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100dvh - 56px)', color: '#44445a' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0077ff" strokeWidth="2"
            style={{ animation: 'spin 0.9s linear infinite' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
          </svg>
        </div>
      )}

      {/* Errore */}
      {error && (
        <div style={{ padding: '48px 24px', textAlign: 'center', color: '#f87171', fontSize: '14px' }}>
          <p style={{ margin: '0 0 12px' }}>Progetto non trovato o errore di rete.</p>
          <Link to="/" style={{ color: '#60b0ff', fontSize: '13px' }}>← Torna alla dashboard</Link>
        </div>
      )}

      {/* Contenuto */}
      {project && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Hero: video o immagine */}
          <div style={{
            width: '100%',
            height: 'clamp(280px, 58vh, 640px)',
            position: 'relative',
            backgroundColor: '#030208',
            overflow: 'hidden',
          }}>
            {project.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={project.videoUrl}
                  autoPlay muted loop playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <MuteButton muted={muted} onToggle={toggleMute} />
              </>
            ) : project.thumbnail ? (
              <img src={project.thumbnail} alt={project.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              /* Placeholder con colore accent */
              <div style={{
                width: '100%', height: '100%',
                background: accentColor
                  ? `radial-gradient(ellipse at 50% 50%, ${accentColor}20 0%, transparent 70%)`
                  : 'radial-gradient(ellipse at 50% 50%, rgba(0,119,255,0.12) 0%, transparent 70%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                  stroke={accentColor || '#0077ff'} strokeWidth="0.8" style={{ opacity: 0.3 }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            )}

            {/* Gradient overlay bottom */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px',
              background: 'linear-gradient(transparent, rgba(6,4,16,0.95))',
              pointerEvents: 'none',
            }} />

            {/* Badges hero overlay */}
            <div style={{
              position: 'absolute', bottom: '20px', left: '24px',
              display: 'flex', gap: '8px', alignItems: 'center',
            }}>
              {stCfg && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  backgroundColor: `${stCfg.color}22`,
                  border: `1px solid ${stCfg.color}55`,
                  borderRadius: '20px', padding: '4px 12px',
                  fontSize: '12px', fontWeight: 600, color: stCfg.color,
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                }}>
                  {stCfg.dot && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: stCfg.color, animation: 'pulse-glow 1.4s ease-in-out infinite' }} />
                  )}
                  {project.status}
                </span>
              )}
            </div>

            {project.duration && (
              <div style={{
                position: 'absolute', bottom: '20px', right: '24px',
                backgroundColor: 'rgba(0,0,0,0.60)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px', padding: '3px 10px',
                fontSize: '12px', fontWeight: 600, color: '#e8e8f0',
              }}>
                ⏱ {project.duration}
              </div>
            )}
          </div>

          {/* Info card */}
          <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 24px 64px' }}>
            <div style={{
              backgroundColor: 'rgba(8,6,18,0.72)',
              backdropFilter: 'blur(28px) saturate(180%)',
              WebkitBackdropFilter: 'blur(28px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '18px',
              padding: '28px 32px',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 20px 60px rgba(0,0,0,0.6)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Top edge specular */}
              <div style={{
                position: 'absolute', top: 0, left: '8%', right: '8%', height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                pointerEvents: 'none',
              }} />

              {/* Titolo */}
              <h1 style={{
                margin: '0 0 16px',
                fontSize: 'clamp(22px, 4vw, 32px)',
                fontWeight: 800, color: '#ffffff',
                letterSpacing: '-0.5px', lineHeight: 1.2,
              }}>
                {project.title}
              </h1>

              {/* Software badges */}
              {swList.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {swList.map((sw) => <SoftwareBadge key={sw} sw={sw} />)}
                </div>
              )}

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />

              {/* Meta grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}>
                <MetaItem icon="👤" label="Cliente" value={project.client} />
                {project.duration && <MetaItem icon="⏱" label="Durata" value={project.duration} />}
                <MetaItem icon="📅" label="Aggiornato" value={formatDate(project.updatedAt)} />
                {project.createdAt && <MetaItem icon="🗓" label="Creato" value={formatDate(project.createdAt)} />}
              </div>

              {/* Tags */}
              {project.tags?.length > 0 && (
                <>
                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)', margin: '20px 0' }} />
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {project.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: '12px', color: '#8888aa',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: '6px', padding: '4px 10px', fontWeight: 500,
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function MetaItem({ icon, label, value }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 600, color: '#44445a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 500, color: '#c8c8da' }}>
        {value}
      </div>
    </div>
  )
}
