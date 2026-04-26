import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { SOFTWARE_CONFIG, STATUS } from '../data/projects'
import { deleteProject, updateStatus } from '../lib/projectsApi'

const STATUS_CONFIG = {
  [STATUS.RENDERING]: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: true },
  [STATUS.CONCLUSO]:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: false },
  [STATUS.REVISIONE]: { color: '#ec4899', bg: 'rgba(236,72,153,0.12)', dot: false },
  [STATUS.PAUSA]:     { color: '#6366f1', bg: 'rgba(99,102,241,0.12)', dot: false },
  [STATUS.BRIEF]:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', dot: false },
}

const STATUS_LIST = Object.values(STATUS)

function formatDate(str) {
  if (!str) return ''
  return new Date(str).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

function SoftwareBadges({ software }) {
  const list    = Array.isArray(software) ? software : [software].filter(Boolean)
  const visible = list.slice(0, 3)
  const extra   = list.length - 3

  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
      {visible.map((sw) => {
        const cfg = SOFTWARE_CONFIG[sw] || { short: sw.slice(0, 3), color: '#8888aa' }
        return (
          <span key={sw} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            height: '18px', padding: '0 6px',
            backgroundColor: `${cfg.color}1a`,
            border: `1px solid ${cfg.color}33`,
            borderRadius: '4px',
            fontSize: '9px', fontWeight: 800, color: cfg.color,
            letterSpacing: '-0.2px',
          }}>
            {cfg.short}
          </span>
        )
      })}
      {extra > 0 && (
        <span style={{ fontSize: '10px', color: '#44445a', fontWeight: 500 }}>+{extra}</span>
      )}
    </div>
  )
}

export default function ProjectCard({ project, onDelete, onStatusChange }) {
  const navigate = useNavigate()
  const [hovered,       setHovered]      = useState(false)
  const [currentStatus, setStatus]       = useState(project.status)
  const [statusOpen,    setStatusOpen]   = useState(false)
  const [deletePhase,   setDeletePhase]  = useState('idle') // 'idle' | 'confirm' | 'loading'
  const deleteTimerRef = useRef()
  const dropdownRef    = useRef()

  const swList    = Array.isArray(project.software) ? project.software : [project.software].filter(Boolean)
  const primarySw = swList[0]
  const swCfg     = SOFTWARE_CONFIG[primarySw] || { color: '#7b2fff' }
  const stCfg     = STATUS_CONFIG[currentStatus] || STATUS_CONFIG[STATUS.BRIEF]

  useEffect(() => {
    if (!statusOpen) return
    function handle(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setStatusOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [statusOpen])

  useEffect(() => {
    if (deletePhase === 'confirm') {
      deleteTimerRef.current = setTimeout(() => setDeletePhase('idle'), 3000)
    }
    return () => clearTimeout(deleteTimerRef.current)
  }, [deletePhase])

  async function handleStatusSelect(newStatus) {
    setStatusOpen(false)
    if (newStatus === currentStatus) return
    const prev = currentStatus
    setStatus(newStatus)
    try {
      await updateStatus(project.id, newStatus)
      onStatusChange?.(project.id, newStatus)
    } catch {
      setStatus(prev)
    }
  }

  async function handleDeleteClick() {
    if (deletePhase === 'idle') {
      setDeletePhase('confirm')
    } else if (deletePhase === 'confirm') {
      clearTimeout(deleteTimerRef.current)
      setDeletePhase('loading')
      try {
        await deleteProject(project.id)
        onDelete?.(project.id)
      } catch {
        setDeletePhase('idle')
      }
    }
  }

  const glowHover = `0 0 0 1px ${swCfg.color}33, 0 8px 40px ${swCfg.color}33, 0 0 80px ${swCfg.color}14`

  return (
    <div
      className="glass-card"
      onClick={() => navigate(`/project/${project.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (statusOpen) setStatusOpen(false) }}
      style={{
        backgroundColor: hovered ? 'rgba(26,22,48,0.72)' : 'rgba(16,14,28,0.60)',
        border: `1px solid ${hovered ? swCfg.color + '44' : swCfg.color + '14'}`,
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.25s, border-color 0.25s, box-shadow 0.25s, transform 0.2s',
        boxShadow: hovered
          ? glowHover
          : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.55)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      {/* Thumbnail con crossfade video on hover */}
      <div style={{
        width: '100%', aspectRatio: '16/9',
        backgroundColor: '#06060f',
        borderRadius: '14px 14px 0 0',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}>
        {/* Base: thumbnail o placeholder — sempre visibile sotto */}
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <ThumbnailPlaceholder sw={swCfg} hovered={hovered} />
        )}

        {/* Video layer — crossfade on hover */}
        <AnimatePresence>
          {hovered && project.videoUrl && (
            <motion.video
              key="video"
              src={project.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%', objectFit: 'cover',
              }}
            />
          )}
        </AnimatePresence>

        {/* Durata */}
        {project.duration && (
          <div style={{
            position: 'absolute', bottom: '8px', right: '8px',
            backgroundColor: 'rgba(0,0,0,0.70)',
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '5px', padding: '2px 8px',
            fontSize: '11px', fontWeight: 600, color: '#e8e8f0',
            zIndex: 1,
          }}>
            {project.duration}
          </div>
        )}

        {/* Hover scan-line */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(180deg, ${swCfg.color}0a 0%, transparent 60%)`,
            pointerEvents: 'none',
            zIndex: 2,
          }} />
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '9px' }}>

        {/* Titolo + software badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <h3 style={{
            margin: 0, fontSize: '14px', fontWeight: 600,
            color: hovered ? '#ffffff' : '#e8e8f0',
            lineHeight: 1.3, letterSpacing: '-0.2px', flex: 1,
            transition: 'color 0.2s',
          }}>
            {project.title}
          </h3>
          <SoftwareBadges software={project.software} />
        </div>

        {/* Cliente */}
        <div style={{ fontSize: '12px', color: '#8888aa', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          {project.client}
        </div>

        {/* Footer: stato + data + elimina */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto', position: 'relative' }}>

          {/* Status badge — cliccabile per dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={(e) => { e.stopPropagation(); setStatusOpen(o => !o) }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                backgroundColor: stCfg.bg,
                border: `1px solid ${stCfg.color}44`,
                borderRadius: '20px', padding: '3px 8px 3px 10px',
                fontSize: '11px', fontWeight: 600, color: stCfg.color,
                cursor: 'pointer',
                backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                transition: 'opacity 0.15s',
              }}
            >
              {stCfg.dot && (
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  backgroundColor: stCfg.color,
                  animation: 'pulse-glow 1.4s ease-in-out infinite',
                  boxShadow: `0 0 6px ${stCfg.color}`,
                }} />
              )}
              {currentStatus}
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Dropdown stati */}
            {statusOpen && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 6px)', left: 0,
                backgroundColor: 'rgba(10,8,20,0.95)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '6px',
                minWidth: '150px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                zIndex: 20,
                animation: 'slide-up 0.15s ease-out both',
              }}>
                {STATUS_LIST.map((s) => {
                  const cfg = STATUS_CONFIG[s]
                  return (
                    <button
                      key={s}
                      onClick={(e) => { e.stopPropagation(); handleStatusSelect(s) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        width: '100%', padding: '7px 10px',
                        borderRadius: '6px', border: 'none',
                        backgroundColor: s === currentStatus ? `${cfg.color}18` : 'transparent',
                        color: s === currentStatus ? cfg.color : '#8888aa',
                        fontSize: '12px', fontWeight: s === currentStatus ? 600 : 400,
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background-color 0.1s',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => { if (s !== currentStatus) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={(e) => { if (s !== currentStatus) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
                      {s}
                      {s === currentStatus && <span style={{ marginLeft: 'auto', fontSize: '10px' }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Data */}
          <span style={{ fontSize: '11px', color: '#44445a', marginLeft: 'auto' }}>
            {formatDate(project.updatedAt)}
          </span>

          {/* Bottone elimina — visibile on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteClick() }}
            title={deletePhase === 'confirm' ? 'Clicca di nuovo per confermare' : 'Elimina progetto'}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: deletePhase === 'confirm' ? '3px 8px' : '3px 6px',
              borderRadius: '6px',
              border: `1px solid ${deletePhase === 'confirm' ? 'rgba(255,68,85,0.5)' : 'rgba(255,255,255,0.06)'}`,
              backgroundColor: deletePhase === 'confirm' ? 'rgba(255,68,85,0.15)' : 'rgba(255,255,255,0.03)',
              color: deletePhase === 'confirm' ? '#ff4455' : '#44445a',
              cursor: deletePhase === 'loading' ? 'wait' : 'pointer',
              fontSize: '11px', fontWeight: 600,
              opacity: hovered || deletePhase !== 'idle' ? 1 : 0,
              transition: 'opacity 0.2s, background-color 0.15s, border-color 0.15s, color 0.15s',
              flexShrink: 0,
            }}
          >
            {deletePhase === 'loading' ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              </svg>
            ) : deletePhase === 'confirm' ? (
              'Conferma?'
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6M9 6V4h6v2" />
              </svg>
            )}
          </button>
        </div>

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {project.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '10px', color: '#44445a',
                backgroundColor: 'rgba(15,15,26,0.6)',
                border: '1px solid rgba(30,30,48,0.8)',
                borderRadius: '4px', padding: '2px 6px', fontWeight: 500,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ThumbnailPlaceholder({ sw, hovered }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 50% 60%, ${sw.color}${hovered ? '18' : '0d'} 0%, transparent 70%)`,
      transition: 'background 0.3s',
    }}>
      <div style={{ opacity: hovered ? 0.45 : 0.2, transition: 'opacity 0.3s', color: sw.color }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
    </div>
  )
}
