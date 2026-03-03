// HomeStatic.jsx — Public search page using in-memory mock data (no backend needed)
import React, { useState, useEffect, useRef } from 'react';
import { Search, Pill, Building2, Beaker, Frown, Loader2, SlidersHorizontal } from 'lucide-react';
import { api } from '../services/api'; // ← static mock

const ORDERING_OPTIONS = [
  { label: 'Name (A–Z)', value: 'name' },
  { label: 'Name (Z–A)', value: '-name' },
];

const HomeStatic = () => {
  const [query,     setQuery]     = useState('');
  const [ordering,  setOrdering]  = useState('name');
  const [medicines, setMedicines] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const debounceRef = useRef(null);

  const fetchMedicines = async (search = '', order = 'name') => {
    setLoading(true); setError('');
    try {
      let data = await api.searchMedicines(search);
      // Client-side ordering since mock doesn't support server ordering
      if (order === '-name') data = [...data].sort((a, b) => b.name.localeCompare(a.name));
      else data = [...data].sort((a, b) => a.name.localeCompare(b.name));
      setMedicines(data);
    } catch { setError('Unable to fetch medicines.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMedicines('', 'name'); }, []);

  const handleQueryChange = (e) => {
    const val = e.target.value; setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchMedicines(val, ordering), 350);
  };
  const handleOrdering = (e) => { setOrdering(e.target.value); fetchMedicines(query, e.target.value); };
  const handleSearch   = (e) => { e.preventDefault(); clearTimeout(debounceRef.current); fetchMedicines(query, ordering); };

  return (
    <div className="fade-in">
      <section style={{ textAlign:'center', padding:'3rem 1rem 4rem', background:'linear-gradient(to bottom, var(--color-bg-white), var(--color-bg-light))', borderRadius:'24px', marginBottom:'3rem', boxShadow:'var(--shadow-sm)' }}>
        <h1 style={{ fontSize:'3rem', color:'var(--color-primary-dark)', marginBottom:'1rem' }}>Find Your Medication</h1>
        <p style={{ color:'var(--color-text-muted)', fontSize:'1.2rem', maxWidth:'600px', margin:'0 auto 2.5rem' }}>
          Search our comprehensive database of pharmaceutical products safely and securely.
        </p>
        <form onSubmit={handleSearch} style={{ display:'flex', maxWidth:'600px', margin:'0 auto', position:'relative' }}>
          <div style={{ position:'absolute', left:'1.25rem', top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)' }}><Search size={22} /></div>
          <input type="text" placeholder="Search by medicine name…" value={query} onChange={handleQueryChange}
            style={{ width:'100%', padding:'1.25rem 1rem 1.25rem 3.5rem', fontSize:'1.1rem', border:'2px solid transparent', borderRadius:'99px', boxShadow:'0 10px 25px -5px rgba(0,0,0,0.1)', outline:'none', transition:'all var(--transition-normal)' }}
            onFocus={e => e.target.style.borderColor='var(--color-primary-light)'}
            onBlur={e  => e.target.style.borderColor='transparent'} />
          <button type="submit" className="btn btn-primary" style={{ position:'absolute', right:'0.5rem', top:'0.5rem', bottom:'0.5rem', borderRadius:'99px', padding:'0 1.5rem' }}>Search</button>
        </form>
      </section>

      <section style={{ maxWidth:'900px', margin:'0 auto' }}>
        <div className="flex justify-between items-center mb-6" style={{ flexWrap:'wrap', gap:'1rem' }}>
          <h3 className="flex items-center gap-2"><Pill size={24} color="var(--color-primary)" />{loading ? 'Loading…' : `${medicines.length} Medicine${medicines.length!==1?'s':''} found`}</h3>
          <div className="flex items-center gap-2" style={{ color:'var(--color-text-muted)' }}>
            <SlidersHorizontal size={18} />
            <select value={ordering} onChange={handleOrdering} style={{ padding:'0.4rem 0.75rem', borderRadius:'8px', border:'1px solid var(--color-border)', fontSize:'0.9rem', background:'var(--color-bg-white)', cursor:'pointer' }}>
              {ORDERING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'4rem 0' }}>
            <Loader2 size={40} color="var(--color-primary-light)" style={{ animation:'spin 1s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ background:'#FEF2F2', color:'#991B1B', padding:'1.5rem', borderRadius:'12px', border:'1px solid #FCA5A5', display:'flex', alignItems:'center', gap:'1rem' }}>
            <Frown size={24} /> {error}
          </div>
        ) : medicines.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem 0', color:'var(--color-text-muted)' }}>
            <Search size={48} style={{ opacity:0.2, margin:'0 auto 1rem', display:'block' }} />
            <p>{query ? `No medicines found matching "${query}".` : 'No medicines in the database yet.'}</p>
          </div>
        ) : (
          <div style={{ display:'grid', gap:'1.5rem' }}>
            {medicines.map(med => (
              <div key={med.id} className="glass-panel" style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem', transition:'transform var(--transition-fast)', cursor:'default' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                <div className="flex justify-between items-center">
                  <h2 style={{ fontSize:'1.5rem', color:'var(--color-primary)' }}>{med.name}</h2>
                  <span style={{ background:'#E0F2FE', color:'#0369A1', padding:'0.25rem 0.75rem', borderRadius:'99px', fontSize:'0.85rem', fontWeight:600 }}>ID: {med.id}</span>
                </div>
                <div className="flex" style={{ gap:'2rem', flexWrap:'wrap' }}>
                  {med.brand   && <div className="flex items-center gap-2 text-muted"><Building2 size={18}/><span><strong>Brand:</strong> {med.brand}</span></div>}
                  {med.formula && <div className="flex items-center gap-2 text-muted"><Beaker   size={18}/><span><strong>Formula:</strong> {med.formula}</span></div>}
                </div>
                {med.description && <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:'1rem', marginTop:'0.5rem' }}><p>{med.description}</p></div>}
              </div>
            ))}
          </div>
        )}
      </section>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
export default HomeStatic;
