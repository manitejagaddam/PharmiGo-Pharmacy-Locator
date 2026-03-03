import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, LogOut, ShieldCheck } from 'lucide-react';
import { getAuthToken, api } from '../services/api_dynamic';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!getAuthToken();
  const isAdminRoute = location.pathname.includes('/admin');

  const handleLogout = () => {
    api.logout();
    navigate('/');
  };

  return (
    <div className="app-container">
      <header style={{ 
        backgroundColor: 'var(--color-bg-white)',
        borderBottom: '1px solid var(--color-border)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))',
                padding: '0.5rem',
                borderRadius: '10px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <HeartPulse size={24} />
            </div>
            <span style={{ 
                fontSize: '1.5rem', 
                fontWeight: 800, 
                color: 'var(--color-primary-dark)',
                letterSpacing: '-0.5px'
            }}>
                Pharmigo
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             {!isAdminRoute && (
                  <Link to="/admin" className="btn btn-ghost" style={{ fontSize: '0.9rem' }}>
                    <ShieldCheck size={18} /> Admin Portal
                  </Link>
             )}
             
            {isAdminRoute && isAuthenticated && (
               <button onClick={handleLogout} className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                 <LogOut size={18} /> Logout
               </button>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content fade-in">
        <Outlet />
      </main>

      <footer style={{
          backgroundColor: 'var(--color-primary-dark)',
          color: 'rgba(255,255,255,0.7)',
          padding: '2rem',
          textAlign: 'center',
          marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
             <HeartPulse size={32} style={{ opacity: 0.5, marginBottom: '1rem' }} />
             <p>© {new Date().getFullYear()} Pharmigo Healthcare Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
