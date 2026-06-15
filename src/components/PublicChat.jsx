import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL } from '../App';

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
      alert('¡Has sido baneado por spam!');
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
        {/* Messages Area */}
        <div style={{ 
          flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '48px', margin: '0 0 16px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></p>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>No hay mensajes aún. ¡Sé el primero!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const msgUsername = msg.user?.username || msg.username || 'Usuario';
              const isOwn = msgUsername === user.username;
              return (
                <div 
                  key={msg._id || index} 
                  className="chat-message"
                  style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', padding: '0 8px' }}>
                    {!isOwn && (
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                        {msgUsername}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(msg.createdAt || msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`bubble ${isOwn ? 'own' : 'other'}`}>
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '20px', borderTop: '1px solid var(--glass-border)', background: 'var(--bg-secondary)',
          borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px'
        }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={canSend ? "Escribe un mensaje en el canal público..." : "Espera unos segundos para volver a enviar..."}
              disabled={!canSend}
              style={{ flex: 1, borderRadius: '999px', padding: '14px 20px', fontSize: '15px' }}
            />
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!canSend}
              style={{ borderRadius: '999px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {canSend ? <><span style={{ marginRight: '8px' }}>Enviar</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></> : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PublicChat;
