// ─────────────────────────────────────────────────────────────
// STATIC / MOCK MODE
// All data is stored in-memory (resets on page refresh).
// Swap the functions below with real fetch() calls once the
// Django backend is running.
// ─────────────────────────────────────────────────────────────

// ── Auth helpers ──────────────────────────────────────────────
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.removeItem('adminToken');
  }
};

export const getAuthToken = () => localStorage.getItem('adminToken');

// ── In-memory store ───────────────────────────────────────────
let nextId = 4;
let mockMedicines = [
  { id: 1, name: 'Amoxicillin',  brand: 'Amoxil',   formula: 'C16H19N3O5S', description: 'Antibiotic used to treat bacterial infections.' },
  { id: 2, name: 'Paracetamol',  brand: 'Calpol',   formula: 'C8H9NO2',     description: 'Pain reliever and fever reducer.' },
  { id: 3, name: 'Ibuprofen',    brand: 'Advil',    formula: 'C13H18O2',    description: 'Nonsteroidal anti-inflammatory drug (NSAID).' },
];

// Small helper to simulate a tiny async delay so the UI feels real
const delay = (ms = 150) => new Promise(res => setTimeout(res, ms));

// ── API surface ───────────────────────────────────────────────
export const api = {

  // Public search (works without login)
  searchMedicines: async (query = '') => {
    await delay();
    const q = query.toLowerCase().trim();
    return q
      ? mockMedicines.filter(m => m.name.toLowerCase().includes(q))
      : [...mockMedicines];
  },

  // Static login — username: admin / password: admin
  login: async (username, password) => {
    await delay(300);
    if (username === 'admin' && password === 'admin') {
      return { token: 'static-dev-token-123' };
    }
    throw new Error('Invalid credentials');
  },

  // Admin CRUD — all operate on mockMedicines[]

  getMedicines: async () => {
    await delay();
    return [...mockMedicines];
  },

  createMedicine: async (data) => {
    await delay(200);
    if (!data.name || !data.name.trim()) {
      throw new Error('Name is required');
    }
    const newMed = { id: nextId++, ...data };
    mockMedicines.push(newMed);
    return { ...newMed };
  },

  updateMedicine: async (id, data) => {
    await delay(200);
    const idx = mockMedicines.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Medicine not found');
    mockMedicines[idx] = { ...mockMedicines[idx], ...data };
    return { ...mockMedicines[idx] };
  },

  deleteMedicine: async (id) => {
    await delay(200);
    const idx = mockMedicines.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Medicine not found');
    mockMedicines.splice(idx, 1);
    return true;
  },
};
