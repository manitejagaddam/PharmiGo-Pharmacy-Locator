// AppStatic.jsx — Fully static app mode (no backend required)
// All data is in-memory mock. Swap main.jsx import to use this.
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout     from './components/Layout';
import HomeStatic  from './pages/HomeStatic';
import LoginStatic from './pages/LoginStatic';
import AdminStatic from './pages/AdminStatic';
import { getAuthToken } from './services/api'; // ← static mock token

const ProtectedRoute = ({ children }) => {
  return getAuthToken() ? children : <Navigate to="/admin" replace />;
};

function AppStatic() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeStatic />} />
          <Route path="admin" element={<LoginStatic />} />
          <Route path="admin/dashboard" element={<ProtectedRoute><AdminStatic /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppStatic;
