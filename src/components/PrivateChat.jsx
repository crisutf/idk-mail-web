import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { API_URL, getAvatarUrl } from '../App';

function PrivateChat({ user, token, friend, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const SOCKET_URL = 'https://api-idk-mail-services.crisu.qzz.io:2053';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/messages/private/${friend._id || friend.id}`, {
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

    socket.on('private-message', (message) => {
      const isRelevant = 
        (message.sender?._id === user.id && message.receiver?._id === (friend._id || friend.id)) ||
        (message.sender?._id === (friend._id || friend.id) && message.receiver?._id === user.id) ||
        (message.sender_id === user.id && message.receiver_id === (friend._id || friend.id)) ||
        (message.sender_id === (friend._id || friend.id) && message.receiver_id === user.id);
      
      if (isRelevant) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => socket.disconnect();
  }, [token, friend, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    socketRef.current.emit('private-message', {
      receiverId: friend._id || friend.id,
      message: input
    });

    setInput('');
  };

  const friendAvatarUrl = getAvatarUrl(friend.avatar);

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
          {friendAvatarUrl ? (
            <img 
              src={friendAvatarUrl} 
              alt={friend.username} 
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              color: 'white', fontWeight: '800', fontSize: '20px'
            }}>
              {friend.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{friend.username}</h2>
            {friend.email && <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{friend.email}</p>}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '48px', margin: '0 0 16px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></p>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>No hay mensajes aún. ¡Envía el primero!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.sender?._id === user.id || msg.sender_id === user.id || (msg.sender && msg.sender._id === user.id);
              
              return (
                <div key={msg._id || index} className="chat-message" style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                  <div className={`bubble ${isMine ? 'own' : 'other'}`}>
                    {msg.message}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
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
              placeholder={`Escribe un mensaje a ${friend.username}...`}
              style={{ flex: 1, borderRadius: '999px', padding: '14px 20px', fontSize: '15px' }}
            />
            <button type="submit" className="btn-primary" style={{ borderRadius: '999px', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ marginRight: '8px' }}>Enviar</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PrivateChat;
