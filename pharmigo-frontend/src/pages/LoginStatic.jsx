// LoginStatic.jsx — Static login page (no backend required)
// Credentials: username = admin / password = admin
// Swap App.jsx route to use this instead of Login.jsx for local testing.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { setAuthToken, getAuthToken } from '../services/api';

const STATIC_USERNAME = 'admin';
const STATIC_PASSWORD = 'admin';
const STATIC_TOKEN    = 'static-dev-token-123';

const LoginStatic = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error,    setError]    = useState('');
    const [loading,  setLoading]  = useState(false);
    const navigate = useNavigate();

    // Skip login page if already authenticated
    useEffect(() => {
        if (getAuthToken()) navigate('/admin/dashboard', { replace: true });
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate a tiny delay so the UI doesn't flash
        await new Promise(r => setTimeout(r, 400));

        if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
            setAuthToken(STATIC_TOKEN);
            navigate('/admin/dashboard', { replace: true });
        } else {
            setError('Invalid username or password. Use admin / admin.');
        }
        setLoading(false);
    };

    return (
        <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 1rem' }}>
            <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
                {/* Icon + title */}
                <div className="text-center mb-8">
                    <div style={{ display: 'inline-flex', background: '#E0F2FE', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                        <ShieldCheck size={32} color="var(--color-primary)" />
                    </div>
                    <h2>Admin Portal</h2>
                    <p className="text-muted mt-2">Sign in to manage inventory</p>
                    {/* Static mode badge */}
                    <span style={{
                        display: 'inline-block', marginTop: '0.75rem',
                        background: '#FEF9C3', color: '#713F12',
                        fontSize: '0.75rem', fontWeight: 600,
                        padding: '0.2rem 0.75rem', borderRadius: '99px',
                        border: '1px solid #FDE68A',
                    }}>
                        ⚡ Static / Dev Mode
                    </span>
                </div>

                {/* Error */}
                {error && (
                    <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} noValidate>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            placeholder="admin"
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            placeholder="admin"
                            required
                            disabled={loading}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        style={{ padding: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        disabled={loading}
                    >
                        {loading
                            ? <><Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Signing in…</>
                            : 'Sign In'}
                    </button>
                </form>

                <p className="text-muted text-center mt-6" style={{ fontSize: '0.8rem' }}>
                    Use <strong>admin</strong> / <strong>admin</strong> to log in.
                </p>
            </div>

            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default LoginStatic;
