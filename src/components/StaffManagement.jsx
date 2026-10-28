import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Avatar,
} from "@mui/material";
import { PersonAdd, Send } from "@mui/icons-material";
import api from "../api/axios";
import SectionHeader from "./SectionHeader";
import {
  tableCardSx,
  tableContainerSx,
  rowSx,
  primaryTextSx,
  secondaryTextSx,
  avatarSx,
  neutralChipSx,
} from "../styles/tableStyles";

const ROLE_LABELS = {
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  superdoctor: "Super Doctor",
  admin: "Admin",
};

const EMPTY_INVITE = { first_name: "", last_name: "", email: "", role: "doctor" };

// Super doctor only: add doctors, nurses and receptionists and email them an invitation
export function StaffManagement({ showToast }) {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(EMPTY_INVITE);
  const [sending, setSending] = useState(false);

  const loadStaff = async () => {
    try {
      const res = await api.get("staff/");
      setStaff(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      showToast("Unable to load staff list.", "error");
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const shareLink = (url, email) => {
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(`Invitation sent to ${email}. Link copied to clipboard.`);
    } else {
      showToast(`Invitation sent to ${email}.`);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api.post("staff/invite/", form);
      shareLink(res.data.setup_url, form.email);
      setForm(EMPTY_INVITE);
      loadStaff();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`).join(" | ")
          : "Failed to send invitation.";
      showToast(msg, "error");
    } finally {
      setSending(false);
    }
  };

  const handleResend = async (member) => {
    try {
      const res = await api.post(`staff/${member.id}/resend-invite/`);
      shareLink(res.data.setup_url, member.email);
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to resend invitation.", "error");
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <SectionHeader
        title="Staff Management"
        count={staff.length}
        subtitle="Add doctors, nurses and receptionists. They receive an email link to set their own password."
      />

      {/* Invite form */}
      <Box
        component="form"
        onSubmit={handleInvite}
        sx={{ ...tableCardSx, p: 2.5, mb: 2.5, display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}
      >
        <TextField size="small" required label="First Name" name="first_name" value={form.first_name} onChange={handleChange} sx={{ flex: "1 1 160px" }} />
        <TextField size="small" label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} sx={{ flex: "1 1 160px" }} />
        <TextField size="small" required type="email" label="Email" name="email" value={form.email} onChange={handleChange} sx={{ flex: "2 1 220px" }} />
        <TextField size="small" select label="Role" name="role" value={form.role} onChange={handleChange} sx={{ flex: "1 1 160px" }}>
          <MenuItem value="doctor">Doctor</MenuItem>
          <MenuItem value="nurse">Nurse</MenuItem>
          <MenuItem value="receptionist">Receptionist</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" startIcon={<PersonAdd />} disabled={sending} sx={{ px: 2.5 }}>
          {sending ? "Sending..." : "Add & Invite"}
        </Button>
      </Box>

      {/* Staff table */}
      <Box sx={tableCardSx}>
        <TableContainer sx={{ ...tableContainerSx, borderTop: 0 }}>
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1.5, pl: 2.5 }}>Staff Member</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="right" sx={{ pr: 2.5 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: "center", py: 5, color: "#94a3b8" }}>
                    No staff members yet.
                  </TableCell>
                </TableRow>
              ) : (
                staff.map((m, idx) => {
                  const initials = (m.full_name || m.username || "?")
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const canResend = !m.has_password && ["doctor", "nurse", "receptionist"].includes(m.role);
                  return (
                    <TableRow key={m.id} hover sx={rowSx(idx)}>
                      <TableCell sx={{ py: 1.5, pl: 2.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={avatarSx}>{initials}</Avatar>
                          <Box>
                            <Typography sx={primaryTextSx}>{m.full_name}</Typography>
                            <Typography sx={secondaryTextSx}>{m.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={ROLE_LABELS[m.role] || m.role} sx={neutralChipSx} />
                      </TableCell>
                      <TableCell sx={{ color: m.has_password ? "#334155" : "#94a3b8" }}>
                        {m.has_password ? "Active" : "Invitation pending"}
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 2.5 }}>
                        {canResend && (
                          <Button size="small" variant="outlined" startIcon={<Send fontSize="inherit" />} onClick={() => handleResend(m)} sx={{ color: "#334155", borderColor: "#cbd5e1" }}>
                            Resend Invite
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default StaffManagement;
