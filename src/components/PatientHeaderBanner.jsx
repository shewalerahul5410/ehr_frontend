import React from "react";
import { formatDate } from "../utils/dateTime";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Cake,
  Phone,
  Email,
  LocationOn,
  Shield,
  Translate,
  Hotel,
  Share,
  ChatBubble,
  NotificationsNone,
  Add,
} from "@mui/icons-material";

export function PatientHeaderBanner({ patient, onActionClick }) {
  if (!patient) return null;

  const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || "Unnamed Patient";
  const patientCode = patient.patient_id ? String(patient.patient_id).slice(0, 8) : "N/A";

  const getStageTag = (stage) => {
    switch ((stage || "").toLowerCase()) {
      case "admitting_provider":
      case "completed":
        return { label: "Inpatient", bg: "#fef3c7", color: "#b45309", border: "#fde68a" };
      case "nurse_check":
        return { label: "Observation / Ward", bg: "#dbeafe", color: "#1d4ed8", border: "#bfdbfe" };
      case "doctor_review":
        return { label: "Outpatient / Triage", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
      case "reception":
      default:
        return { label: "Intake Pending", bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
    }
  };

  const stageTag = getStageTag(patient.current_stage);

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        p: { xs: 2, md: 2.5 },
        mb: 2.5,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <Box className="d-flex flex-wrap align-items-center justify-content-between gap-3">
        {/* Left: Patient Avatar & Demographics */}
        <Box className="d-flex align-items-center gap-3" sx={{ minWidth: 280, flex: "1 1 320px" }}>
          <Avatar
            sx={{
              width: 58,
              height: 58,
              bgcolor: "#cbd5e1",
              color: "#64748b",
            }}
          >
            <Person sx={{ fontSize: 38 }} />
          </Avatar>

          <Box>
            <Box className="d-flex align-items-center gap-1.5 flex-wrap">
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b", fontSize: "1.1rem" }}>
                {fullName} ({patientCode})
              </Typography>

              <Chip
                size="small"
                label={stageTag.label}
                sx={{
                  bgcolor: stageTag.bg,
                  color: stageTag.color,
                  border: `1px solid ${stageTag.border}`,
                  fontWeight: 700,
                  fontSize: "0.74rem",
                  height: "22px",
                }}
              />

              <IconButton
                size="small"
                onClick={onActionClick}
                sx={{
                  border: "1px solid #cbd5e1",
                  width: 20,
                  height: 20,
                  p: 0,
                  color: "#64748b",
                }}
              >
                <Add sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>

            {/* Demographics Icon Grid */}
            <Box className="d-flex flex-wrap gap-x-3 gap-y-1 align-items-center mt-1.5 text-secondary" sx={{ fontSize: "0.8rem" }}>
              <Box className="d-flex align-items-center gap-1">
                <Cake sx={{ fontSize: 14, color: "#94a3b8" }} />
                <span>{patient.date_of_birth || "—"} ({patient.age ?? 0}Yrs)</span>
              </Box>

              <Box className="d-flex align-items-center gap-1">
                <Translate sx={{ fontSize: 14, color: "#94a3b8" }} />
                <span>{patient.gender === "M" ? "Male" : patient.gender === "F" ? "Female" : "—"}</span>
              </Box>

              <Box className="d-flex align-items-center gap-1">
                <Phone sx={{ fontSize: 14, color: "#94a3b8" }} />
                <span>{patient.phone_number || "—"}</span>
              </Box>

              <Box className="d-flex align-items-center gap-1">
                <Email sx={{ fontSize: 14, color: "#94a3b8" }} />
                <span>{patient.email || "—"}</span>
              </Box>

              <Box className="d-flex align-items-center gap-1">
                <LocationOn sx={{ fontSize: 14, color: "#94a3b8" }} />
                <span>{patient.address ? patient.address.slice(0, 16) : "—"}</span>
              </Box>

              <Box className="d-flex align-items-center gap-1">
                <Shield sx={{ fontSize: 14, color: "#94a3b8" }} />
                <span>{patient.priority ? patient.priority.toUpperCase() : "—"}</span>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Middle: Admission Box */}
        <Box
          sx={{
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            p: 1.5,
            minWidth: 170,
            bgcolor: "#ffffff",
          }}
        >
          <Box className="d-flex justify-content-center align-items-center gap-2 mb-1" sx={{ color: "#94a3b8", fontSize: "0.8rem" }}>
            <span>—</span>
            <Hotel sx={{ fontSize: 16, color: "#64748b" }} />
            <span>—</span>
          </Box>
          <Box className="d-flex justify-content-between gap-2" sx={{ fontSize: "0.75rem" }}>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>
                Admission Date
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b" }}>
                {formatDate(patient.created_at)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.7rem" }}>
                Admitting Provider
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600, color: "#1e293b" }}>
                {patient.assigned_admitting_provider_name ? `Dr. ${patient.assigned_admitting_provider_name}` : "—"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right: Care Team Box */}
        <Box
          sx={{
            bgcolor: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            p: 1.5,
            minWidth: 260,
          }}
        >
          <Box className="row g-1" sx={{ fontSize: "0.75rem" }}>
            <Box className="col-6">
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.68rem" }}>
                Primary Doctor
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e293b" }}>
                {patient.assigned_doctor_name ? `Dr. ${patient.assigned_doctor_name}` : "—"}
              </Typography>
            </Box>
            <Box className="col-6">
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.68rem" }}>
                Case Manager / Nurse
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e293b" }}>
                {patient.assigned_nurse_name ? `Nurse ${patient.assigned_nurse_name}` : "—"}
              </Typography>
            </Box>
            <Box className="col-6 mt-1">
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.68rem" }}>
                Admitting Provider
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e293b" }}>
                {patient.assigned_admitting_provider_name ? `Dr. ${patient.assigned_admitting_provider_name}` : "—"}
              </Typography>
            </Box>
            <Box className="col-6 mt-1">
              <Typography variant="caption" sx={{ color: "#64748b", display: "block", fontSize: "0.68rem" }}>
                Admission Status
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#1e293b" }}>
                {patient.admission_decision && patient.admission_decision !== "not_decided"
                  ? patient.admission_decision.toUpperCase()
                  : "Under Evaluation"}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Far Right Action Buttons (Share, Chat, Bell) */}
        <Box className="d-flex flex-column gap-1">
          <Tooltip title="Export / Share record">
            <IconButton size="small" sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5 }}>
              <Share sx={{ fontSize: 16, color: "#64748b" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Patient Notes">
            <IconButton size="small" onClick={onActionClick} sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5 }}>
              <ChatBubble sx={{ fontSize: 16, color: "#2563eb" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Alerts">
            <IconButton size="small" sx={{ border: "1px solid #e2e8f0", borderRadius: 1.5 }}>
              <NotificationsNone sx={{ fontSize: 16, color: "#ef4444" }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}

export default PatientHeaderBanner;
