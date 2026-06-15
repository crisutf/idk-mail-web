import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../App';

function Mail({ user, token, refreshKey = 0 }) {
  const [mails, setMails] = useState([]);
  const [showCompose, setShowCompose] = useState(false);
  const [receiver, setReceiver] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchMails();
  }, [token, refreshKey]);

  const fetchMails = async () => {
    try {
      const res = await axios.get(`${API_URL}/mails`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMails(res.data);
    } catch (error) {
      console.error('Error fetching mails:', error);
    }
  };

  const sendMail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('receiver', receiver);
      formData.append('subject', subject);
      formData.append('body', body);
      
      files.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(`${API_URL}/mails`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowCompose(false);
      setReceiver('');
      setSubject('');
      setBody('');
      setFiles([]);
      fetchMails();
    } catch (error) {
      alert('Error al enviar correo: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (mailId) => {
    try {
      await axios.put(`${API_URL}/mails/${mailId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMails();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const deleteMail = async (mailId, e) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres borrar este correo?')) {
      try {
        await axios.delete(`${API_URL}/mails/${mailId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchMails();
        if (selectedMail?._id === mailId) {
          setSelectedMail(null);
        }
      } catch (error) {
        alert('Error al borrar correo');
      }
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn-primary"
          onClick={() => setShowCompose(!showCompose)}
          style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {showCompose ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancelar</> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> Redactar</>}
        </button>
      </div>

      {showCompose && (
        <div className="glass-strong card-hover slide-up" style={{ padding: '32px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '22px' }}>Nuevo Correo</h3>
          <form onSubmit={sendMail} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Para (username o email)
              </label>
              <input value={receiver} onChange={(e) => setReceiver(e.target.value)} required placeholder="Ej: Crisu o usuario@idk.tf" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Asunto
              </label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Asunto del correo" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Mensaje
              </label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows="8" required placeholder="Escribe tu mensaje aquí..." style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Archivos Adjuntos
              </label>
              <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files))} />
              {files.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {files.map((file, i) => (
                    <span key={i} className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> {file.name} ({formatBytes(file.size)})</span>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Enviando...' : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Enviar</>}
            </button>
          </form>
        </div>
      )}

      {selectedMail ? (
        <div className="glass-strong slide-up" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '26px' }}>{selectedMail.subject}</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setSelectedMail(null)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg> Volver</button>
              <button className="btn-danger" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={(e) => deleteMail(selectedMail._id, e)}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '24px', background: 'var(--bg-tertiary)', borderRadius: '16px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '600', textTransform: 'uppercase' }}>De</p>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '16px' }}>{selectedMail.sender?.username || selectedMail.sender_name}@idk.tf</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '600', textTransform: 'uppercase' }}>Para</p>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '16px' }}>{selectedMail.receiver?.username || selectedMail.receiver_name}@idk.tf</p>
            </div>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: '600', textTransform: 'uppercase' }}>Fecha</p>
              <p style={{ margin: 0, fontWeight: '600', fontSize: '16px' }}>{formatDate(selectedMail.createdAt || selectedMail.sent_at)}</p>
            </div>
          </div>

          <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '16px', marginBottom: '24px', lineHeight: '1.7', fontSize: '16px', border: '1px solid var(--glass-border)' }}>
            {selectedMail.body.split('\n').map((line, i) => (
              <p key={i} style={{ margin: '0 0 12px' }}>{line || '\u00A0'}</p>
            ))}
          </div>

          {selectedMail.attachments && selectedMail.attachments.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> Adjuntos</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {selectedMail.attachments.map((file, i) => (
                  <a key={i} href={`${API_URL.replace('/api', '')}/${file.path}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg> {file.filename} <span style={{ color: 'var(--text-muted)' }}>({formatBytes(file.size)})</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {mails.length === 0 ? (
            <div className="glass" style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '24px', marginBottom: '8px' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></p>
              <p style={{ fontSize: '18px', fontWeight: '600' }}>No tienes correos aún</p>
            </div>
          ) : (
            mails.map((mail) => {
              const isReceived = mail.receiver?._id === user.id || mail.receiver_id === user.id;
              const isUnread = !mail.isRead && isReceived;
              
              return (
                <div 
                  key={mail._id}
                  className="glass card-hover"
                  onClick={() => { 
                    setSelectedMail(mail);
                    if (isUnread) markAsRead(mail._id);
                  }}
                  style={{
                    padding: '20px 24px',
                    cursor: 'pointer',
                    background: isUnread ? 'var(--bg-secondary)' : 'var(--glass-bg)',
                    borderLeft: isUnread ? '4px solid var(--primary-color)' : '4px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      {isUnread && <div style={{ width: '8px', height: '8px', background: 'var(--primary-color)', borderRadius: '50%' }}></div>}
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: isUnread ? '800' : '600', color: isUnread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {mail.subject}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {isReceived ? (mail.sender?.username || mail.sender_name) : `Para: ${mail.receiver?.username || mail.receiver_name}`}
                      </span>
                      <span>—</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {mail.body}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }}>
                      {formatDate(mail.createdAt || mail.sent_at)}
                    </span>
                    <button className="btn-icon" style={{ width: '36px', height: '36px', background: 'transparent', border: 'none', color: 'var(--error-color)' }} onClick={(e) => deleteMail(mail._id, e)} title="Eliminar">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Mail;
