// AppDynamic.jsx — Fully dynamic app mode (requires Django backend)
// Swap main.jsx import to use this when the backend is running.
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout        from './components/Layout';
import Home          from './pages/Home';
import Login         from './pages/Login';
import AdminDashboard from './pages/Admin';
import { getAuthToken } from './services/api_dynamic'; // ← real auth check

const ProtectedRoute = ({ children }) => {
  return getAuthToken() ? children : <Navigate to="/admin" replace />;
};

function AppDynamic() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="admin" element={<Login />} />
          <Route path="admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppDynamic;
