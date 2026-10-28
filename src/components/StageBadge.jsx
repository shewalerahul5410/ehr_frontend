import React from "react";
import { neutralChipSx } from "../styles/tableStyles";
import { Chip } from "@mui/material";
import {
  AssignmentInd,
  MedicalServices,
  LocalHospital,
  Healing,
  CheckCircle,
  Warning,
  Error,
  Info,
} from "@mui/icons-material";

export function StageBadge({ stage, size = "small" }) {
  const normalizedStage = (stage || "reception").toLowerCase();

  const configs = {
    reception: {
      label: "1. Reception Intake",
      color: "warning",
      icon: <AssignmentInd fontSize="small" />,
    },
    doctor_review: {
      label: "2. Doctor Review",
      color: "primary",
      icon: <MedicalServices fontSize="small" />,
    },
    nurse_check: {
      label: "3. Nurse Check (Vitals & Blood)",
      color: "info",
      icon: <Healing fontSize="small" />,
    },
    admitting_provider: {
      label: "4. Super Doctor (Admitting)",
      color: "secondary",
      icon: <LocalHospital fontSize="small" />,
    },
    completed: {
      label: "Care Completed",
      color: "success",
      icon: <CheckCircle fontSize="small" />,
    },
  };

  const current = configs[normalizedStage] || { label: stage || "Pending" };

  return (
    <Chip
      size={size}
      icon={current.icon}
      label={current.label}
      variant="outlined"
      sx={{ ...neutralChipSx, textTransform: "none", "& .MuiChip-icon": { color: "#64748b" } }}
    />
  );
}

export function PriorityBadge({ priority, size = "small" }) {
  const p = (priority || "routine").toLowerCase();

  if (p === "emergency") {
    return (
      <Chip
        size={size}
        icon={<Error fontSize="small" />}
        label="Emergency"
        sx={{ ...neutralChipSx, color: "#b91c1c", "& .MuiChip-icon": { color: "#b91c1c" } }}
      />
    );
  }

  if (p === "urgent") {
    return (
      <Chip
        size={size}
        icon={<Warning fontSize="small" />}
        label="Urgent"
        sx={{ ...neutralChipSx, "& .MuiChip-icon": { color: "#64748b" } }}
      />
    );
  }

  return (
    <Chip
      size={size}
      icon={<Info fontSize="small" />}
      label="Routine"
      sx={{ ...neutralChipSx, fontWeight: 500, "& .MuiChip-icon": { color: "#94a3b8" } }}
    />
  );
}

export function AdmissionBadge({ decision, size = "small" }) {
  const d = (decision || "not_decided").toLowerCase();

  const map = {
    admitted: { label: "Admitted Inpatient", bg: "#fef2f2", color: "#991b1b" },
    observation: { label: "Observation Ward", bg: "#fffbeb", color: "#92400e" },
    outpatient: { label: "Discharged Outpatient", bg: "#ecfdf5", color: "#065f46" },
    transferred: { label: "Specialist Transfer", bg: "#f5f3ff", color: "#5b21b6" },
    not_decided: { label: "Under Evaluation", bg: "#f8fafc", color: "#64748b" },
  };

  const match = map[d] || map.not_decided;

  return (
    <Chip
      size={size}
      label={match.label}
      sx={{ ...neutralChipSx, textTransform: "none" }}
    />
  );
}
