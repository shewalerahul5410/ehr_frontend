import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  TextField,
  MenuItem,
  IconButton,
  Paper,
  Divider,
  Grid,
  Chip,
} from "@mui/material";
import {
  Close,
  MedicalServices,
  Healing,
  LocalHospital,
  CheckCircle,
  Assignment,
  ArrowForward,
  ArrowBack,
  Lock,
} from "@mui/icons-material";
import { StageBadge, PriorityBadge, AdmissionBadge } from "./StageBadge";
import { WorkflowProgress } from "./WorkflowProgress";
import api from "../api/axios";

// Fields each role saves — must match backend core/workflow.py ROLE_FIELDS
const SECTION_FIELDS = {
  reception: ["chief_complaint", "medical_history", "priority", "assigned_doctor"],
  doctor: ["diagnosis", "doctor_notes", "treatment_plan", "priority", "assigned_nurse", "assigned_admitting_provider"],
  nurse: [
    "blood_group",
    "blood_pressure",
    "heart_rate",
    "temperature",
    "respiratory_rate",
    "oxygen_saturation",
    "blood_test_results",
    "nurse_notes",
  ],
  superdoctor: ["admission_decision", "admitting_notes", "discharge_summary"],
};

// Dropdown fields that must be sent as null when empty
const RELATION_FIELDS = ["assigned_doctor", "assigned_nurse", "assigned_admitting_provider"];

const EMPTY_FORM = {
  chief_complaint: "",
  medical_history: "",
  priority: "routine",
  assigned_doctor: "",
  diagnosis: "",
  doctor_notes: "",
  treatment_plan: "",
  assigned_nurse: "",
  blood_group: "",
  blood_pressure: "",
  heart_rate: "",
  temperature: "",
  respiratory_rate: "",
  oxygen_saturation: "",
  blood_test_results: "",
  nurse_notes: "",
  assigned_admitting_provider: "",
  admission_decision: "not_decided",
  admitting_notes: "",
  discharge_summary: "",
};

const toList = (res) => (Array.isArray(res.data) ? res.data : res.data.results || []);

function Section({ icon, title, active, editable, lockedText, children, actions }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: active ? "#94a3b8" : "#e2e8f0",
        bgcolor: active ? "#ffffff" : "#fafbfc",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5, gap: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ color: "#475569", display: "flex" }}>{icon}</Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
            {title}
          </Typography>
          {active && <Chip size="small" label="Current stage" sx={{ bgcolor: "#f1f5f9", fontWeight: 600 }} />}
        </Box>
        {!editable && (
          <Typography variant="caption" sx={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5 }}>
            <Lock sx={{ fontSize: 14 }} /> {lockedText}
          </Typography>
        )}
      </Box>
      {children}
      {editable && actions && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>{actions}</Box>
      )}
    </Paper>
  );
}

export function PatientWorkflowModal({ patient, open, onClose, currentUser, onWorkflowUpdated, asPage = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [doctors, setDoctors] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [superDoctors, setSuperDoctors] = useState([]);

  const [workflowData, setWorkflowData] = useState(EMPTY_FORM);

  const role = (currentUser?.role || "").toLowerCase();
  const isAdmin = role === "admin";
  const stage = patient?.current_stage;

  // A section is editable only by its role, and only while the patient is in that stage
  const canReception = isAdmin || (role === "receptionist" && stage === "reception");
  const canDoctor = isAdmin || (role === "doctor" && stage === "doctor_review");
  const canNurse = isAdmin || (role === "nurse" && stage === "nurse_check");
  const canSuperDoctor = isAdmin || (role === "superdoctor" && stage === "admitting_provider");

  // Each staff role sees only its own form; admin (and other roles) see every step
  const ROLE_SECTION = { receptionist: "reception", doctor: "doctor", nurse: "nurse", superdoctor: "superdoctor" };
  const mySection = ROLE_SECTION[role];
  const showSection = (section) => !mySection || mySection === section;

  const vitalsRecorded =Boolean(patient?.blood_pressure || patient?.temperature || patient?.heart_rate);

  useEffect(() => {
    if (patient && (open || asPage)) {
      setError("");
      setSuccessMsg("");
      const filled = {};
      Object.keys(EMPTY_FORM).forEach((k) => {
        filled[k] = patient[k] ?? EMPTY_FORM[k];
      });
      setWorkflowData(filled);

      const fetchStaff = async () => {
        try {
          const [doctorsRes, nursesRes, providersRes] = await Promise.all([
            api.get("staff/?role=doctor"),
            api.get("staff/?role=nurse"),
            api.get("staff/?role=superdoctor"),
          ]);
          setDoctors(toList(doctorsRes));
          setNurses(toList(nursesRes));
          setSuperDoctors(toList(providersRes));
        } catch {
          // Gracefully continue
        }
      };
      fetchStaff();
    }
  }, [patient, open, asPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkflowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (section, nextStage = null, successText = "") => {
    if (!patient) return;
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const payload = {};
      SECTION_FIELDS[section].forEach((field) => {
        const value = workflowData[field];
        payload[field] = RELATION_FIELDS.includes(field) ? value || null : value;
      });
      if (nextStage) {
        payload.current_stage = nextStage;
      }

      const res = await api.patch(`patients/${patient.patient_id}/workflow/`, payload);
      setSuccessMsg(successText || "Saved successfully.");

      if (onWorkflowUpdated) {
        onWorkflowUpdated(res.data);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        (Array.isArray(detail) ? detail.join(" ") : detail) ||
          "Failed to update patient workflow. Please check required fields."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!patient) return null;

  const field = (name, label, { editable, placeholder, multiline, select, children, md = 6 } = {}) => (
    <Grid size={{ xs: 12, md }}>
      <TextField
        fullWidth
        size="small"
        label={label}
        name={name}
        placeholder={placeholder}
        multiline={multiline}
        rows={multiline ? 2 : undefined}
        select={select}
        disabled={!editable}
        value={workflowData[name]}
        onChange={handleChange}
      >
        {children}
      </TextField>
    </Grid>
  );

  const header = (
        <Box className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              {patient.first_name} {patient.last_name}
            </Typography>
            <Box className="d-flex align-items-center gap-2 mt-1 flex-wrap">
              <Typography variant="body2" color="text.secondary">
                {patient.gender} · {patient.age ?? "N/A"} years · Phone: {patient.phone_number || "None"}
              </Typography>
              <PriorityBadge priority={patient.priority} />
              <StageBadge stage={patient.current_stage} />
            </Box>
          </Box>

          {!asPage && (
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
          )}
        </Box>
  );

  const body = (
      <>
        <WorkflowProgress currentStage={patient.current_stage} />

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        {/* Step 1: Reception */}
        {showSection("reception") && (
        <Section
          icon={<Assignment />}
          title="Step 1: Reception Intake"
          active={stage === "reception"}
          editable={canReception}
          lockedText="Reception only"
          actions={
            <>
              <Button variant="outlined" size="small" disabled={loading} onClick={() => handleUpdate("reception")}>
                Save Intake
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={loading}
                endIcon={<ArrowForward />}
                onClick={() => handleUpdate("reception", "doctor_review", "Patient sent to the assigned doctor.")}
              >
                Send to Doctor
              </Button>
            </>
          }
        >
          <Grid container spacing={2}>
            {field("chief_complaint", "Chief Complaint / Symptoms", { editable: canReception, multiline: true, md: 12 })}
            {field("medical_history", "Medical & Family History", {
              editable: canReception,
              multiline: true,
              md: 12,
              placeholder: "Past illnesses, allergies, family history...",
            })}
            {field("priority", "Priority", {
              editable: canReception || canDoctor,
              select: true,
              children: [
                <MenuItem key="routine" value="routine">Routine</MenuItem>,
                <MenuItem key="urgent" value="urgent">Urgent</MenuItem>,
                <MenuItem key="emergency" value="emergency">Emergency</MenuItem>,
              ],
            })}
            {field("assigned_doctor", "Assigned Doctor", {
              editable: canReception,
              select: true,
              children: [
                <MenuItem key="none" value="">Unassigned</MenuItem>,
                ...doctors.map((d) => (
                  <MenuItem key={d.id} value={d.id}>Dr. {d.full_name || d.username}</MenuItem>
                )),
                // Keep the current doctor visible even if the list hasn't loaded
                ...(patient.assigned_doctor && !doctors.some((d) => d.id === patient.assigned_doctor)
                  ? [<MenuItem key="current" value={patient.assigned_doctor}>Dr. {patient.assigned_doctor_name}</MenuItem>]
                  : []),
              ],
            })}
          </Grid>
        </Section>
        )}

        {/* Step 2: Doctor */}
        {showSection("doctor") && (
        <Section
          icon={<MedicalServices />}
          title="Step 2: Doctor Review & Decision"
          active={stage === "doctor_review"}
          editable={canDoctor}
          lockedText="Assigned doctor only"
          actions={
            <>
              <Button variant="outlined" size="small" disabled={loading} onClick={() => handleUpdate("doctor")}>
                Save Notes
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={loading}
                endIcon={<ArrowForward />}
                onClick={() => handleUpdate("doctor", "nurse_check", "Patient sent to the nurse for vitals.")}
              >
                Send to Nurse
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={loading}
                startIcon={<LocalHospital />}
                onClick={() => handleUpdate("doctor", "admitting_provider", "Patient admitted and sent to the super doctor.")}
              >
                Admit → Super Doctor
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={loading}
                startIcon={<CheckCircle />}
                onClick={() => handleUpdate("doctor", "completed", "Care completed. Patient discharged.")}
              >
                Complete & Discharge
              </Button>
            </>
          }
        >
          {stage === "doctor_review" && vitalsRecorded && (
            <Alert severity="info" icon={<Healing />} sx={{ mb: 2 }}>
              Nurse has recorded vitals (see Step 3). Decide: discharge, or admit to a super doctor if serious.
            </Alert>
          )}
          <Grid container spacing={2}>
            {field("diagnosis", "Diagnosis", { editable: canDoctor, placeholder: "e.g. Acute Bronchitis" })}
            {field("assigned_nurse", "Nurse (for vitals & blood work)", {
              editable: canDoctor,
              select: true,
              children: [
                <MenuItem key="none" value="">Unassigned</MenuItem>,
                ...nurses.map((n) => (
                  <MenuItem key={n.id} value={n.id}>Nurse {n.full_name || n.username}</MenuItem>
                )),
              ],
            })}
            {field("doctor_notes", "Examination Notes", { editable: canDoctor, multiline: true, md: 12 })}
            {field("treatment_plan", "Treatment Plan / Tests Ordered", { editable: canDoctor, multiline: true, md: 12 })}
            {field("assigned_admitting_provider", "Super Doctor (only if admitting)", {
              editable: canDoctor,
              select: true,
              children: [
                <MenuItem key="none" value="">Unassigned</MenuItem>,
                ...superDoctors.map((d) => (
                  <MenuItem key={d.id} value={d.id}>Dr. {d.full_name || d.username}</MenuItem>
                )),
              ],
            })}
          </Grid>
        </Section>
        )}

        {/* Step 3: Nurse */}
        {showSection("nurse") && (
        <Section
          icon={<Healing />}
          title="Step 3: Nurse Vitals & Blood Tests"
          active={stage === "nurse_check"}
          editable={canNurse}
          lockedText="Assigned nurse only"
          actions={
            <>
              <Button variant="outlined" size="small" disabled={loading} onClick={() => handleUpdate("nurse")}>
                Save Vitals
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={loading}
                startIcon={<ArrowBack />}
                onClick={() => handleUpdate("nurse", "doctor_review", "Vitals sent back to the doctor.")}
              >
                Send Back to Doctor
              </Button>
            </>
          }
        >
          <Grid container spacing={2}>
            {field("blood_pressure", "Blood Pressure", { editable: canNurse, placeholder: "120/80 mmHg", md: 3 })}
            {field("heart_rate", "Heart Rate", { editable: canNurse, placeholder: "75 bpm", md: 3 })}
            {field("temperature", "Temperature", { editable: canNurse, placeholder: "98.6 °F", md: 3 })}
            {field("oxygen_saturation", "SpO2", { editable: canNurse, placeholder: "98%", md: 3 })}
            {field("respiratory_rate", "Respiratory Rate", { editable: canNurse, placeholder: "16 /min", md: 3 })}
            {field("blood_group", "Blood Group", { editable: canNurse, placeholder: "O+", md: 3 })}
            {field("blood_test_results", "Blood & Lab Results", { editable: canNurse, multiline: true, md: 12 })}
            {field("nurse_notes", "Nurse Notes", { editable: canNurse, multiline: true, md: 12 })}
          </Grid>
        </Section>
        )}

        {/* Step 4: Super Doctor */}
        {showSection("superdoctor") && (
        <Section
          icon={<LocalHospital />}
          title="Step 4: Super Doctor — Admission & Final Decision"
          active={stage === "admitting_provider"}
          editable={canSuperDoctor}
          lockedText="Super doctor only"
          actions={
            <>
              <Button variant="outlined" size="small" disabled={loading} onClick={() => handleUpdate("superdoctor")}>
                Save Decision
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={loading}
                startIcon={<CheckCircle />}
                onClick={() => handleUpdate("superdoctor", "completed", "Patient care completed.")}
              >
                Finalize & Complete
              </Button>
            </>
          }
        >
          <Grid container spacing={2}>
            {field("admission_decision", "Patient Position / Admission Decision", {
              editable: canSuperDoctor,
              select: true,
              children: [
                <MenuItem key="nd" value="not_decided">Under Evaluation</MenuItem>,
                <MenuItem key="ad" value="admitted">Admit Inpatient (Ward)</MenuItem>,
                <MenuItem key="ob" value="observation">Observation Unit</MenuItem>,
                <MenuItem key="op" value="outpatient">Discharge (Outpatient)</MenuItem>,
                <MenuItem key="tr" value="transferred">Specialist Transfer</MenuItem>,
              ],
            })}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mt: 1 }}>
                <AdmissionBadge decision={workflowData.admission_decision} />
              </Box>
            </Grid>
            {field("admitting_notes", "Admitting Notes", { editable: canSuperDoctor, multiline: true, md: 12 })}
            {field("discharge_summary", "Discharge Summary & Instructions", { editable: canSuperDoctor, multiline: true, md: 12 })}
          </Grid>
        </Section>
        )}
      </>
  );

  if (asPage) {
    return (
      <Paper elevation={0} sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>{header}</Box>
        <Box sx={{ p: 3 }}>{body}</Box>
      </Paper>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ p: 2.5, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        {header}
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>{body}</DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PatientWorkflowModal;
