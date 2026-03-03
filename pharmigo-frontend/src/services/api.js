const API_URL = 'http://127.0.0.1:8000';

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('adminToken', token);
  } else {
    localStorage.removeItem('adminToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

const getHeaders = (requireAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }
  
  return headers;
};

export const api = {
  // Public
  searchMedicines: async (query = '') => {
    try {
      const response = await fetch(`${API_URL}/api/medicines/?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch medicines');
      return await response.json();
    } catch (error) {
      console.error('API Error (searchMedicines):', error);
      throw error;
    }
  },

  // Auth
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/api-token-auth/`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('Invalid credentials');
      return await response.json();
    } catch (error) {
       console.error('API Error (login):', error);
       throw error;
    }
  },

  // Admin CRUD
  getMedicines: async () => {
    try {
      const response = await fetch(`${API_URL}/api/medicines/`, {
          headers: getHeaders(true)
      });
      if (!response.ok) throw new Error('Failed to fetch medicines');
      return await response.json();
    } catch (error) {
      console.error('API Error (getMedicines):', error);
      throw error;
    }
  },

  createMedicine: async (data) => {
    try {
      const response = await fetch(`${API_URL}/api/medicines/`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create medicine');
      return await response.json();
    } catch (error) {
        console.error('API Error (createMedicine):', error);
        throw error;
    }
  },

  updateMedicine: async (id, data) => {
    try {
      const response = await fetch(`${API_URL}/api/medicines/${id}/`, {
        method: 'PUT', // or PATCH
        headers: getHeaders(true),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update medicine');
      return await response.json();
    } catch (error) {
        console.error('API Error (updateMedicine):', error);
        throw error;
    }
  },

  deleteMedicine: async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/medicines/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      if (!response.ok) throw new Error('Failed to delete medicine');
      return true;
    } catch (error) {
        console.error('API Error (deleteMedicine):', error);
        throw error;
    }
  }
};
