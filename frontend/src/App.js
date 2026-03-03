import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/sonner";

import PublicLayout from "./components/layouts/PublicLayout";
import DashboardLayout from "./components/layouts/DashboardLayout";
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ServicesPage from "./pages/public/ServicesPage";
import ContactPage from "./pages/public/ContactPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import OTPVerificationPage from "./pages/auth/OTPVerificationPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import OwnerDashboard from "./pages/dashboard/OwnerDashboard";
import MedicinesPage from "./pages/dashboard/MedicinesPage";
import AddMedicinePage from "./pages/dashboard/AddMedicinePage";
import SuppliersPage from "./pages/dashboard/SuppliersPage";
import SalesPage from "./pages/dashboard/SalesPage";
import CreateBillPage from "./pages/dashboard/CreateBillPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import StoreProfilePage from "./pages/dashboard/StoreProfilePage";
import CustomersPage from "./pages/dashboard/CustomersPage";           // added
import LedgerSummaryPage from "./pages/dashboard/LedgerSummaryPage";   // added
import LedgerStatementPage from "./pages/dashboard/LedgerStatementPage"; // added

// Protects routes that require a logged-in user with a verified store
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* ── Public pages ───────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* ── Auth pages ─────────────────────────────── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OTPVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── Dashboard (protected) ──────────────────── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* All users are owners now — go straight to OwnerDashboard */}
            <Route index element={<OwnerDashboard />} />
            <Route path="medicines" element={<MedicinesPage />} />
            <Route path="add-medicine" element={<AddMedicinePage />} />
            <Route path="add-medicine/:id" element={<AddMedicinePage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="sales" element={<SalesPage />} />
            <Route path="create-bill" element={<CreateBillPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="store-profile" element={<StoreProfilePage />} />
            <Route path="customers" element={<CustomersPage />} />                             {/* added */}
            <Route path="ledger" element={<LedgerSummaryPage />} />                            {/* added */}
            <Route path="ledger/:partyType/:partyId" element={<LedgerStatementPage />} />      {/* added */}
          </Route>
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;