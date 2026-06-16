import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

function Login({ login }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { toggleTheme } = useTheme()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    login(username, password).then(result => {
      setLoading(false)
      if (!result.success) setError(result.error)
    })
  }

  const getThemeIcon = () => {
    const root = document.documentElement.getAttribute('data-theme') || 'light'
    if (root === 'dark') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    if (root === 'ocean') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 3-13 4 4h2"/></svg>
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
  }

  return (
    <div className="fade-in" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      padding: '24px',
      position: 'relative'
    }}>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="glass-strong pop-in" style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '48px 40px', 
        textAlign: 'center',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src="https://cdn.crisu.qzz.io/files/png/crisutf/favicon.png" 
              alt="idk mail logo" 
              style={{ width: '48px', height: '48px', borderRadius: '14px', boxShadow: 'var(--shadow-md)' }} 
            />
            <h1 style={{ fontSize: '32px', margin: 0 }}>
              <span className="text-gradient">idk</span> mail
            </h1>
          </div>
          <button onClick={toggleTheme} className="btn-icon" title="Cambiar Tema">
            {getThemeIcon()}
          </button>
        </div>

        <p style={{ 
          fontSize: '16px', 
          color: 'var(--text-secondary)', 
          marginBottom: '36px',
        }}>
          Inicia sesión para acceder a tu cuenta.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ 
              display: 'block', fontSize: '13px', fontWeight: '700', 
              marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="tu_usuario"
              disabled={loading}
              required
            />
          </div>
          
          <div style={{ textAlign: 'left' }}>
            <label style={{ 
              display: 'block', fontSize: '13px', fontWeight: '700', 
              marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          {error && <div className="slide-up" style={{ 
            color: 'var(--error-color)', fontSize: '14px', fontWeight: '600',
            padding: '12px', background: 'rgba(255, 59, 48, 0.1)', borderRadius: '12px',
            border: '1px solid rgba(255, 59, 48, 0.2)'
          }}>
            {error}
          </div>}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '12px', padding: '16px', fontSize: '16px' }}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p style={{ marginTop: '32px', color: 'var(--text-secondary)', fontSize: '15px' }}>
          ¿No tienes cuenta?{' '}
          <span 
            onClick={() => navigate('/register')} 
            style={{ color: 'var(--primary-color)', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            Crear una <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login
