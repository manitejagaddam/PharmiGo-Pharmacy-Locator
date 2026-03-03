import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ShieldAlert, Pill, FileText, Beaker, Factory } from 'lucide-react';
import { api, getAuthToken } from '../services/api';

const AdminDashboard = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingMed, setEditingMed] = useState(null);
    const [formData, setFormData] = useState({ name: '', brand: '', formula: '', description: '' });

    const navigate = useNavigate();

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const data = await api.getMedicines();
            setMedicines(data);
        } catch (err) {
            setError('Failed to load medicines. Please check your connection or login again.');
            if (err.message.includes('401') || err.message.includes('403')) {
                navigate('/admin');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!getAuthToken()) {
            navigate('/admin');
            return;
        }
        fetchMedicines();
    }, [navigate]);

    const handleOpenModal = (med = null) => {
        if (med) {
            setEditingMed(med);
            setFormData({
                name: med.name || '',
                brand: med.brand || '',
                formula: med.formula || '',
                description: med.description || ''
            });
        } else {
            setEditingMed(null);
            setFormData({ name: '', brand: '', formula: '', description: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMed(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMed) {
                await api.updateMedicine(editingMed.id, formData);
            } else {
                await api.createMedicine(formData);
            }
            fetchMedicines();
            handleCloseModal();
        } catch (err) {
            alert('Failed to save medicine. Please ensure all required fields are valid.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
            try {
                await api.deleteMedicine(id);
                fetchMedicines();
            } catch (err) {
                alert('Failed to delete medicine.');
            }
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
             <ShieldAlert size={48} color="var(--color-primary-light)" style={{ opacity: 0.5, animation: 'pulse 2s infinite' }} />
        </div>
    );

    return (
        <div className="fade-in min-h-[1000px] max-h-screen ">
            <div className="min-h-[100px] max-h-screen flex justify-between items-center mb-8">
                <div>
                     <h2>Inventory Management</h2>
                     <p className="text-muted mt-1">Manage medicines, edit details, and add new products.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="btn btn-primary">
                    <Plus size={20} /> Add New Medicine
                </button>
            </div>

            {error ? (
                <div style={{ background: '#FEF2F2', color: '#991B1B', padding: '1.5rem', borderRadius: '12px', border: '1px solid #FCA5A5' }}>
                    {error}
                </div>
            ) : (
                <div className="min-h-[100px] max-h-screen data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Formula</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.map((med) => (
                                <tr key={med.id}>
                                    <td className="text-muted">#{med.id}</td>
                                    <td style={{ fontWeight: 500, color: 'var(--color-primary-dark)' }}>{med.name}</td>
                                    <td>{med.brand || '-'}</td>
                                    <td>{med.formula || '-'}</td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(med)} 
                                                className="btn btn-ghost" 
                                                style={{ padding: '0.4rem' }}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} color="var(--color-primary)" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(med.id)} 
                                                className="btn btn-ghost" 
                                                style={{ padding: '0.4rem' }}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} color="var(--color-danger)" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {medicines.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted" style={{ padding: '3rem' }}>
                                         No medicines found in the inventory. Click "Add New Medicine" to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    overflowY: 'auto',
                }}>
                    {/* Inner wrapper — 100vh ensures centering works on all screen sizes */}
                    <div style={{
                        minHeight: '100vh',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '2rem 1rem',
                    }}>
                        <div className="glass-panel slide-up" style={{
                            maxWidth: '500px', width: '100%', padding: '2rem',
                            background: 'var(--color-bg-white)',
                        }}>
                        <h3 className="mb-6 flex items-center gap-2">
                             {editingMed ? <Edit2 size={24} color="var(--color-primary)" /> : <Plus size={24} color="var(--color-primary)" />}
                             {editingMed ? 'Edit Medicine' : 'Add New Medicine'}
                        </h3>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label flex items-center gap-2"><Pill size={16} /> Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label flex items-center gap-2"><Factory size={16} /> Brand</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label flex items-center gap-2"><Beaker size={16} /> Formula</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.formula}
                                    onChange={(e) => setFormData({...formData, formula: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label flex items-center gap-2"><FileText size={16} /> Description</label>
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    style={{ resize: 'vertical' }}
                                ></textarea>
                            </div>
                            
                            <div className="flex justify-end gap-4 mt-8">
                                <button type="button" className="btn btn-ghost" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingMed ? 'Save Changes' : 'Create Medicine'}
                                </button>
                            </div>
                        </form>
                        </div>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: .5; transform: scale(0.9); }
                }
                .slide-up {
                    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
