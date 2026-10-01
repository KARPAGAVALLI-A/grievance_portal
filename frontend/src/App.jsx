import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import GrievanceForm from './pages/GrievanceForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<GrievanceForm />} />
        <Route path="/grievance-form" element={<Navigate to="/register" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Backward-compatibility redirects for old HTML endpoints */}
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/grievance-form.html" element={<Navigate to="/register" replace />} />
        <Route path="/admin-login.html" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin-dashboard.html" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}
