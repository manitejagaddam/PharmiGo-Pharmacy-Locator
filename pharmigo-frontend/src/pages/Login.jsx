import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { api, setAuthToken } from '../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await api.login(username, password);
            setAuthToken(data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in flex items-center justify-center p-4">
            <div className="glass-panel" style={{
                maxWidth: '400px',
                width: '100%',
                padding: '2.5rem',
                marginTop: '4rem'
            }}>
                <div className="text-center mb-8">
                    <div style={{
                        display: 'inline-flex',
                        background: '#E0F2FE',
                        padding: '1rem',
                        borderRadius: '50%',
                        marginBottom: '1rem'
                    }}>
                        <ShieldCheck size={32} color="var(--color-primary)" />
                    </div>
                    <h2>Admin Portal</h2>
                    <p className="text-muted mt-2">Sign in to manage inventory</p>
                </div>

                {error && (
                    <div style={{
                        background: '#FEF2F2',
                        color: '#991B1B',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="form-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
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
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary w-full"
                        style={{ padding: '0.85rem' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Login;
