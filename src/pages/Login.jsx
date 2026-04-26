import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import AmbientOrbs from '../components/AmbientOrbs'

export default function Login() {
  const { user, loading } = useAuth()
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [error,      setError]      = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Auth state change drives the redirect — no navigate() needed
  if (!loading && user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setSubmitting(false)
    }
    // On success: onAuthStateChange fires → user set → component redirects
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', padding: '16px',
    }}>
      <AmbientOrbs />

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, width: 'min(420px, 100%)' }}
      >
        <div className="glass-card" style={{
          backgroundColor: 'rgba(10,8,22,0.78)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '22px',
          padding: '40px 36px',
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              width: '52px', height: '52px', margin: '0 auto 16px',
              background: 'linear-gradient(135deg, #0077ff 0%, #60b0ff 100%)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '18px', color: '#fff', letterSpacing: '-0.5px',
              boxShadow: '0 8px 28px rgba(0,119,255,0.32)',
            }}>
              MC
            </div>
            <h1 style={{
              margin: 0, fontSize: '22px', fontWeight: 700,
              color: '#e8e8f0', letterSpacing: '-0.4px',
            }}>
              MoCubico
            </h1>
            <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#8888aa' }}>
              Accedi al tuo account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="nome@studio.com"
              autoComplete="email"
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: 'rgba(239,68,68,0.10)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: '9px', padding: '10px 14px',
                  color: '#fca5a5', fontSize: '12px', lineHeight: 1.5,
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              style={{
                marginTop: '4px',
                height: '44px',
                background: (submitting || loading)
                  ? 'rgba(0,119,255,0.45)'
                  : 'linear-gradient(135deg, #0077ff 0%, #60b0ff 100%)',
                border: 'none', borderRadius: '11px',
                color: '#fff', fontSize: '14px', fontWeight: 700,
                cursor: (submitting || loading) ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: (submitting || loading) ? 'none' : '0 4px 20px rgba(0,119,255,0.38)',
                transition: 'box-shadow 0.2s, background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {(submitting || loading) ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                  </svg>
                  {loading ? 'Caricamento…' : 'Accesso in corso…'}
                </>
              ) : 'Accedi'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

function InputField({ label, type, value, onChange, placeholder, autoComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <label style={{
        fontSize: '11px', fontWeight: 600,
        color: '#8888aa', letterSpacing: '0.4px', textTransform: 'uppercase',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        style={{
          backgroundColor: 'rgba(16,14,28,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '11px 14px',
          color: '#e8e8f0', fontSize: '14px',
          outline: 'none', fontFamily: 'inherit',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onFocus={e => {
          e.target.style.borderColor = 'rgba(0,119,255,0.55)'
          e.target.style.boxShadow   = '0 0 0 3px rgba(0,119,255,0.12)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'rgba(255,255,255,0.08)'
          e.target.style.boxShadow   = 'none'
        }}
      />
    </div>
  )
}
