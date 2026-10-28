import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import AppointmentsDataTable from "../components/AppointmentsDataTable";
import PatientHeaderBanner from "../components/PatientHeaderBanner";
import ScheduleAppointmentModal from "../components/ScheduleAppointmentModal";
import Toast from "../components/Toast";
import SectionHeader from "../components/SectionHeader";

export function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [bookModalOpen, setBookModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const [appointmentResponse, userResponse, patientsResponse] = await Promise.all([
        api.get("appointments/"),
        api.get("auth/me/"),
        api.get("patients/"),
      ]);

      const data = appointmentResponse.data;
      setAppointments(Array.isArray(data) ? data : data.results || []);
      setCurrentUser(userResponse.data);

      const patData = patientsResponse.data;
      setPatients(Array.isArray(patData) ? patData : patData.results || []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load appointments. Please check network and permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`appointments/${appointmentId}/`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.appointment_id === appointmentId ? { ...a, status: newStatus } : a))
      );
      showToast(`Appointment status updated to ${newStatus}.`);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update appointment status.", "error");
    }
  };

  const isPatient = currentUser?.role?.toLowerCase() === "patient";
  const patientProfile = isPatient && patients.length > 0 ? patients[0] : null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fb" }}>
      <Navbar
        user={currentUser}
        onBookAppointment={() => setBookModalOpen(true)}
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* If patient, display patient demographic banner */}
        {patientProfile && (
          <PatientHeaderBanner patient={patientProfile} />
        )}

        <Box sx={{ mt: patientProfile ? 3 : 0 }}>
          <SectionHeader
            variant="h5"
            title={isPatient ? "My Visit & Appointment Schedule" : "Hospital Appointments"}
            count={loading ? undefined : appointments.length}
            subtitle="Schedule, attending provider, consultation type and status actions."
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AppointmentsDataTable
            appointments={appointments}
            onAddAppointment={() => setBookModalOpen(true)}
            onStatusChange={handleStatusChange}
          />
        )}
      </Container>

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        open={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        currentUser={currentUser}
        onAppointmentCreated={(newAppt) => {
          setAppointments((prev) => [newAppt, ...prev]);
          showToast("Appointment scheduled successfully!");
        }}
      />

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
}

export default Appointments;
