import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add,
  DescriptionOutlined,
  MoreVert,
  CheckCircle,
  Cancel,
  Check,
  EventBusy,
  CalendarMonth,
  AccessTime,
} from "@mui/icons-material";
import {
  tableCardSx,
  toolbarSx,
  tableContainerSx,
  segmentedTabsSx,
  rowSx,
  neutralChipSx,
  paginationSx,
} from "../styles/tableStyles";
import { formatDate, formatTime } from "../utils/dateTime";


export function AppointmentsDataTable({
  appointments = [],
  onAddAppointment,
  onStatusChange,
}) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleMenuOpen = (event, appt) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAppt(appt);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAppt(null);
  };

  // Filter into Upcoming vs Past
  const now = new Date();
  const isPastOrDone = (a) =>
    a.status?.toLowerCase() === "completed" ||
    a.status?.toLowerCase() === "cancelled" ||
    new Date(a.scheduled_at) < now;

  const upcomingList = appointments.filter((a) =>
    activeTab === "upcoming" ? !isPastOrDone(a) : isPastOrDone(a)
  );
  const upcomingCount = appointments.filter((a) => !isPastOrDone(a)).length;
  const pastCount = appointments.length - upcomingCount;

  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  const pageRows = upcomingList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const renderStatus = (status) => (
    <Chip size="small" label={status || "Scheduled"} sx={neutralChipSx} />
  );

  return (
    <Box sx={tableCardSx}>
      {/* Toolbar: Upcoming / Past toggle + Add */}
      <Box sx={toolbarSx}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={activeTab}
          onChange={(_, v) => v && setActiveTab(v)}
          sx={segmentedTabsSx}
        >
          <ToggleButton value="upcoming">Upcoming ({upcomingCount})</ToggleButton>
          <ToggleButton value="past">Past ({pastCount})</ToggleButton>
        </ToggleButtonGroup>

        {onAddAppointment && (
          <Button variant="contained" startIcon={<Add />} onClick={onAddAppointment} sx={{ px: 2.5 }}>
            Add Appointment
          </Button>
        )}
      </Box>

      <TableContainer sx={tableContainerSx}>
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ py: 1.5, pl: 2.5 }}>Date &amp; Time</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Type / Mode</TableCell>
              <TableCell>Chief Complaint</TableCell>
              <TableCell align="center">Forms</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right" sx={{ pr: 2.5 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {upcomingList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 7, border: 0 }}>
                  <EventBusy sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                  <Typography sx={{ fontWeight: 600, color: "#475569" }}>
                    No {activeTab} appointments
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeTab === "upcoming" ? "Booked visits will appear here." : "Completed and past visits will appear here."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, idx) => {
                // Shown in the viewer's local time zone, same as when booked
                const dateStr = formatDate(row.scheduled_at);
                const timeStr = formatTime(row.scheduled_at);

                const doctorName = row.doctor_name ? `Dr. ${row.doctor_name}` : "Assigned Provider";
                const patientName = row.patient_name || "Patient";

                return (
                  <TableRow
                    key={row.appointment_id}
                    hover
                    sx={rowSx(idx)}
                  >
                    <TableCell sx={{ py: 1.5, pl: 2.5, whiteSpace: "nowrap" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontWeight: 600, color: "#0f172a" }}>
                        <CalendarMonth sx={{ fontSize: 16, color: "#64748b" }} />
                        {dateStr}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: "0.78rem", color: "#64748b", mt: 0.25 }}>
                        <AccessTime sx={{ fontSize: 14, color: "#94a3b8" }} />
                        {timeStr}
                      </Box>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700, color: "#0f172a" }}>
                      {patientName}
                    </TableCell>

                    <TableCell sx={{ color: "#334155", fontWeight: 500 }}>
                      {doctorName}
                    </TableCell>

                    <TableCell>
                      <Typography sx={{ fontSize: "0.84rem", color: "#334155" }}>Clinical Consultation</Typography>
                      <Typography sx={{ fontSize: "0.74rem", color: "#94a3b8" }}>In Person</Typography>
                    </TableCell>

                    <TableCell sx={{ color: "#334155", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <Tooltip title={row.description || ""}>
                        <span>{row.description || "Book an Appointment"}</span>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Clinical Intake Form">
                        <DescriptionOutlined sx={{ fontSize: 18, color: "#64748b" }} />
                      </Tooltip>
                    </TableCell>

                    <TableCell>{renderStatus(row.status)}</TableCell>

                    <TableCell align="right" sx={{ pr: 2.5 }}>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                        {row.status?.toLowerCase() === "scheduled" && (
                          <Tooltip title="Confirm appointment">
                            <IconButton
                              size="small"
                              onClick={() => onStatusChange && onStatusChange(row.appointment_id, "confirmed")}
                              sx={{ color: "#334155", bgcolor: "#f1f5f9" }}
                            >
                              <Check sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}

                        {row.status?.toLowerCase() === "confirmed" && (
                          <Tooltip title="Mark as Completed">
                            <IconButton
                              size="small"
                              onClick={() => onStatusChange && onStatusChange(row.appointment_id, "completed")}
                              sx={{ color: "#334155", bgcolor: "#f1f5f9" }}
                            >
                              <CheckCircle sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}

                        <Tooltip title="More actions">
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row)} sx={{ color: "#64748b" }}>
                            <MoreVert sx={{ fontSize: 18 }} />
                          </IconButton>
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
        count={upcomingList.length}
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

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 190 } }}
      >
        {selectedAppt?.status?.toLowerCase() !== "confirmed" && (
          <MenuItem
            onClick={() => {
              if (onStatusChange && selectedAppt) {
                onStatusChange(selectedAppt.appointment_id, "confirmed");
              }
              handleMenuClose();
            }}
            sx={{ fontSize: "0.86rem" }}
          >
            <Check sx={{ fontSize: 16, mr: 1.25 }} />
            Confirm Appointment
          </MenuItem>
        )}

        {selectedAppt?.status?.toLowerCase() !== "completed" && (
          <MenuItem
            onClick={() => {
              if (onStatusChange && selectedAppt) {
                onStatusChange(selectedAppt.appointment_id, "completed");
              }
              handleMenuClose();
            }}
            sx={{ fontSize: "0.86rem" }}
          >
            <CheckCircle sx={{ fontSize: 16, mr: 1.25 }} />
            Mark Completed
          </MenuItem>
        )}

        {selectedAppt?.status?.toLowerCase() !== "cancelled" && (
          <MenuItem
            onClick={() => {
              if (onStatusChange && selectedAppt) {
                onStatusChange(selectedAppt.appointment_id, "cancelled");
              }
              handleMenuClose();
            }}
            sx={{ fontSize: "0.86rem", color: "#dc2626" }}
          >
            <Cancel sx={{ fontSize: 16, mr: 1.25 }} />
            Cancel Appointment
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
}

export default AppointmentsDataTable;
