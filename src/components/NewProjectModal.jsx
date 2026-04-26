import { useState, useEffect, useRef } from 'react'
import { SOFTWARE_CONFIG, STATUS } from '../data/projects'
import { createProject } from '../lib/projectsApi'
import { uploadWithProgress, getPublicUrl, generateStoragePath } from '../lib/storageApi'

const STATUS_OPTIONS = Object.values(STATUS)

const INPUT = {
  width: '100%',
  backgroundColor: 'rgba(8,8,16,0.7)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '10px 12px',
  color: '#e8e8f0',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}

const LABEL = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 600,
  color: '#8888aa',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
}

function UploadArea({ label, accept, file, preview, onChange, onClear, isDragging, onDragOver, onDrop, children }) {
  const ref = useRef()
  return (
    <div>
      <div
        onClick={() => !file && ref.current.click()}
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragging ? 'rgba(153,153,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '10px',
          cursor: file ? 'default' : 'pointer',
          overflow: 'hidden',
          backgroundColor: isDragging ? 'rgba(153,153,255,0.05)' : 'rgba(255,255,255,0.015)',
          transition: 'border-color 0.2s, background-color 0.2s',
          minHeight: '72px',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {children}
      </div>
      <input ref={ref} type="file" accept={accept} hidden onChange={(e) => onChange(e.target.files[0])} />
    </div>
  )
}

function VideoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

export default function NewProjectModal({ onClose, onCreated }) {
  const [visible, setVisible]         = useState(false)
  const [form, setForm]               = useState({ title: '', client: '', duration: '', status: STATUS.BRIEF, software: [] })
  const [thumbFile, setThumbFile]     = useState(null)
  const [thumbPreview, setThumbPrev]  = useState(null)
  const [videoFile, setVideoFile]     = useState(null)
  const [thumbDrag, setThumbDrag]     = useState(false)
  const [videoDrag, setVideoDrag]     = useState(false)
  const [videoProgress, setVidProg]   = useState(-1)   // -1 = inattivo
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState(null)

  // Entrance animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Chiudi con Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && !saving) onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [saving, onClose])

  function set(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function toggleSoftware(sw) {
    setForm(prev => ({
      ...prev,
      software: prev.software.includes(sw)
        ? prev.software.filter(s => s !== sw)
        : [...prev.software, sw],
    }))
  }

  function handleThumbFile(file) {
    if (!file?.type.startsWith('image/')) return
    setThumbFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setThumbPrev(e.target.result)
    reader.readAsDataURL(file)
  }

  function makeDropHandlers(setDrag, onFile) {
    return {
      onDragOver:  (e) => { e.preventDefault(); setDrag(true) },
      onDragLeave: ()  => setDrag(false),
      onDrop:      (e) => { e.preventDefault(); setDrag(false); onFile(e.dataTransfer.files[0]) },
    }
  }

  async function handleSave() {
    if (!form.title.trim())         { setError('Il titolo è obbligatorio'); return }
    if (!form.client.trim())        { setError('Il cliente è obbligatorio'); return }
    if (form.software.length === 0) { setError('Seleziona almeno un software'); return }

    setSaving(true)
    setError(null)

    try {
      let thumbnailUrl = null
      let videoUrl     = null

      if (thumbFile) {
        const path = generateStoragePath('thumbnails', thumbFile)
        await uploadWithProgress(path, thumbFile, null)
        thumbnailUrl = getPublicUrl(path)
      }

      if (videoFile) {
        setVidProg(0)
        const path = generateStoragePath('videos', videoFile)
        await uploadWithProgress(path, videoFile, setVidProg)
        videoUrl = getPublicUrl(path)
        setVidProg(-1)
      }

      const newProject = await createProject({
        title:    form.title.trim(),
        client:   form.client.trim(),
        duration: form.duration.trim() || null,
        status:   form.status,
        software: form.software,
        tags:     [],
        thumbnail: thumbnailUrl,
        videoUrl,
      })

      onCreated(newProject)
      onClose()
    } catch (err) {
      setError(err.message)
      setVidProg(-1)
    } finally {
      setSaving(false)
    }
  }

  const thumbHandlers = makeDropHandlers(setThumbDrag, handleThumbFile)
  const videoHandlers = makeDropHandlers(setVideoDrag, setVideoFile)

  const isUploading = videoProgress >= 0
  const canSave     = !saving && form.title && form.client && form.software.length > 0

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => !saving && onClose()}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', top: 0, right: 0, zIndex: 100,
          width: 'min(480px, 100vw)',
          height: '100dvh',
          backgroundColor: 'rgba(12,11,22,0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '0 24px',
          height: '60px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'linear-gradient(135deg, #0077ff, #60b0ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '15px', color: '#e8e8f0', letterSpacing: '-0.3px' }}>
              Nuovo Progetto
            </span>
          </div>
          <button
            onClick={() => !saving && onClose()}
            disabled={saving}
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#8888aa', cursor: 'pointer', fontSize: '16px', lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>

        {/* Scrollable form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Titolo */}
          <div>
            <label style={LABEL}>Titolo *</label>
            <input
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="es. Brand Identity Reveal"
              style={INPUT}
              autoFocus
            />
          </div>

          {/* Cliente */}
          <div>
            <label style={LABEL}>Cliente *</label>
            <input
              value={form.client}
              onChange={(e) => set('client', e.target.value)}
              placeholder="es. Nexus Agency"
              style={INPUT}
            />
          </div>

          {/* Durata + Stato — 2 colonne */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={LABEL}>Durata</label>
              <input
                value={form.duration}
                onChange={(e) => set('duration', e.target.value)}
                placeholder="es. 1:30"
                style={INPUT}
              />
            </div>
            <div>
              <label style={LABEL}>Stato</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                style={{ ...INPUT, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888aa' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Software multi-select */}
          <div>
            <label style={LABEL}>Software * <span style={{ color: '#44445a', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({form.software.length} selezionati)</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {Object.entries(SOFTWARE_CONFIG).map(([value, { short, color }]) => {
                const active = form.software.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSoftware(value)}
                    style={{
                      border: active ? `1px solid ${color}55` : '1px solid rgba(255,255,255,0.07)',
                      backgroundColor: active ? `${color}14` : 'rgba(255,255,255,0.02)',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '5px', flexShrink: 0,
                      backgroundColor: `${color}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', fontWeight: 800, color, letterSpacing: '-0.3px',
                    }}>
                      {short}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: active ? '#e8e8f0' : '#8888aa', lineHeight: 1.2 }}>
                      {value}
                    </span>
                    {active && (
                      <span style={{ marginLeft: 'auto', color, fontSize: '14px', lineHeight: 1 }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Thumbnail upload */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={LABEL}>Thumbnail</label>
              {thumbFile && (
                <button onClick={() => { setThumbFile(null); setThumbPrev(null) }}
                  style={{ fontSize: '11px', color: '#ff4455', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                  Rimuovi
                </button>
              )}
            </div>
            <UploadArea accept="image/*" file={thumbFile} isDragging={thumbDrag}
              onChange={handleThumbFile} {...thumbHandlers}>
              {thumbPreview ? (
                <img src={thumbPreview} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#44445a', width: '100%' }}>
                  <div style={{ marginBottom: '6px' }}><ImageIcon /></div>
                  <div style={{ fontSize: '12px' }}>Clicca o trascina un'immagine</div>
                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#2a2a45' }}>JPG, PNG, WebP</div>
                </div>
              )}
            </UploadArea>
          </div>

          {/* Video upload + progress */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={LABEL}>Video / Render</label>
              {videoFile && !isUploading && (
                <button onClick={() => setVideoFile(null)}
                  style={{ fontSize: '11px', color: '#ff4455', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                  Rimuovi
                </button>
              )}
            </div>
            <UploadArea accept="video/*" file={videoFile} isDragging={videoDrag}
              onChange={setVideoFile} {...videoHandlers}>
              {videoFile ? (
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                  <div style={{ color: '#60b0ff', flexShrink: 0 }}><VideoIcon /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', color: '#e8e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {videoFile.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8888aa', marginTop: '2px' }}>
                      {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#44445a', width: '100%' }}>
                  <div style={{ marginBottom: '6px' }}><VideoIcon /></div>
                  <div style={{ fontSize: '12px' }}>Clicca o trascina un video</div>
                  <div style={{ fontSize: '11px', marginTop: '2px', color: '#2a2a45' }}>MP4, MOV, AVI</div>
                </div>
              )}
            </UploadArea>

            {/* Progress bar — visibile solo durante l'upload */}
            {isUploading && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#8888aa' }}>Caricamento video...</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#60b0ff' }}>{videoProgress}%</span>
                </div>
                <div style={{ height: '5px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${videoProgress}%`,
                    background: 'linear-gradient(90deg, #0077ff 0%, #60b0ff 100%)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                    boxShadow: '0 0 10px rgba(153,153,255,0.6)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Shimmer sul progress bar */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                      animation: 'shimmer 1.4s infinite',
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messaggio di errore */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(255,68,85,0.10)',
              border: '1px solid rgba(255,68,85,0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#ff8899',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: '10px',
          flexShrink: 0,
        }}>
          <button
            onClick={() => !saving && onClose()}
            disabled={saving}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: '9px',
              border: '1px solid rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#8888aa',
              fontSize: '13px',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 2,
              padding: '11px',
              borderRadius: '9px',
              border: 'none',
              background: canSave
                ? 'linear-gradient(135deg, #0077ff 0%, #60b0ff 100%)'
                : 'rgba(255,255,255,0.06)',
              color: canSave ? '#fff' : '#44445a',
              fontSize: '13px',
              fontWeight: 700,
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'opacity 0.2s',
              boxShadow: canSave ? '0 4px 20px rgba(0,119,255,0.35)' : 'none',
            }}
          >
            {saving && !isUploading && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              </svg>
            )}
            {saving ? (isUploading ? 'Upload...' : 'Salvataggio...') : 'Salva Progetto'}
          </button>
        </div>
      </div>
    </>
  )
}
