import React, { useState, useEffect } from 'react';
import { Search, Pill, Building2, Beaker, Frown, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const Home = () => {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMedicines = async (searchQuery) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.searchMedicines(searchQuery);
      setMedicines(data);
    } catch (err) {
      setError('Unable to fetch medicines. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMedicines('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(query);
  };

  return (
    <div className="fade-in h-screen max-h-screen">
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 4rem',
        background: 'linear-gradient(to bottom, var(--color-bg-white), var(--color-bg-light))',
        borderRadius: '24px',
        marginBottom: '3rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h1 style={{ 
            fontSize: '3rem', 
            color: 'var(--color-primary-dark)',
            marginBottom: '1rem'
        }}>
          Find Your Medication
        </h1>
        <p style={{ 
            color: 'var(--color-text-muted)', 
            fontSize: '1.2rem', 
            maxWidth: '600px', 
            margin: '0 auto 2.5rem' 
        }}>
          Search our comprehensive database of pharmaceutical products safely and securely.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{
            display: 'flex',
            maxWidth: '600px',
            margin: '0 auto',
            position: 'relative'
        }}>
          <div style={{
              position: 'absolute',
              left: '1.25rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)'
          }}>
             <Search size={22} />
          </div>
          <input 
            type="text" 
            placeholder="Search by medicine name..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
                width: '100%',
                padding: '1.25rem 1rem 1.25rem 3.5rem',
                fontSize: '1.1rem',
                border: '2px solid transparent',
                borderRadius: '99px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                outline: 'none',
                transition: 'all var(--transition-normal)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary-light)'}
            onBlur={(e) => e.target.style.borderColor = 'transparent'}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{
                position: 'absolute',
                right: '0.5rem',
                top: '0.5rem',
                bottom: '0.5rem',
                borderRadius: '99px',
                padding: '0 1.5rem',
                fontSize: '1rem'
            }}
          >
            Search
          </button>
        </form>
      </section>

      {/* Results Section */}
      <section style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h3 className="mb-6 flex items-center gap-2">
            <Pill size={24} color="var(--color-primary)" /> 
            Available Medicines ({medicines.length})
        </h3>
        
        {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
               <Loader2 size={40} color="var(--color-primary-light)" style={{ animation: 'spin 1s linear infinite' }} />
             </div>
        ) : error ? (
            <div style={{
                background: '#FEF2F2',
                color: '#991B1B',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #FCA5A5',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <Frown size={24} /> {error}
            </div>
        ) : medicines.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-text-muted)' }}>
                <Search size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <p>No medicines found matching "{query}".</p>
            </div>
        ) : (
             <div style={{ display: 'grid', gap: '1.5rem' }}>
                {medicines.map(med => (
                    <div key={med.id} className="glass-panel" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'transform var(--transition-fast)',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div className="flex justify-between items-center">
                            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>{med.name}</h2>
                            <span style={{ 
                                background: '#E0F2FE', 
                                color: '#0369A1',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '99px',
                                fontSize: '0.85rem',
                                fontWeight: 600
                            }}>
                                ID: {med.id}
                            </span>
                        </div>
                        
                        <div className="flex" style={{ gap: '2rem', flexWrap: 'wrap' }}>
                             {med.brand && (
                                 <div className="flex items-center gap-2 text-muted">
                                     <Building2 size={18} />
                                     <span><strong>Brand:</strong> {med.brand}</span>
                                 </div>
                             )}
                             {med.formula && (
                                 <div className="flex items-center gap-2 text-muted">
                                     <Beaker size={18} />
                                     <span><strong>Formula:</strong> {med.formula}</span>
                                 </div>
                             )}
                        </div>

                        {med.description && (
                            <div style={{ 
                                borderTop: '1px solid var(--color-border)', 
                                paddingTop: '1rem',
                                marginTop: '0.5rem',
                                color: 'var(--color-text-main)'
                            }}>
                                <p>{med.description}</p>
                            </div>
                        )}
                    </div>
                ))}
             </div>
        )}
      </section>

      {/* Basic spin animation css since index.css doesn't have it explicitly mapped to that classname */}
      <style>{`
        @keyframes spin {
            100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Home;
