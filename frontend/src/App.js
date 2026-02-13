import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from './components/ui/sonner';

import PublicLayout from './components/layouts/PublicLayout';
import DashboardLayout from './components/layouts/DashboardLayout';
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';
import MedicinesPage from './pages/dashboard/MedicinesPage';
import AddMedicinePage from './pages/dashboard/AddMedicinePage';
import SuppliersPage from './pages/dashboard/SuppliersPage';
import SalesPage from './pages/dashboard/SalesPage';
import CreateBillPage from './pages/dashboard/CreateBillPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import SettingsPage from './pages/dashboard/SettingsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                user?.role === 'owner' ? <OwnerDashboard /> : <StaffDashboard />
              }
            />
            <Route
              path="medicines"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <MedicinesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="add-medicine"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <AddMedicinePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="suppliers"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />
            <Route path="sales" element={<SalesPage />} />
            <Route path="create-bill" element={<CreateBillPage />} />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;