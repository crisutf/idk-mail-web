import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL, getAvatarUrl } from '../App';

function Friends({ user, token, onSelectFriend }) {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const [usersRes, friendsRes, requestsRes, blockedRes] = await Promise.all([
        axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/friends`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/friends/requests`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/users/blocked`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUsers(usersRes.data);
      setFriends(friendsRes.data);
      setRequests(requestsRes.data);
      setBlockedUsers(blockedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const sendRequest = async (receiverId) => {
    try {
      await axios.post(`${API_URL}/friends/requests`, { receiverId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al enviar solicitud');
    }
  };

  const respondRequest = async (requestId, status) => {
    try {
      await axios.put(`${API_URL}/friends/requests/${requestId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al responder solicitud');
    }
  };

  const deleteFriend = async (friendId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar a este amigo?')) return;
    try {
      await axios.delete(`${API_URL}/friends/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al eliminar amigo');
    }
  };

  const blockUser = async (userId, username) => {
    if (!confirm(`¿Estás seguro de que quieres bloquear a ${username}?`)) return;
    try {
      await axios.post(`${API_URL}/friends/block/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al bloquear usuario');
    }
  };

  const unblockUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/friends/block/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      alert('Error al desbloquear usuario');
    }
  };

  const UserAvatar = ({ userData, size = 'medium' }) => {
    const avatarUrl = getAvatarUrl(userData?.avatar);
    const dimensions = size === 'small' ? '32px' : size === 'large' ? '56px' : '44px';
    const fontSize = size === 'small' ? '14px' : size === 'large' ? '24px' : '18px';
    
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {avatarUrl ? (
          <img 
            src={avatarUrl}
            alt={userData?.username || 'User'}
            style={{ 
              width: dimensions, height: dimensions, borderRadius: '50%', objectFit: 'cover',
              boxShadow: 'var(--shadow-sm)', border: '2px solid var(--bg-secondary)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{ 
          width: dimensions, height: dimensions, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          display: avatarUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '800', fontSize: fontSize,
          boxShadow: 'var(--shadow-sm)', border: '2px solid var(--bg-secondary)'
        }}>
          {(userData?.username || 'U').charAt(0).toUpperCase()}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {requests.length > 0 && (
        <section className="slide-up">
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Solicitudes Recibidas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {requests.map((req) => (
              <div key={req._id} className="glass card-hover" style={{
                padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', borderRadius: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <UserAvatar userData={req.sender} size="large" />
                  <span style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-primary)' }}>
                    {req.sender?.username || req.sender_name}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '14px', background: 'var(--success-color)' }} onClick={() => respondRequest(req._id, 'accepted')}>
                    Aceptar
                  </button>
                  <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '14px' }} onClick={() => respondRequest(req._id, 'rejected')}>
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Mis Amigos
        </h3>
        {friends.length === 0 ? (
          <div className="glass" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg></p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>No tienes amigos aún. ¡Añade a alguien!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {friends.map((friend) => (
              <div key={friend._id || friend.id} className="glass card-hover" style={{
                padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserAvatar userData={friend} size="large" />
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '17px', display: 'block' }}>
                      {friend.username}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {friend.email ? friend.email : `@idk.tf`}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-icon" onClick={() => onSelectFriend(friend)} title="Chatear" style={{ background: 'var(--bg-secondary)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </button>
                  <button className="btn-icon" onClick={() => deleteFriend(friend._id || friend.id)} title="Eliminar amigo" style={{ background: 'rgba(255, 59, 48, 0.1)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error-color)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                  <button className="btn-icon" onClick={() => blockUser(friend._id || friend.id, friend.username)} title="Bloquear usuario" style={{ background: 'var(--bg-secondary)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="slide-up" style={{ animationDelay: '0.2s' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> Descubrir Usuarios
        </h3>
        <div className="glass" style={{ padding: '8px' }}>
          {users.map((u) => {
            const isFriend = friends.some(f => f._id === u._id || f.id === u._id);
            const hasRequest = requests.some(r => 
              r.sender?._id === u._id || r.receiver?._id === u._id ||
              r.sender_id === u._id || r.receiver_id === u._id
            );
            return (
              <div key={u._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderRadius: '16px', transition: 'background 0.2s'
              }} className="card-hover">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserAvatar userData={u} size="medium" />
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>{u.username}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isFriend && !hasRequest && (
                    <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px' }} onClick={() => sendRequest(u._id)}>
                      + Añadir
                    </button>
                  )}
                  {isFriend && <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Amigo</span>}
                  {hasRequest && !isFriend && <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Pendiente</span>}
                  <button className="btn-icon" onClick={() => blockUser(u._id, u.username)} title="Bloquear usuario" style={{ background: 'var(--bg-secondary)', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {blockedUsers.length > 0 && (
        <section className="slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Usuarios Bloqueados
          </h3>
          <div className="glass" style={{ padding: '8px' }}>
            {blockedUsers.map((u) => (
              <div key={u._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderRadius: '16px', transition: 'background 0.2s'
              }} className="card-hover">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <UserAvatar userData={u} size="medium" />
                  <div>
                    <span style={{ fontWeight: '600', fontSize: '16px', display: 'block' }}>{u.username}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</span>
                  </div>
                </div>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px', background: 'var(--success-color)', color: 'white' }} onClick={() => unblockUser(u._id)}>
                  Desbloquear
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Friends;