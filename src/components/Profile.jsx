import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL, getAvatarUrl } from '../App';
import { useTheme } from '../contexts/ThemeContext';

function Profile({ user, token }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [emailLocal, setEmailLocal] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { toggleTheme, setTheme, themes } = useTheme();

  const DEFAULT_DOMAIN = 'idk.tf';

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data);
      setUsername(res.data.username);
      
      const emailParts = res.data.email.split('@');
      setEmailLocal(emailParts[0]);
      setBio(res.data.bio || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    if (avatar) {
      const previewUrl = URL.createObjectURL(avatar);
      setAvatarPreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setAvatarPreview(null);
    }
  }, [avatar]);

  const updateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setSaveSuccess(false);
    try {
      const formData = new FormData();
      if (username) formData.append('username', username);
      
      const fullEmail = `${emailLocal}@${DEFAULT_DOMAIN}`;
      formData.append('email', fullEmail);
      
      if (bio !== undefined) formData.append('bio', bio);
      if (password) formData.append('password', password);
      if (avatar) formData.append('avatar', avatar);

      const res = await axios.put(`${API_URL}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSaveSuccess(true);
      setPassword('');
      setConfirmPassword('');
      setAvatar(null);
      setAvatarPreview(null);
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      alert(error.response?.data?.error || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ minHeight: '100vh', padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Volver al Dashboard
        </button>
        
        {saveSuccess && (
          <div className="pop-in" style={{
            background: 'var(--success-color)', color: 'white', padding: '12px 24px', borderRadius: '12px',
            fontWeight: '800', display: 'flex', gap: '8px', boxShadow: '0 8px 24px rgba(52,199,89,0.3)', alignItems: 'center'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Guardado
          </div>
        )}
      </div>

      <h1 style={{ fontSize: '36px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span className="text-gradient">Configuración del Perfil</span>
      </h1>

      {profile && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '40px' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-strong card-hover" style={{ padding: '32px', textAlign: 'center', borderRadius: '24px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
                {(() => {
                  const displayAvatar = avatarPreview || getAvatarUrl(profile.avatar);
                  return displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" style={{
                      width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover',
                      border: '4px solid var(--bg-secondary)', boxShadow: 'var(--shadow-md)'
                    }} />
                  ) : (
                    <div style={{ 
                      width: '140px', height: '140px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '900', fontSize: '56px',
                      border: '4px solid var(--bg-secondary)', boxShadow: 'var(--shadow-md)'
                    }}>
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                  );
                })()}
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '800' }}>{profile.username}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px' }}>{profile.email}</p>
              
              {profile.bio && (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '15px', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '16px', margin: '0 0 24px' }}>
                  "{profile.bio}"
                </p>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '800', textTransform: 'uppercase' }}>Usado</p>
                  <p style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--primary-color)' }}>{formatBytes(profile.storageUsed)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '800', textTransform: 'uppercase' }}>Límite</p>
                  <p style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{formatBytes(profile.storageLimit)}</p>
                </div>
              </div>
            </div>

            <div className="glass-strong card-hover" style={{ padding: '24px', borderRadius: '24px' }}>
              <h4 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.06 0 1.95-.82 2-1.88v-.4a2 2 0 0 0-.59-1.41l-2.83-2.83a2 2 0 0 1-.58-1.41V12a8 8 0 0 1 8-8c5.52 0 10 4.48 10 10v.5M12 2a10 10 0 0 1 10 10v.5C22 17.5 17.5 22 12 22 6.48 22 2 17.5 2 12S6.48 2 12 2z"/></svg> Tema</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {themes.map(t => {
                  const isActive = document.documentElement.getAttribute('data-theme') === t;
                  return (
                    <button
                      key={t} onClick={() => setTheme(t)}
                      style={{
                        padding: '12px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: isActive ? 'var(--primary-color)' : 'var(--bg-secondary)',
                        color: isActive ? 'white' : 'var(--text-primary)',
                        border: isActive ? 'none' : '1px solid var(--glass-border)',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {t === 'light' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> : t === 'dark' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-9 5 18 3-13 4 4h2"/></svg>}
                        {t === 'light' ? 'Claro' : t === 'dark' ? 'Oscuro' : 'Azul'}
                      </span>
                      {isActive && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-strong" style={{ padding: '32px', borderRadius: '24px' }}>
              <h4 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800' }}>Información Básica</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nombre de Usuario</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Correo Electrónico</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--glass-border)', borderRadius: '14px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <input type="text" value={emailLocal} onChange={(e) => setEmailLocal(e.target.value)} style={{ flex: 1, border: 'none', borderRadius: 0, boxShadow: 'none' }} required />
                    <div style={{ padding: '14px 20px', background: 'var(--bg-tertiary)', fontWeight: '700', color: 'var(--text-secondary)', borderLeft: '1px solid var(--glass-border)' }}>@{DEFAULT_DOMAIN}</div>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Biografía</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows="3" placeholder="Cuéntanos algo sobre ti..." style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            <div className="glass-strong" style={{ padding: '32px', borderRadius: '24px' }}>
              <h4 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800' }}>Foto de Perfil</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px dashed var(--glass-border)' }}>
                <input type="file" accept="image/*" id="avatar-input" style={{ display: 'none' }} onChange={(e) => setAvatar(e.target.files[0])} />
                <button type="button" className="btn-secondary" onClick={() => document.getElementById('avatar-input').click()} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {avatar ? <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Cambiar foto</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> Seleccionar foto</>}
                </button>
                {avatar && (
                  <button type="button" className="btn-danger" onClick={() => { setAvatar(null); setAvatarPreview(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Eliminar
                  </button>
                )}
              </div>
            </div>

            <div className="glass-strong" style={{ padding: '32px', borderRadius: '24px' }}>
              <h4 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: '800' }}>Seguridad</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nueva Contraseña</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar en blanco para no cambiar" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Confirmar Contraseña</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '20px', fontSize: '18px', fontWeight: '800', width: '100%' }}>
              {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;
