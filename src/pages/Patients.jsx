import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import PatientDirectoryTable from "../components/PatientDirectoryTable";
import AddPatientModal from "../components/AddPatientModal";
import ScheduleAppointmentModal from "../components/ScheduleAppointmentModal";
import Toast from "../components/Toast";
import SectionHeader from "../components/SectionHeader";

export function Patients() {
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Toast state
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Modals
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [bookAppointmentOpen, setBookAppointmentOpen] = useState(false);

  const role = (currentUser?.role || "").toLowerCase();
  const canRegister = ["receptionist", "admin", "superdoctor"].includes(role);

  const fetchPatientsAndData = async () => {
    try {
      setLoading(true);
      setError("");

      const [userRes, patientsRes] = await Promise.all([
        api.get("auth/me/"),
        api.get("patients/"),
      ]);

      setCurrentUser(userRes.data);

      const patList = Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data.results || [];
      setPatients(patList);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load clinical data. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientsAndData();
  }, []);

  const handleOpenWorkflow = (patient) => {
    navigate(`/patients/${patient.patient_id}/review`);
  };

  const handleViewDetails = (patient) => {
    navigate(`/patients/${patient.patient_id}`);
  };

  const handlePatientAdded = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    showToast(`Patient ${newPatient.first_name} ${newPatient.last_name} registered successfully!`);
  };

  const handleSendInvitation = async (patient) => {
    if (!patient.email) {
      showToast("This patient does not have an email address.", "error");
      return;
    }

    try {
      const res = await api.post(`patients/${patient.patient_id}/send-invitation/`);
      const link = res.data.setup_url || patient.invitation_link;
      if (link && navigator.clipboard) {
        navigator.clipboard.writeText(link);
        showToast(`Invitation sent & link copied to clipboard for ${patient.email}!`);
      } else {
        showToast(`Invitation dispatched to ${patient.email}!`);
      }
    } catch {
      if (patient.invitation_link && navigator.clipboard) {
        navigator.clipboard.writeText(patient.invitation_link);
        showToast(`Invitation link copied to clipboard for ${patient.email}!`);
      } else {
        showToast(`Failed to send invitation to ${patient.email}.`, "error");
      }
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fb" }}>
      <Navbar
        user={currentUser}
        onBookAppointment={() => setBookAppointmentOpen(true)}
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
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
          <Box>
            <SectionHeader
              title="Patient Records Directory"
              count={patients.length}
              subtitle="Search, filter by care stage, and click a patient name to view full details."
            />

            <PatientDirectoryTable
              patients={patients}
              onOpenWorkflow={handleOpenWorkflow}
              onViewDetails={handleViewDetails}
              onSendInvitation={canRegister ? handleSendInvitation : undefined}
              onAddPatient={() => setAddPatientOpen(true)}
              canAddPatient={canRegister}
            />
          </Box>
        )}
      </Container>

      {/* Add Patient Modal */}
      <AddPatientModal
        open={addPatientOpen}
        onClose={() => setAddPatientOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal
        open={bookAppointmentOpen}
        onClose={() => setBookAppointmentOpen(false)}
        currentUser={currentUser}
        onAppointmentCreated={() => showToast("Appointment scheduled successfully!")}
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

export default Patients;
