import { SOFTWARE } from '../data/projects'

export default function AmbientOrbs({ softwareFilter = null, accentColor = null }) {
  const isAE  = softwareFilter === SOFTWARE.AE
  const isC4D = softwareFilter === SOFTWARE.C4D

  // Se viene passato accentColor (pagina dettaglio), usiamo quello per l'orb centrale
  const centerColor = accentColor
    ? `${accentColor}18`
    : 'rgba(99,102,241,0.09)'

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Viola/viola — top-left */}
      <div style={{
        position: 'absolute', width: '750px', height: '750px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,47,255,0.18) 0%, rgba(99,47,200,0.08) 45%, transparent 68%)',
        top: '-220px', left: '-160px',
        transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 1.2s cubic-bezier(0.4,0,0.2,1)',
        opacity: isC4D ? 0.2 : 1,
        transform: isC4D ? 'translate(-80px,40px) scale(0.85)' : 'translate(0,0) scale(1)',
      }} />

      {/* Arancione — bottom-right */}
      <div style={{
        position: 'absolute', width: '650px', height: '650px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, rgba(200,80,30,0.07) 45%, transparent 68%)',
        bottom: '-140px', right: '-120px',
        transition: 'opacity 1.2s cubic-bezier(0.4,0,0.2,1), transform 1.2s cubic-bezier(0.4,0,0.2,1)',
        opacity: isAE ? 0.2 : 1,
        transform: isAE ? 'translate(80px,-40px) scale(0.85)' : 'translate(0,0) scale(1)',
      }} />

      {/* Orb centrale — colore accent o indigo */}
      <div style={{
        position: 'absolute', width: '540px', height: '540px', borderRadius: '50%',
        background: `radial-gradient(circle, ${centerColor} 0%, transparent 65%)`,
        top: '38%', left: '48%', transform: 'translate(-50%,-50%)',
        transition: 'background 1s ease',
      }} />

      {/* Griglia sottile */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.011) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.011) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
    </div>
  )
}
