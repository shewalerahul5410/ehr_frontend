import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import { StageBadge, PriorityBadge } from "../components/StageBadge";

// Grouped patient fields shown on the details page
const SECTIONS = [
  {
    title: "Demographics & Contact",
    fields: [
      ["Date of Birth", "date_of_birth"],
      ["Age", (p) => (p.age != null ? `${p.age} years` : "")],
      ["Gender", "gender"],
      ["Email", "email"],
      ["Phone", "phone_number"],
      ["Address", "address"],
      ["Emergency Contact", "emergency_contact_name"],
      ["Emergency Phone", "emergency_contact_phone"],
    ],
  },
  {
    title: "Care Team",
    fields: [
      ["Doctor", (p) => (p.assigned_doctor_name ? `Dr. ${p.assigned_doctor_name}` : "")],
      ["Nurse", "assigned_nurse_name"],
      ["Admitting Provider", "assigned_admitting_provider_name"],
    ],
  },
  {
    title: "Reception Intake",
    fields: [
      ["Chief Complaint", "chief_complaint"],
      ["Medical History", "medical_history"],
    ],
  },
  {
    title: "Doctor Review",
    fields: [
      ["Diagnosis", "diagnosis"],
      ["Treatment Plan", "treatment_plan"],
      ["Doctor Notes", "doctor_notes"],
    ],
  },
  {
    title: "Nurse Vitals & Tests",
    fields: [
      ["Blood Group", "blood_group"],
      ["Blood Pressure", "blood_pressure"],
      ["Heart Rate", "heart_rate"],
      ["Temperature", "temperature"],
      ["Respiratory Rate", "respiratory_rate"],
      ["Oxygen Saturation", "oxygen_saturation"],
      ["Blood Test Results", "blood_test_results"],
      ["Nurse Notes", "nurse_notes"],
    ],
  },
  {
    title: "Admission & Discharge",
    fields: [
      ["Admission Decision", "admission_decision"],
      ["Admitting Notes", "admitting_notes"],
      ["Discharge Summary", "discharge_summary"],
    ],
  },
];

const getValue = (patient, field) =>
  typeof field === "function" ? field(patient) : patient[field];

export function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, patientRes] = await Promise.all([
          api.get("auth/me/"),
          api.get(`patients/${patientId}/`),
        ]);
        setCurrentUser(userRes.data);
        setPatient(patientRes.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load patient details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  const fullName = patient ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() : "";
  const initials = patient
    ? `${patient.first_name?.[0] || ""}${patient.last_name?.[0] || ""}`.toUpperCase() || "P"
    : "";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fb" }}>
      <Navbar user={currentUser} />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/patients")} sx={{ mb: 2, textTransform: "none" }}>
          Back to Patients
        </Button>

        {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : patient && (
          <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
            <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Avatar sx={{ bgcolor: "#2563eb" }}>{initials}</Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  {fullName || "Unnamed patient"}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "monospace" }}>
                  #{String(patient.patient_id).slice(0, 8)}
                </Typography>
              </Box>
              <StageBadge stage={patient.current_stage} />
              <PriorityBadge priority={patient.priority} />
            </Box>

            <Box sx={{ p: 3 }}>
              {SECTIONS.map((section, i) => (
                <Box key={section.title} sx={{ mb: i < SECTIONS.length - 1 ? 2.5 : 0 }}>
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>{section.title}</Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      columnGap: 3,
                      rowGap: 1.5,
                    }}
                  >
                    {section.fields.map(([label, field]) => (
                      <Box key={label}>
                        <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{label}</Typography>
                        <Typography sx={{ fontSize: "0.88rem", color: "#334155", whiteSpace: "pre-wrap" }}>
                          {getValue(patient, field) || "—"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  {i < SECTIONS.length - 1 && <Divider sx={{ mt: 2.5 }} />}
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default PatientDetails;
