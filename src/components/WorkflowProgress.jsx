import React from "react";
import { Box, Typography, Stepper, Step, StepLabel, StepConnector, stepConnectorClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  AssignmentInd,
  MedicalServices,
  Healing,
  LocalHospital,
  CheckCircle,
} from "@mui/icons-material";

const CustomConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "#2563eb",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: "#16a34a",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: "#e2e8f0",
    borderRadius: 1,
  },
}));

const StepIconRoot = styled("div")(({ ownerState }) => ({
  backgroundColor: "#f1f5f9",
  zIndex: 1,
  color: "#64748b",
  width: 44,
  height: 44,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  border: "2px solid #cbd5e1",
  transition: "all 0.3s ease",
  ...(ownerState.active && {
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    borderColor: "#2563eb",
    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.15)",
  }),
  ...(ownerState.completed && {
    backgroundColor: "#f0fdf4",
    color: "#16a34a",
    borderColor: "#16a34a",
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <AssignmentInd fontSize="small" />,
    2: <MedicalServices fontSize="small" />,
    3: <Healing fontSize="small" />,
    4: <LocalHospital fontSize="small" />,
  };

  return (
    <StepIconRoot ownerState={{ completed, active }} className={className}>
      {completed ? <CheckCircle fontSize="small" /> : icons[String(icon)]}
    </StepIconRoot>
  );
}

export function WorkflowProgress({ currentStage }) {
  const stageOrder = [
    "reception",
    "doctor_review",
    "nurse_check",
    "admitting_provider",
    "completed",
  ];

  const steps = [
    { key: "reception", label: "Reception Intake", sub: "Check-in & Registration" },
    { key: "doctor_review", label: "Doctor Review", sub: "Diagnosis & Orders" },
    { key: "nurse_check", label: "Nurse Check", sub: "Vitals & Blood Work" },
    { key: "admitting_provider", label: "Super Doctor", sub: "Admitting Decision" },
  ];

  const stageIndex = stageOrder.indexOf((currentStage || "reception").toLowerCase());
  const activeStep = stageIndex >= 0 ? Math.min(stageIndex, 4) : 0;
  const isAllCompleted = (currentStage || "").toLowerCase() === "completed";

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Stepper
        alternativeLabel
        activeStep={isAllCompleted ? 4 : activeStep}
        connector={<CustomConnector />}
      >
        {steps.map((step, index) => {
          const isCurrent = !isAllCompleted && activeStep === index;
          const isDone = isAllCompleted || activeStep > index;

          return (
            <Step key={step.key} completed={isDone}>
              <StepLabel StepIconComponent={CustomStepIcon}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? "#1d4ed8" : isDone ? "#16a34a" : "#475569",
                  }}
                >
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {step.sub}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

export default WorkflowProgress;
