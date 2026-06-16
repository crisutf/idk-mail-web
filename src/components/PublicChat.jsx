import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL, getAvatarUrl } from '../App';

function PublicChat({ user, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [canSend, setCanSend] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const SOCKET_URL = 'https://api-idk-mail-services.crisu.qzz.io:2053';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/messages/public`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.emit('authenticate', token);

    socket.on('public-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('banned', () => {
      alert('Has sido baneado por spam!');
      window.location.reload();
    });

    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !canSend) return;

    socketRef.current.emit('public-message', { message: input });
    setInput('');
    setCanSend(false);

    setTimeout(() => {
      setCanSend(true);
    }, 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="glass-strong slide-up" style={{ 
        display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', borderRadius: '24px'
      }}>
        <div style={{ 
          display: 'flex', alignItems: 'center', padding: '16px 24px', 
          borderBottom: '1px solid var(--glass-border)', background: 'var(--glass-bg)',
          gap: '16px'
        }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            color: 'white', fontWeight: '900', fontSize: '24px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            💬
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Chat Público</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Todos los usuarios</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '48px', margin: '0 0 16px' }}>👋</p>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>No hay mensajes aún. ¡Sé el primero!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.user?._id === user.id || msg.user_id === user.id;
              return (
                <div key={msg._id || index} className="chat-message" style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', gap: '4px' }}>
                  {!isMine && (
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', padding: '0 4px' }}>
                      {msg.user?.username || msg.username || 'Usuario'}
                    </span>
                  )}
                  <div className={`bubble ${isMine ? 'own' : 'other'}`}>
                    {msg.message}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '0 4px' }}>
                    {new Date(msg.createdAt || msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-secondary)', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={canSend ? "Escribe un mensaje..." : "Espera..."}
              disabled={!canSend}
              style={{ flex: 1, borderRadius: '999px', padding: '14px 20px', fontSize: '15px' }}
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: '999px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '120px' }} disabled={!canSend}>
              <span style={{ marginRight: '8px' }}>{canSend ? 'Enviar' : '⏳'}</span>
              {canSend && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PublicChat;