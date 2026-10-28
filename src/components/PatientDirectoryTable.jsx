import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  TextField,
  InputAdornment,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Add, Search, MedicalServices, Email, PersonSearch, Visibility } from "@mui/icons-material";
import { StageBadge, PriorityBadge } from "./StageBadge";
import {
  COLORS,
  tableCardSx,
  toolbarSx,
  tableContainerSx,
  segmentedTabsSx,
  rowSx,
  primaryTextSx,
  secondaryTextSx,
  avatarSx,
  paginationSx,
} from "../styles/tableStyles";

// Stage filters shown as tabs (same style as Upcoming / Past in appointments)
const STAGES = [
  { key: "ALL", label: "All" },
  { key: "reception", label: "Reception" },
  { key: "doctor_review", label: "Doctor Review" },
  { key: "nurse_check", label: "Nurse Check" },
  { key: "admitting_provider", label: "Super Doctor" },
  { key: "completed", label: "Completed" },
];

export function PatientDirectoryTable({
  patients = [],
  selectedPatientId,
  onSelectPatient,
  onOpenWorkflow,
  onViewDetails,
  onSendInvitation,
  onAddPatient,
  canAddPatient,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = patients.filter((p) => {
    const matchesStage = selectedStage === "ALL" || p.current_stage === selectedStage;
    const term = searchTerm.trim().toLowerCase();
    const name = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    const email = (p.email || "").toLowerCase();
    const phone = (p.phone_number || "").toLowerCase();
    const complaint = (p.chief_complaint || "").toLowerCase();

    return (
      matchesStage &&
      (!term || name.includes(term) || email.includes(term) || phone.includes(term) || complaint.includes(term))
    );
  });

  // Return to the first page whenever the filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedStage]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={tableCardSx}>
      {/* Toolbar row 1: stage tabs + add button */}
      <Box sx={toolbarSx}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={selectedStage}
          onChange={(_, v) => v && setSelectedStage(v)}
          sx={segmentedTabsSx}
        >
          {STAGES.map((stg) => {
            const count =
              stg.key === "ALL"
                ? patients.length
                : patients.filter((p) => p.current_stage === stg.key).length;
            return (
              <ToggleButton key={stg.key} value={stg.key}>
                {stg.label} ({count})
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>

        {canAddPatient && onAddPatient && (
          <Button variant="contained" startIcon={<Add />} onClick={onAddPatient} sx={{ px: 2.5 }}>
            Add Patient
          </Button>
        )}
      </Box>

      {/* Toolbar row 2: search */}
      <Box sx={{ px: 2.5, pb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name, email, phone or complaint"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: { xs: "100%", sm: 360 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 20, color: COLORS.textLight }} />
                </InputAdornment>
              ),
              sx: { borderRadius: "8px", fontSize: "0.86rem" },
            },
          }}
        />
      </Box>

      <TableContainer sx={tableContainerSx}>
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 1.5, pl: 2.5 }}>Patient</TableCell>
              <TableCell>DOB / Age</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Nurse</TableCell>
              <TableCell>Care Stage</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell align="right" sx={{ pr: 2.5 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 7, border: 0 }}>
                  <PersonSearch sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                  <Typography sx={{ fontWeight: 600, color: "#475569" }}>No patients found</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try a different search term or stage filter.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((patient, idx) => {
                const isSelected = selectedPatientId === patient.patient_id;
                const patientCode = patient.patient_id ? String(patient.patient_id).slice(0, 8) : "—";
                const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
                const initials = `${patient.first_name?.[0] || ""}${patient.last_name?.[0] || ""}`.toUpperCase() || "P";

                return (
                  <TableRow
                    key={patient.patient_id}
                    hover
                    selected={isSelected}
                    onClick={() => onSelectPatient && onSelectPatient(patient)}
                    sx={{
                      ...rowSx(idx),
                      cursor: "pointer",
                      ...(isSelected && { bgcolor: "#f1f5f9 !important", boxShadow: `inset 3px 0 0 ${COLORS.accent}` }),
                    }}
                  >
                    <TableCell sx={{ py: 1.5, pl: 2.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={avatarSx}>{initials}</Avatar>
                        <Box>
                          <Typography
                            sx={{ ...primaryTextSx, color: COLORS.accent, "&:hover": { textDecoration: "underline" } }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails && onViewDetails(patient);
                            }}
                          >
                            {fullName || "Unnamed patient"}
                          </Typography>
                          <Typography sx={{ ...secondaryTextSx, fontFamily: "monospace" }}>#{patientCode}</Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: "0.84rem", color: "#334155" }}>{patient.date_of_birth || "—"}</Typography>
                      <Typography sx={secondaryTextSx}>{patient.age ?? 0} years</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: "0.84rem", color: "#334155" }}>{patient.email || "No email"}</Typography>
                      <Typography sx={secondaryTextSx}>{patient.phone_number || "No phone"}</Typography>
                    </TableCell>

                    <TableCell sx={{ color: "#334155" }}>
                      {patient.assigned_doctor_name ? `Dr. ${patient.assigned_doctor_name}` : <span style={{ color: COLORS.textLight }}>Unassigned</span>}
                    </TableCell>

                    <TableCell sx={{ color: "#334155" }}>
                      {patient.assigned_nurse_name ? `Nurse ${patient.assigned_nurse_name}` : <span style={{ color: COLORS.textLight }}>Unassigned</span>}
                    </TableCell>

                    <TableCell>
                      <StageBadge stage={patient.current_stage} size="small" />
                    </TableCell>

                    <TableCell>
                      <PriorityBadge priority={patient.priority} size="small" />
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 2.5 }}>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }} onClick={(e) => e.stopPropagation()}>
                        {onSendInvitation && (
                        <Tooltip title={patient.email ? "Send Patient Portal Invitation" : "Patient email missing"}>
                          <span>
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={!patient.email}
                              startIcon={<Email fontSize="inherit" />}
                              onClick={() => onSendInvitation(patient)}
                              sx={{ fontSize: "0.76rem", px: 1.25, borderColor: "#cbd5e1", color: "#334155", whiteSpace: "nowrap" }}
                            >
                              Invite
                            </Button>
                          </span>
                        </Tooltip>
                        )}

                        {onViewDetails && (
                        <Tooltip title="View Patient Details">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility fontSize="inherit" />}
                            onClick={() => onViewDetails(patient)}
                            sx={{ fontSize: "0.76rem", px: 1.25, borderColor: "#cbd5e1", color: "#334155", whiteSpace: "nowrap" }}
                          >
                            View
                          </Button>
                        </Tooltip>
                        )}

                        <Tooltip title="Clinical Review & Advance Stage">
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<MedicalServices fontSize="inherit" />}
                            onClick={() => onOpenWorkflow && onOpenWorkflow(patient)}
                            sx={{ fontSize: "0.76rem", px: 1.25, whiteSpace: "nowrap" }}
                          >
                            Review
                          </Button>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 15, 25]}
        sx={paginationSx}
      />
    </Box>
  );
}

export default PatientDirectoryTable;
