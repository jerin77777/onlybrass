import React, { useState } from 'react';
import './Admin.css';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple authentication logic
    if (username === 'admin' && password === 'admin') {
      onLogin(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="admin-login-container" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f9fa',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div className="admin-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
        background: '#fff'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="/assets/logo.png" alt="ONLYBRASS" style={{ height: '40px', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>ADMIN PORTAL</h2>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1.5px solid #f0f0f5',
                background: '#f7f7fa',
                fontSize: '1rem',
                marginTop: '0.5rem'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: '1.5px solid #f0f0f5',
                background: '#f7f7fa',
                fontSize: '1rem',
                marginTop: '0.5rem'
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#ff4d4d', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600 }}>
              {error}
            </p>
          )}

          <button type="submit" className="admin-btn btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1rem' }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
