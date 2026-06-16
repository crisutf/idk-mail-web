import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicChat from './PublicChat'
import Mail from './Mail'
import Friends from './Friends'
import PrivateChat from './PrivateChat'
import Profile from './Profile'
import { useTheme } from '../contexts/ThemeContext'
import axios from 'axios'
import { API_URL, getAvatarUrl } from '../App'
import io from 'socket.io-client'

const SOCKET_URL = 'https://api-idk-mail-services.crisu.qzz.io:2053'

function Dashboard({ user, token, logout, initialSection = 'mail' }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(initialSection)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const { toggleTheme } = useTheme()
  const [profile, setProfile] = useState(user)
  const [mailsRefreshKey, setMailsRefreshKey] = useState(0)
  const socketRef = useRef(null)

  useEffect(() => {
    setActiveTab(initialSection)
  }, [initialSection])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const profileData = {
          ...res.data,
          id: res.data.id || res.data._id
        }
        setProfile(profileData)
        localStorage.setItem('user', JSON.stringify(profileData))
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()

    // Conectar socket y escuchar notificaciones
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket
    socket.emit('authenticate', token)

    socket.on('notification', async (data) => {
      if (Notification.permission === 'granted') {
        new Notification(`📩 Mensaje de ${data.from}`, {
          body: data.message
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission()
      }
    })

    return () => socket.disconnect()
  }, [token])

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const storagePercent = Math.min(100, (profile.storageUsed / profile.storageLimit) * 100)

  const getThemeIcon = () => {
    const root = document.documentElement.getAttribute('data-theme') || 'light'
    if (root === 'dark') return '🌙'
    if (root === 'ocean') return '🌊'
    return '☀️'
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedFriend(null)
    if (tab === 'chat') navigate('/chat')
    else if (tab === 'mail') navigate('/mail')
    else if (tab === 'friends') navigate('/friends')
    else if (tab === 'profile') navigate('/profile')
    else navigate('/dashboard')
  }

  const refreshMails = () => {
    setMailsRefreshKey(prev => prev + 1)
  }

  return (
    <div className="dashboard-layout fade-in">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      {/* Sidebar - Discord/Apple Hybrid */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
          <img 
            src="https://cdn.crisu.qzz.io/files/png/crisutf/favicon.png" 
            alt="idk mail logo" 
            style={{ width: '40px', height: '40px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }} 
          />
          <h1 style={{ fontSize: '24px', margin: 0, letterSpacing: '-0.5px' }}>
            <span className="text-gradient">idk</span> mail
          </h1>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            className={`menu-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => handleTabChange('chat')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> Chat Público
          </button>
          <button 
            className={`menu-item ${activeTab === 'mail' ? 'active' : ''}`}
            onClick={() => handleTabChange('mail')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Correos
          </button>
          <button 
            className={`menu-item ${(activeTab === 'friends' || activeTab === 'private') ? 'active' : ''}`}
            onClick={() => handleTabChange('friends')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Amigos
          </button>
          
          <div style={{ margin: '16px 0', borderBottom: '1px solid var(--glass-border)' }}></div>
          
          <button 
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Configuración
          </button>

          {user.role === 'admin' && (
            <button 
              className="menu-item"
              onClick={() => navigate('/admin')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg> Admin Panel
            </button>
          )}
        </nav>

        {/* Profile Snippet at Bottom */}
        <div style={{ 
          marginTop: 'auto', 
          background: 'var(--bg-tertiary)', 
          padding: '16px', 
          borderRadius: '16px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {(() => {
              const avatarUrl = getAvatarUrl(profile.avatar)
              return (
                <div style={{ position: 'relative' }}>
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar"
                      className="avatar avatar-md"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    style={{ 
                      width: '48px', height: '48px', borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', 
                      display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: 'white', fontWeight: '800', fontSize: '20px',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              )
            })()}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile.username}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {formatBytes(profile.storageUsed)} / {formatBytes(profile.storageLimit)}
              </div>
            </div>
          </div>
          
          <div style={{ width: '100%', height: '6px', background: 'var(--glass-border)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${storagePercent}%`, 
              height: '100%', 
              background: storagePercent > 90 ? 'var(--error-color)' : storagePercent > 70 ? 'var(--warning-color)' : 'var(--success-color)', 
              borderRadius: '999px', 
              transition: 'width 0.5s var(--ease-apple)' 
            }}></div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button 
              className="btn-icon" 
              onClick={() => {
                if (Notification.permission === 'default') {
                  Notification.requestPermission();
                } else if (Notification.permission === 'granted') {
                  alert('Notificaciones ya están activadas!');
                } else {
                  alert('Notificaciones bloqueadas. Actívalas desde la configuración del navegador.');
                }
              }} 
              title="Notificaciones"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button className="btn-icon" onClick={toggleTheme} title="Cambiar tema">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <button className="btn-icon" onClick={logout} style={{ color: 'var(--error-color)' }} title="Cerrar sesión">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <h2 style={{ margin: 0, fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeTab === 'chat' && <><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> Chat Público</>}
            {activeTab === 'mail' && <><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Bandeja de Entrada</>}
            {activeTab === 'friends' && <><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Amigos</>}
            {activeTab === 'private' && <><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Chat Privado</>}
            {activeTab === 'profile' && <><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> Configuración del Perfil</>}
          </h2>
          
          <div>
            {activeTab === 'mail' && (
              <button className="btn-secondary" onClick={refreshMails} style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Actualizar
              </button>
            )}
            {activeTab === 'private' && (
               <button className="btn-secondary" onClick={() => { setSelectedFriend(null); setActiveTab('friends'); }} style={{ padding: '8px 16px', fontSize: '14px' }}>
                 Volver a Amigos
               </button>
            )}
          </div>
        </header>

        <div className="content-area">
          <div className="glass-strong" style={{ padding: '32px', borderRadius: '24px', minHeight: '100%', animation: 'slideUp 0.4s var(--ease-apple)' }}>
            {activeTab === 'chat' && !selectedFriend && <PublicChat user={user} token={token} />}
            {activeTab === 'mail' && <Mail user={user} token={token} refreshKey={mailsRefreshKey} />}
            {activeTab === 'friends' && <Friends user={user} token={token} onSelectFriend={(friend) => { setSelectedFriend(friend); setActiveTab('private'); }} />}
            {activeTab === 'private' && selectedFriend && <PrivateChat user={user} token={token} friend={selectedFriend} onBack={() => { setSelectedFriend(null); setActiveTab('friends'); }} />}
            {activeTab === 'profile' && <Profile user={user} token={token} />}
          </div>
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav" style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--glass-strong-bg)',
        backdropFilter: 'blur(30px)',
        borderTop: '1px solid var(--glass-border)',
        padding: '10px 20px',
        zIndex: 40,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <button 
            onClick={() => handleTabChange('chat')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px',
              background: activeTab === 'chat' ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'transparent',
              color: activeTab === 'chat' ? 'white' : 'var(--text-secondary)',
              border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s',
              fontWeight: '700', fontSize: '11px'
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>💬</span>
            Chat
          </button>
          
          <button 
            onClick={() => handleTabChange('mail')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px',
              background: activeTab === 'mail' ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'transparent',
              color: activeTab === 'mail' ? 'white' : 'var(--text-secondary)',
              border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s',
              fontWeight: '700', fontSize: '11px'
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>📬</span>
            Correos
          </button>
          
          <button 
            onClick={() => handleTabChange('friends')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px',
              background: (activeTab === 'friends' || activeTab === 'private') ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'transparent',
              color: (activeTab === 'friends' || activeTab === 'private') ? 'white' : 'var(--text-secondary)',
              border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s',
              fontWeight: '700', fontSize: '11px'
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>👥</span>
            Amigos
          </button>
          
          <button 
            onClick={() => navigate('/profile')}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 16px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.25s',
              fontWeight: '700', fontSize: '11px'
            }}
          >
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>⚙️</span>
            Perfil
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
