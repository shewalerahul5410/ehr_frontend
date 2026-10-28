import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import PatientReview from "./pages/PatientReview";
import SetPassword from "./pages/SetPassword";
import Appointments from "./pages/Appointments";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/set-password" element={<SetPassword />} />

        {/* Protected Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/:patientId" element={<PatientDetails />} />
          <Route path="/patients/:patientId/review" element={<PatientReview />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
