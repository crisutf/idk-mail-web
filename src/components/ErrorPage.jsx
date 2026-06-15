import React from 'react';
import { useNavigate } from 'react-router-dom';

function ErrorPage({ statusCode, title, description }) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (statusCode) {
      case 401: 
        return <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--warning-color)'}}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
      case 403: 
        return <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--error-color)'}}><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>;
      case 404: 
        return <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--primary-color)'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
      default: 
        return <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--warning-color)'}}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    }
  };

  const defaultTitle = () => {
    switch (statusCode) {
      case 401: return 'No autorizado';
      case 403: return 'Acceso prohibido';
      case 404: return 'Página no encontrada';
      default: return 'Error';
    }
  };

  const defaultDescription = () => {
    switch (statusCode) {
      case 401: return 'Necesitas iniciar sesión para acceder a esta página.';
      case 403: return 'No tienes permisos para acceder a esta sección.';
      case 404: return 'Lo sentimos, la página que buscas no existe.';
      default: return 'Ha ocurrido un error inesperado.';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="glass-strong pop-in" style={{ 
        padding: '64px 48px', 
        maxWidth: '500px', 
        width: '100%',
        textAlign: 'center',
        borderRadius: '32px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          {getIcon()}
        </div>
        
        <h1 style={{ 
          fontSize: '80px', 
          fontWeight: '900',
          background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: '0 0 8px 0',
          letterSpacing: '-2px'
        }}>
          {statusCode}
        </h1>
        
        <h2 style={{ 
          fontSize: '28px', 
          fontWeight: '800',
          color: 'var(--text-primary)',
          margin: '0 0 16px 0',
          letterSpacing: '-0.5px'
        }}>
          {title || defaultTitle()}
        </h2>
        
        <p style={{ 
          fontSize: '16px',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          margin: '0 0 40px 0'
        }}>
          {description || defaultDescription()}
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary"
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Ir al inicio
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
