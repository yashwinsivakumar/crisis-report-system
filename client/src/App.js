import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Citizen Pages
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportIncident from "./pages/citizen/ReportIncident";
import MapView from "./pages/citizen/MapView";
import MyReports from "./pages/citizen/MyReports";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import IncidentList from "./pages/admin/IncidentList";
import IncidentDetail from "./pages/admin/IncidentDetail";

// Protected Route
const ProtectedRoute = ({ children, adminOnly }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" />;

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* Citizen Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
      <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
      <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/incidents" element={<ProtectedRoute adminOnly><IncidentList /></ProtectedRoute>} />
      <Route path="/admin/incidents/:id" element={<ProtectedRoute adminOnly><IncidentDetail /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;