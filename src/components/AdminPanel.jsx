import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL, BASE_URL } from '../App';

function AdminPanel({ user, token, logout }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showReportModal, setShowReportModal] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [createForm, setCreateForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    storageLimit: 10 * 1024 * 1024 * 1024
  });
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    bio: '',
    role: 'user',
    storageLimit: 10 * 1024 * 1024 * 1024,
    isActive: true
  });
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const { toggleTheme } = useTheme();

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    let cleanedPath = avatarPath.replace(/\\/g, '/');
    if (cleanedPath.startsWith('/')) {
      cleanedPath = cleanedPath.substring(1);
    }
    return `${BASE_URL}/${cleanedPath}`;
  };

  useEffect(() => {
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes, serverRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/admin/server-status`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setServerStatus(serverRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admin/users`, createForm, { headers: { Authorization: `Bearer ${token}` } });
      setShowCreateModal(false);
      setCreateForm({ username: '', email: '', password: '', role: 'user', storageLimit: 10 * 1024 * 1024 * 1024 });
      fetchData();
    } catch (error) {
      alert('Error al crear usuario');
    }
  };

  const updateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/admin/users/${showEditModal}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      if (editAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', editAvatarFile);
        await axios.put(`${API_URL}/admin/users/${showEditModal}/avatar`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      }
      setShowEditModal(null);
      setEditAvatarFile(null);
      fetchData();
    } catch (error) {
      alert('Error al actualizar usuario');
    }
  };

  const resetPassword = async () => {
    if (!newPassword) return;
    try {
      await axios.put(`${API_URL}/admin/users/${showResetPasswordModal}/reset-password`, { newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      setShowResetPasswordModal(null);
      setNewPassword('');
      alert('Contraseña restablecida correctamente');
    } catch (error) {
      alert('Error al restablecer contraseña');
    }
  };

  const toggleBan = async (userId, isBanned) => {
    try {
      const endpoint = isBanned ? 'unban' : 'ban';
      await axios.put(`${API_URL}/admin/users/${userId}/${endpoint}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (error) {
      alert('Error al cambiar estado de baneo');
    }
  };

  const softDelete = async (userId, isDeleted) => {
    try {
      if (isDeleted) {
        await axios.put(`${API_URL}/admin/users/${userId}/restore`, {}, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.delete(`${API_URL}/admin/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      }
      fetchData();
    } catch (error) {
      alert('Error al cambiar estado de eliminación');
    }
  };

  const clearCache = async () => {
    if (!window.confirm('¿Estás seguro de limpiar la caché?')) return;
    try {
      await axios.post(`${API_URL}/admin/clear-cache`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Caché limpiada correctamente');
    } catch (error) {
      alert('Error al limpiar caché');
    }
  };

  const viewReport = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/admin/users/${userId}/report`, { headers: { Authorization: `Bearer ${token}` } });
      setReportData(res.data);
      setShowReportModal(userId);
    } catch (error) {
      alert('Error al obtener informe');
    }
  };

  return (
    <div>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="https://cdn.crisu.qzz.io/files/png/crisutf/favicon.png" alt="logo" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}><span className="text-gradient">idk</span> mail - Panel Admin</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={clearCache}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> Limpiar Caché
            </button>
            <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/dashboard')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Volver
            </button>
            <button onClick={toggleTheme} className="btn-secondary" style={{ padding: '10px 14px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            </button>
            <button className="btn-danger" style={{ padding: '10px 18px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={logout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '110px 24px 40px' }}>
        {stats && serverStatus && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="glass card-hover" style={{ padding: '24px', borderRadius: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Usuarios Totales
                </p>
                <p style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', margin: 0 }}>{stats.totalUsers}</p>
              </div>
              <div className="glass card-hover" style={{ padding: '24px', borderRadius: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Usuarios Activos
                </p>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#10b981', margin: 0 }}>{stats.activeUsers}</p>
              </div>
              <div className="glass card-hover" style={{ padding: '24px', borderRadius: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Usuarios Baneados
                </p>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#ef4444', margin: 0 }}>{stats.bannedUsers}</p>
              </div>
              <div className="glass card-hover" style={{ padding: '24px', borderRadius: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10"/><path d="M15 2v4"/><path d="M15 12v-4"/><circle cx="20" cy="6" r="3"/></svg> Espacio Total Usado
                </p>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#6366f1', margin: 0 }}>{formatBytes(stats.totalStorage)}</p>
              </div>
              <div className="glass card-hover" style={{ padding: '24px', borderRadius: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Correos Totales
                </p>
                <p style={{ fontSize: '32px', fontWeight: '900', color: '#ec4899', margin: 0 }}>{stats.totalMails}</p>
              </div>
              <div className="glass card-hover" style={{ padding: '24px', borderRadius: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Uptime
                </p>
                <p style={{ fontSize: '28px', fontWeight: '900', color: '#f59e0b', margin: 0 }}>{serverStatus.uptime.days}d {serverStatus.uptime.hours}h {serverStatus.uptime.minutes}m</p>
              </div>
            </div>

            <div className="glass" style={{ padding: '24px', borderRadius: '18px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '20px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px', fontWeight: '700', textTransform: 'uppercase' }}>Sistema</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{serverStatus.os.platform} ({serverStatus.os.arch})</p>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '20px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px', fontWeight: '700', textTransform: 'uppercase' }}>CPUs</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{serverStatus.os.cpus} núcleos</p>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '20px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px', fontWeight: '700', textTransform: 'uppercase' }}>Memoria Total</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{formatBytes(serverStatus.os.totalMemory)}</p>
              </div>
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '20px', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px', fontWeight: '700', textTransform: 'uppercase' }}>Memoria Libre</p>
                <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{formatBytes(serverStatus.os.freeMemory)}</p>
              </div>
            </div>
          </>
        )}

        <div className="glass-strong" style={{ padding: '28px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Gestión de Usuarios
            </h2>
            <button className="btn-primary" onClick={() => setShowCreateModal(true)} style={{ padding: '12px 24px', fontSize: '15px', fontWeight: '800' }}>
              Crear Usuario
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '13px' }}>Usuario</th>
                  <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '13px' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '13px' }}>Rol</th>
                  <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '13px' }}>Almacenamiento</th>
                  <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '13px' }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '2px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: '800', textTransform: 'uppercase', fontSize: '13px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const storagePercent = Math.min(100, (u.storageUsed / u.storageLimit) * 100);
                  return (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'all 0.2s ease', background: u.deletedAt ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {(() => {
                            const avatarUrl = getAvatarUrl(u.avatar);
                            return avatarUrl ? (
                              <img src={avatarUrl} alt={u.username} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-border)' }} onError={(e) => e.target.style.display = 'none'} />
                            ) : null;
                          })()}
                          <div style={{ width: '42px', height: '42px', background: u.role === 'admin' ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: getAvatarUrl(u.avatar) ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '18px' }}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '15px' }}>{u.username}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 18px', color: 'var(--text-secondary)', fontSize: '14px' }}>{u.email}</td>
                      <td style={{ padding: '16px 18px' }}>
                        <span className="badge" style={{ background: u.role === 'admin' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)', color: u.role === 'admin' ? '#ec4899' : '#6366f1', fontWeight: '800', fontSize: '13px' }}>
                          {u.role === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ marginBottom: '6px', color: 'var(--text-primary)', fontWeight: '700', fontSize: '14px' }}>
                          {formatBytes(u.storageUsed)} / {formatBytes(u.storageLimit)}
                        </div>
                        <div style={{ width: '180px', height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                          <div style={{ width: `${storagePercent}%`, height: '100%', background: storagePercent > 90 ? '#ef4444' : storagePercent > 70 ? '#f59e0b' : '#10b981', borderRadius: '8px' }}></div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {u.deletedAt ? (
                            <span className="badge" style={{ background: 'rgba(107, 114, 128, 0.15)', color: '#6b7280' }}>Eliminado</span>
                          ) : (
                            <>
                              <span className="badge" style={{ background: u.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.isActive ? '#10b981' : '#ef4444' }}>
                                {u.isActive ? 'Activo' : 'Desactivado'}
                              </span>
                              <span className="badge" style={{ background: u.isBanned ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.08)', color: u.isBanned ? '#ef4444' : '#10b981' }}>
                                {u.isBanned ? 'Baneado' : 'Libre'}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button className="btn-secondary" style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '800' }} onClick={() => viewReport(u._id)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                          </button>
                          {u._id !== user._id && !u.deletedAt && (
                            <>
                              <button className="btn-secondary" style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '800' }} onClick={() => {
                                setEditForm({ username: u.username, email: u.email, bio: u.bio || '', role: u.role, storageLimit: u.storageLimit, isActive: u.isActive });
                                setEditAvatarFile(null);
                                setShowEditModal(u._id);
                              }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                              </button>
                              <button className="btn-secondary" style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '800' }} onClick={() => setShowResetPasswordModal(u._id)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                              </button>
                              <button className={u.isBanned ? 'btn-secondary' : 'btn-danger'} style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '800' }} onClick={() => toggleBan(u._id, u.isBanned)}>
                                {u.isBanned ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
                              </button>
                              <button className="btn-danger" style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '800' }} onClick={() => softDelete(u._id, false)}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                              </button>
                            </>
                          )}
                          {u.deletedAt && (
                            <button className="btn-primary" style={{ padding: '10px 14px', fontSize: '13px', fontWeight: '800' }} onClick={() => softDelete(u._id, true)}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-strong" style={{ width: '100%', maxWidth: '520px', padding: '40px', borderRadius: '24px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-primary)', marginBottom: '28px', fontSize: '26px', fontWeight: '900' }}>Crear Nuevo Usuario</h3>
            <form onSubmit={createUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre de Usuario</label>
                <input type="text" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} required style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Local (antes de @idk.tf)</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--glass-border)', borderRadius: '14px', overflow: 'hidden', background: 'var(--glass-bg)' }}>
                  <input type="text" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required style={{ flex: 1, padding: '16px 18px', border: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '15px', outline: 'none' }} />
                  <div style={{ padding: '16px 22px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', fontWeight: '800', fontSize: '15px', borderLeft: '2px solid var(--glass-border)' }}>@idk.tf</div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contraseña</label>
                <input type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rol</label>
                  <select value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Límite (GB)</label>
                  <input type="number" value={createForm.storageLimit / (1024 * 1024 * 1024)} onChange={(e) => setCreateForm({ ...createForm, storageLimit: Number(e.target.value) * 1024 * 1024 * 1024 })} required style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '800', borderRadius: '14px' }} onClick={() => setShowCreateModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '800', borderRadius: '14px' }}>Crear Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-strong" style={{ width: '100%', maxWidth: '560px', padding: '40px', borderRadius: '24px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-primary)', marginBottom: '32px', fontSize: '26px', fontWeight: '900' }}>Editar Usuario</h3>
            <form onSubmit={updateUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre de Usuario</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} required style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biografía</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows="3" style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avatar (opcional)</label>
                <input type="file" accept="image/*" onChange={(e) => setEditAvatarFile(e.target.files[0])} style={{ width: '100%', padding: '16px 18px', borderRadius: '14px', border: '2px dashed var(--glass-border)', fontSize: '15px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rol</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px', background: 'var(--glass-bg)', color: 'var(--text-primary)' }}>
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Límite (GB)</label>
                  <input type="number" value={editForm.storageLimit / (1024 * 1024 * 1024)} onChange={(e) => setEditForm({ ...editForm, storageLimit: Number(e.target.value) * 1024 * 1024 * 1024 })} required style={{ padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '800', borderRadius: '14px' }} onClick={() => setShowEditModal(null)}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '800', borderRadius: '14px' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-strong" style={{ width: '100%', maxWidth: '480px', padding: '40px', borderRadius: '24px' }}>
            <h3 style={{ marginTop: 0, color: 'var(--text-primary)', marginBottom: '28px', fontSize: '26px', fontWeight: '900' }}>Restablecer Contraseña</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', color: 'var(--text-primary)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nueva Contraseña</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Escribe la nueva contraseña" style={{ width: '100%', padding: '16px 18px', borderRadius: '14px', border: '2px solid var(--glass-border)', fontSize: '15px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '800', borderRadius: '14px' }} onClick={() => { setShowResetPasswordModal(null); setNewPassword(''); }}>Cancelar</button>
                <button type="button" className="btn-primary" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: '800', borderRadius: '14px' }} onClick={resetPassword}>Restablecer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReportModal && reportData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="glass-strong" style={{ width: '100%', maxWidth: '580px', padding: '40px', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)' }}>Informe de {reportData.user.username}</h3>
              <button className="btn-secondary" style={{ padding: '10px 16px', borderRadius: '12px', fontSize: '16px' }} onClick={() => setShowReportModal(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Email</p>
              <p style={{ color: 'var(--text-primary)', fontWeight: '800', margin: 0, fontSize: '16px' }}>{reportData.user.email}</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '24px', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Correos Enviados</p>
                <p style={{ fontSize: '34px', fontWeight: '900', color: '#6366f1', margin: 0 }}>{reportData.sentMails}</p>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '24px', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Correos Recibidos</p>
                <p style={{ fontSize: '34px', fontWeight: '900', color: '#10b981', margin: 0 }}>{reportData.receivedMails}</p>
              </div>
              <div style={{ background: 'rgba(236, 72, 153, 0.1)', padding: '24px', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Amigos</p>
                <p style={{ fontSize: '34px', fontWeight: '900', color: '#ec4899', margin: 0 }}>{reportData.friendCount}</p>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '24px', borderRadius: '18px', border: '1px solid var(--glass-border)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Almacenamiento</p>
                <p style={{ fontSize: '34px', fontWeight: '900', color: '#f59e0b', margin: 0 }}>{formatBytes(reportData.user.storageUsed)}</p>
              </div>
            </div>
            
            <div style={{ padding: '22px', background: 'var(--glass-bg)', borderRadius: '18px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800' }}>Cuenta Creada</p>
              <p style={{ color: 'var(--text-primary)', margin: 0, fontSize: '16px', fontWeight: '800' }}>{new Date(reportData.user.createdAt).toLocaleString()}</p>
            </div>
            
            <button className="btn-secondary" style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: '800', borderRadius: '14px' }} onClick={() => setShowReportModal(null)}>Cerrar Informe</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
