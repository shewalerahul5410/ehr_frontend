import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  MenuItem,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import { Close, EventAvailable } from "@mui/icons-material";
import api from "../api/axios";
import { toDateInput, toApiDateTime, formatDate, formatTime, zoneName } from "../utils/dateTime";

export function ScheduleAppointmentModal({
  open,
  onClose,
  currentUser,
  onAppointmentCreated,
}) {
  const isPatient = currentUser?.role?.toLowerCase() === "patient";

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    doctor: "",
    patient: "",
    date: "",
    time: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      setError("");
      setSuccess("");

      // Default to tomorrow 10:00 AM local time
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      setFormData({
        doctor: "",
        patient: currentUser?.patient_id || "",
        date: toDateInput(tomorrow),
        time: "10:00",
        description: "",
      });

      const fetchOptions = async () => {
        try {
          const docRes = await api.get("staff/?role=doctor");
          setDoctors(Array.isArray(docRes.data) ? docRes.data : docRes.data.results || []);

          if (!isPatient) {
            const patRes = await api.get("patients/");
            setPatients(Array.isArray(patRes.data) ? patRes.data : patRes.data.results || []);
          }
        } catch {
          // Gracefully continue
        }
      };
      fetchOptions();
    }
  }, [open, currentUser, isPatient]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        doctor: formData.doctor,
        scheduled_at: toApiDateTime(formData.date, formData.time),
        description: formData.description,
      };

      if (!isPatient && formData.patient) {
        payload.patient = formData.patient;
      }

      const res = await api.post("appointments/", payload);

      setSuccess("Appointment successfully scheduled! A confirmation email has been dispatched.");
      if (onAppointmentCreated) {
        onAppointmentCreated(res.data);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object" && data !== null) {
        const errorMessages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
          .join(" | ");
        setError(errorMessages || "Unable to schedule appointment.");
      } else {
        setError(err.response?.data?.detail || "Failed to schedule appointment.");
      }
    } finally {
      setLoading(false);
    }
  };

  const today = toDateInput(new Date());
  // Selected date + time shown back to the user in their own time zone
  const preview =
    formData.date && formData.time
      ? `${formatDate(`${formData.date}T${formData.time}`)} at ${formatTime(`${formData.date}T${formData.time}`)}`
      : "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box className="d-flex align-items-center gap-2">
          <EventAvailable sx={{ color: "#2563eb" }} />
          <Typography variant="h6" fontWeight="bold">
            {isPatient ? "Schedule Your Appointment" : "Schedule New Appointment"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" id="appointment-form" onSubmit={handleSubmit} className="d-flex flex-column gap-3">
          {!isPatient && (
            <TextField
              select
              required
              fullWidth
              size="small"
              label="Select Patient"
              name="patient"
              value={formData.patient}
              onChange={handleChange}
            >
              <MenuItem value="">Choose a patient</MenuItem>
              {patients.map((p) => (
                <MenuItem key={p.patient_id} value={p.patient_id}>
                  {p.first_name} {p.last_name} ({p.email || p.phone_number || "No Contact"})
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            select
            required
            fullWidth
            size="small"
            label="Select Doctor"
            name="doctor"
            value={formData.doctor}
            onChange={handleChange}
          >
            <MenuItem value="">Choose a doctor</MenuItem>
            {doctors.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                Dr. {d.full_name || d.username}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              required
              size="small"
              type="date"
              label="Appointment Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              sx={{ flex: "1 1 180px" }}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: today },
              }}
            />
            <TextField
              required
              size="small"
              type="time"
              label={`Appointment Time (${zoneName()})`}
              name="time"
              value={formData.time}
              onChange={handleChange}
              sx={{ flex: "1 1 180px" }}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { step: 900 },
              }}
            />
          </Box>
          {preview && (
            <Typography variant="caption" sx={{ color: "#64748b", mt: -1.5 }}>
              Booking for {preview} (your local time)
            </Typography>
          )}

          <TextField
            required
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Reason for Appointment / Description"
            name="description"
            placeholder="Please describe symptoms, check-up reason, or follow-up details..."
            value={formData.description}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          form="appointment-form"
          variant="contained"
          disabled={loading || Boolean(success)}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <EventAvailable />}
          sx={{ bgcolor: "#2563eb", px: 3 }}
        >
          {loading ? "Scheduling..." : "Confirm Appointment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ScheduleAppointmentModal;
