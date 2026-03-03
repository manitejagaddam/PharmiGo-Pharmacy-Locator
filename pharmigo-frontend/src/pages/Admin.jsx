import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Edit2, Trash2, ShieldAlert, Pill, FileText, Beaker,
  Factory, Search, ArrowUpDown, Loader2, CheckCircle2, XCircle,
} from 'lucide-react';
import { api, getAuthToken, createScope, cancelScope } from '../services/api_dynamic';

const ORDERING_OPTIONS = [
  { label: 'Name (A–Z)',   value: 'name' },
  { label: 'Name (Z–A)',   value: '-name' },
  { label: 'Newest first', value: '-created_at' },
  { label: 'Oldest first', value: 'created_at' },
];

const EMPTY_FORM = { name: '', brand: '', formula: '', description: '' };

// ── Toast component ────────────────────────────────────────────
const Toast = ({ toast }) =>
  toast ? (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem',
      background: toast.type === 'success' ? '#D1FAE5' : '#FEE2E2',
      color:      toast.type === 'success' ? '#065F46' : '#991B1B',
      padding: '1rem 1.5rem', borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      zIndex: 2000, fontWeight: 500,
      animation: 'slideInRight 0.3s ease',
    }}>
      {toast.type === 'success'
        ? <CheckCircle2 size={20} />
        : <XCircle size={20} />}
      {toast.message}
    </div>
  ) : null;

// ── Main component ─────────────────────────────────────────────
const AdminDashboard = () => {
  const [medicines,  setMedicines]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [search,     setSearch]     = useState('');
  const [ordering,   setOrdering]   = useState('name');
  const [toast,      setToast]      = useState(null);

  // Modal
  const [showModal,  setShowModal]  = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData,   setFormData]   = useState(EMPTY_FORM);
  const [formError,  setFormError]  = useState('');

  // Delete in-progress tracking
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  // ── Toast helper ─────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ────────────────────────────────────────────────────
  const fetchMedicines = useCallback(async (q = search, ord = ordering) => {
    const signal = createScope('admin-list');
    setLoading(true);
    setError('');
    try {
      const data = await api.getMedicines({ search: q, ordering: ord, signal });
      const items = Array.isArray(data) ? data : (data?.results ?? []);
      setMedicines(items);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Failed to load medicines.');
      if (err.status === 401 || err.status === 403) navigate('/admin');
    } finally {
      setLoading(false);
    }
  }, [navigate, search, ordering]);

  useEffect(() => {
    if (!getAuthToken()) { navigate('/admin'); return; }
    fetchMedicines('', 'name');
    return () => cancelScope('admin-list');
  }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ordering / search filter ─────────────────────────────────
  const handleOrdering = (e) => {
    const val = e.target.value;
    setOrdering(val);
    fetchMedicines(search, val);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    fetchMedicines(search, ordering);
  };

  // ── Modal helpers ────────────────────────────────────────────
  const openModal = (med = null) => {
    setEditingMed(med);
    setFormData(med
      ? { name: med.name || '', brand: med.brand || '', formula: med.formula || '', description: med.description || '' }
      : EMPTY_FORM
    );
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingMed(null); };

  // ── Submit (create / patch) ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setFormError('Medicine name is required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingMed) {
        await api.patchMedicine(editingMed.id, formData);
        showToast('Medicine updated successfully.');
      } else {
        await api.createMedicine(formData);
        showToast('Medicine created successfully.');
      }
      closeModal();
      fetchMedicines();
    } catch (err) {
      setFormError(err.message || 'Failed to save. Check all fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.deleteMedicine(id);
      showToast('Medicine deleted.', 'success');
      fetchMedicines();
    } catch (err) {
      showToast(err.message || 'Failed to delete medicine.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="fade-in">
      {/* Header row */}
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Inventory Management</h2>
          <p className="text-muted mt-1">Manage medicines, edit details, and add new products.</p>
        </div>
        <button onClick={() => openModal()} className="btn btn-primary">
          <Plus size={20} /> Add New Medicine
        </button>
      </div>

      {/* Toolbar: search + ordering */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search medicines…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', margin: 0 }}
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown size={18} style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={ordering}
            onChange={handleOrdering}
            style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-white)', fontSize: '0.9rem' }}
          >
            {ORDERING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>Filter</button>
      </form>

      {/* Error banner */}
      {error && (
        <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #FCA5A5', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="data-table-container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={36} color="var(--color-primary-light)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Formula</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med.id}>
                  <td className="text-muted">#{med.id}</td>
                  <td style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{med.name}</td>
                  <td>{med.brand   || <span className="text-muted">—</span>}</td>
                  <td>{med.formula || <span className="text-muted">—</span>}</td>
                  <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {med.description || <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openModal(med)} className="btn btn-ghost" style={{ padding: '0.4rem' }} title="Edit">
                        <Edit2 size={16} color="var(--color-primary)" />
                      </button>
                      <button
                        onClick={() => handleDelete(med.id)}
                        className="btn btn-ghost"
                        style={{ padding: '0.4rem' }}
                        title="Delete"
                        disabled={deletingId === med.id}
                      >
                        {deletingId === med.id
                          ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                          : <Trash2 size={16} color="var(--color-danger)" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {medicines.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted" style={{ padding: '3rem' }}>
                    No medicines found. {!search && 'Click "Add New Medicine" to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Record count */}
      {!loading && medicines.length > 0 && (
        <p className="text-muted mt-4" style={{ fontSize: '0.9rem' }}>
          {medicines.length} record{medicines.length !== 1 ? 's' : ''} shown
        </p>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          zIndex: 1000, overflowY: 'auto',
        }}>
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div className="glass-panel" style={{ maxWidth: '500px', width: '100%', padding: '2rem', background: 'var(--color-bg-white)', animation: 'slideUp 0.25s ease' }}>
              <h3 className="mb-6 flex items-center gap-2">
                {editingMed ? <Edit2 size={24} color="var(--color-primary)" /> : <Plus size={24} color="var(--color-primary)" />}
                {editingMed ? 'Edit Medicine' : 'Add New Medicine'}
              </h3>

              {formError && (
                <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2"><Pill size={16} /> Name *</label>
                  <input type="text" className="form-input" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2"><Factory size={16} /> Brand</label>
                  <input type="text" className="form-input" value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2"><Beaker size={16} /> Formula</label>
                  <input type="text" className="form-input" value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label flex items-center gap-2"><FileText size={16} /> Description</label>
                  <textarea className="form-input" rows="4" value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ resize: 'vertical' }} />
                </div>
                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" className="btn btn-ghost" onClick={closeModal} disabled={saving}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving
                      ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                      : (editingMed ? 'Save Changes' : 'Create Medicine')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
