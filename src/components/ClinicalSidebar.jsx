import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Home,
  Assignment,
  WarningAmber,
  MedicalServices,
  Medication,
  FavoriteBorder,
  Description,
  History,
  NoteAlt,
  Assessment,
  InsertDriveFile,
  School,
  CheckCircle,
} from "@mui/icons-material";

export function ClinicalSidebar({ activeTab = "visit_details", onTabChange }) {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <Home fontSize="small" /> },
    { key: "orders", label: "Orders", icon: <Assignment fontSize="small" /> },
    { key: "allergies", label: "Allergies", icon: <WarningAmber fontSize="small" /> },
    { key: "diagnosis", label: "Diagnosis", icon: <MedicalServices fontSize="small" /> },
    { key: "medication", label: "Medication", icon: <Medication fontSize="small" /> },
    { key: "vitals", label: "Vitals", icon: <FavoriteBorder fontSize="small" /> },
    { key: "visit_details", label: "Visit Details", icon: <Description fontSize="small" /> },
    { key: "history", label: "History", icon: <History fontSize="small" /> },
    { key: "notes", label: "Notes", icon: <NoteAlt fontSize="small" /> },
    { key: "assessments", label: "Assessments", icon: <Assessment fontSize="small" /> },
    { key: "document", label: "Document", icon: <InsertDriveFile fontSize="small" /> },
    { key: "education", label: "Education", icon: <School fontSize="small" /> },
    { key: "task", label: "Task", icon: <CheckCircle fontSize="small" /> },
  ];

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "200px" },
        flexShrink: 0,
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        overflow: "hidden",
        p: 0.5,
      }}
    >
      <List component="nav" disablePadding>
        {menuItems.map((item) => {
          const isSelected = activeTab === item.key;
          return (
            <ListItemButton
              key={item.key}
              selected={isSelected}
              onClick={() => onTabChange && onTabChange(item.key)}
              sx={{
                py: 0.75,
                px: 1.5,
                borderRadius: "4px",
                mb: 0.25,
                color: isSelected ? "#2563eb" : "#475569",
                bgcolor: isSelected ? "#eff6ff !important" : "transparent",
                borderLeft: isSelected ? "3px solid #2563eb" : "3px solid transparent",
                "&:hover": {
                  bgcolor: isSelected ? "#eff6ff" : "#f8fafc",
                  color: "#2563eb",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 28,
                  color: isSelected ? "#2563eb" : "#64748b",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.84rem",
                  fontWeight: isSelected ? 700 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}

export default ClinicalSidebar;
