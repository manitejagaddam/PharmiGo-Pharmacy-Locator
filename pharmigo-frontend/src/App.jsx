import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/Admin';
import { getAuthToken } from './services/api';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = !!getAuthToken();
    if (!isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }
    return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public Search Page */}
          <Route index element={<Home />} />
          
          {/* Admin Flow */}
          <Route path="admin" element={<Login />} />
          <Route 
            path="admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
