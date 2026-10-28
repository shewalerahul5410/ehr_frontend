import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  PersonAdd,
  MedicalServices,
  Healing,
  LocalHospital,
} from "@mui/icons-material";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import PatientHeaderBanner from "../components/PatientHeaderBanner";
import WorkflowProgress from "../components/WorkflowProgress";
import PatientDirectoryTable from "../components/PatientDirectoryTable";
import AppointmentsDataTable from "../components/AppointmentsDataTable";
import PatientWorkflowModal from "../components/PatientWorkflowModal";
import AddPatientModal from "../components/AddPatientModal";
import ScheduleAppointmentModal from "../components/ScheduleAppointmentModal";
import Toast from "../components/Toast";
import SectionHeader from "../components/SectionHeader";

export function Dashboard() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Toast state
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  // Modals
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [bookAppointmentOpen, setBookAppointmentOpen] = useState(false);

  const role = (currentUser?.role || "").toLowerCase();
  const isPatient = role === "patient";
  const isDoctor = role === "doctor";
  const isNurse = role === "nurse";
  const isSuperDoctor = role === "superdoctor";
  const isReceptionist = role === "receptionist";

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [userRes, patientsRes, apptsRes] = await Promise.all([
        api.get("auth/me/"),
        api.get("patients/"),
        api.get("appointments/"),
      ]);

      setCurrentUser(userRes.data);

      const patData = Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data.results || [];
      setPatients(patData);
      if (patData.length > 0 && !selectedPatient) {
        setSelectedPatient(patData[0]);
      }

      const apptData = Array.isArray(apptsRes.data) ? apptsRes.data : apptsRes.data.results || [];
      setAppointments(apptData);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenWorkflow = (patient) => {
    setSelectedPatient(patient);
    setWorkflowModalOpen(true);
  };

  const handleWorkflowUpdated = (updated) => {
    setPatients((prev) =>
      prev.map((p) => (p.patient_id === updated.patient_id ? updated : p))
    );
    if (selectedPatient?.patient_id === updated.patient_id) {
      setSelectedPatient(updated);
    }
    showToast(`Patient stage updated: ${updated.current_stage?.replace("_", " ").toUpperCase()}`);
  };

  const handlePatientAdded = (newPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatient(newPatient);
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

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.patch(`appointments/${appointmentId}/`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.appointment_id === appointmentId ? { ...a, status: newStatus } : a))
      );
      showToast(`Appointment status changed to ${newStatus}.`);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update appointment status.", "error");
    }
  };

  const myPatientRecord = isPatient && patients.length > 0 ? patients[0] : null;

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

        {/* If Patient: Show Patient Demographic Banner + Care Journey Stepper + Table of Appointments */}
        {isPatient && myPatientRecord && (
          <Box className="d-flex flex-column gap-3 mb-4">
            <PatientHeaderBanner
              patient={myPatientRecord}
              onActionClick={() => handleOpenWorkflow(myPatientRecord)}
            />

            <Box
              sx={{
                bgcolor: "#ffffff",
                p: 2.5,
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b", mb: 1 }}>
                Care Journey Progression
              </Typography>
              <WorkflowProgress currentStage={myPatientRecord?.current_stage || "reception"} />
            </Box>

            <SectionHeader
              title="Your Scheduled Appointments"
              count={appointments.length}
              subtitle="Your visits and clinical chart."
            />

            <AppointmentsDataTable
              appointments={appointments}
              onAddAppointment={() => setBookAppointmentOpen(true)}
              onStatusChange={handleStatusChange}
            />
          </Box>
        )}

        {/* If Staff: Show Department Queues & Table-Wise Records */}
        {!isPatient && (
          <Box className="d-flex flex-column gap-4">
            {/* Top Department Queues */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Reception Intake"
                  value={patients.filter((p) => p.current_stage === "reception").length}
                  subtitle="Patients in intake"
                  icon={<PersonAdd />}
                  actionText="View Intake"
                  onAction={() => navigate("/patients")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Doctor Review"
                  value={patients.filter((p) => p.current_stage === "doctor_review").length}
                  subtitle="Awaiting consultation"
                  icon={<MedicalServices />}
                  actionText="Doctor Queue"
                  onAction={() => navigate("/patients")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Nurse Check"
                  value={patients.filter((p) => p.current_stage === "nurse_check").length}
                  subtitle="Vitals & blood work pending"
                  icon={<Healing />}
                  actionText="Nurse Station"
                  onAction={() => navigate("/patients")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                  title="Super Doctor Queue"
                  value={patients.filter((p) => p.current_stage === "admitting_provider").length}
                  subtitle="Admitting & disposition"
                  icon={<LocalHospital />}
                  actionText="Admitting"
                  onAction={() => navigate("/patients")}
                />
              </Grid>
            </Grid>

            {/* Table 1: Patient Directory Table */}
            <Box>
              <SectionHeader
                title={
                  isDoctor
                    ? "Doctor Queue: Patient Records"
                    : isNurse
                    ? "Nurse Station: Patient Records"
                    : isSuperDoctor
                    ? "Super Doctor: Admitting Provider Records"
                    : isReceptionist
                    ? "Reception Desk: Patient Intake"
                    : "Hospital Patient Directory"
                }
                count={patients.length}
                subtitle="Click a row to select a patient. Use 'Invite' to send a portal invitation or 'Review' to manage clinical stages."
              />

              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <PatientDirectoryTable
                  patients={patients}
                  selectedPatientId={selectedPatient?.patient_id}
                  onSelectPatient={(p) => setSelectedPatient(p)}
                  onOpenWorkflow={handleOpenWorkflow}
                  onSendInvitation={["receptionist", "superdoctor", "admin"].includes(role) ? handleSendInvitation : undefined}
                  onAddPatient={() => setAddPatientOpen(true)}
                  canAddPatient={isReceptionist || isSuperDoctor || role === "admin"}
                />
              )}
            </Box>

            {/* Table 2: Clinical Appointments Table */}
            <Box sx={{ mt: 1 }}>
              <SectionHeader
                title="Scheduled Hospital Appointments"
                count={appointments.length}
                subtitle="Upcoming and past visits with provider, complaint and status."
              />
              <AppointmentsDataTable
                appointments={appointments}
                onAddAppointment={() => setBookAppointmentOpen(true)}
                onStatusChange={handleStatusChange}
              />
            </Box>
          </Box>
        )}
      </Container>

      {/* Clinical Workflow Modal */}
      <PatientWorkflowModal
        patient={selectedPatient}
        open={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        currentUser={currentUser}
        onWorkflowUpdated={handleWorkflowUpdated}
      />

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

export default Dashboard;
