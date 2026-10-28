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
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  Close,
  ContentCopy,
  OpenInNew,
  CheckCircle,
  PersonAdd,
  MedicalServices,
} from "@mui/icons-material";
import api from "../api/axios";

export function AddPatientModal({ open, onClose, onPatientAdded }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "M",
    email: "",
    phone_number: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    priority: "routine",
    chief_complaint: "",
    medical_history: "",
    assigned_doctor: "",
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invitationData, setInvitationData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setError("");
      setInvitationData(null);
      setCopied(false);

      // Fetch active doctors for assignment dropdown
      const fetchDoctors = async () => {
        try {
          const res = await api.get("staff/?role=doctor");
          setDoctors(Array.isArray(res.data) ? res.data : res.data.results || []);
        } catch {
          // If staff endpoint fails, continue gracefully
        }
      };
      fetchDoctors();
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...formData,
        assigned_doctor: formData.assigned_doctor || null,
        // Goes straight to the doctor when one is assigned, otherwise stays at reception
        current_stage: formData.assigned_doctor ? "doctor_review" : "reception",
      };

      const res = await api.post("patients/", payload);
      const newPatient = res.data;

      // Extract invitation link from response or generate link
      const inviteUrl =
        newPatient.invitation_link ||
        (newPatient.patient_id
          ? `http://localhost:5173/set-password/?token=${newPatient.patient_id}`
          : "");

      setInvitationData({
        patient: newPatient,
        link: inviteUrl,
      });

      if (onPatientAdded) {
        onPatientAdded(newPatient);
      }
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object" && data !== null) {
        const errorMessages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
          .join(" | ");
        setError(errorMessages || "Failed to register patient. Please check required fields.");
      } else {
        setError(err.response?.data?.detail || "Unable to register patient.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (invitationData?.link) {
      navigator.clipboard.writeText(invitationData.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetAndClose = () => {
    setFormData({
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "M",
      email: "",
      phone_number: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      priority: "routine",
      chief_complaint: "",
      medical_history: "",
      assigned_doctor: "",
    });
    setInvitationData(null);
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleResetAndClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box className="d-flex align-items-center gap-2">
          <PersonAdd sx={{ color: "#2563eb" }} />
          <Typography variant="h6" fontWeight="bold">
            {invitationData ? "Patient Registered - Invitation Ready" : "Hospital Reception: Register Patient"}
          </Typography>
        </Box>
        <IconButton onClick={handleResetAndClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Success View with Invitation Link */}
        {invitationData ? (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CheckCircle sx={{ fontSize: 60, color: "#16a34a", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Patient Check-in Completed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              <strong>
                {invitationData.patient.first_name} {invitationData.patient.last_name}
              </strong>{" "}
              has been registered into the EHR system and forwarded to Doctor Review.
            </Typography>

            {invitationData.link ? (
              <Box
                sx={{
                  p: 3,
                  bgcolor: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: 2,
                  textAlign: "left",
                  mb: 3,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#166534", mb: 1 }}>
                  Patient Account Invitation Link:
                </Typography>
                <Typography variant="body2" sx={{ color: "#374151", mb: 2 }}>
                  Share this link with the patient so they can set their password, log in, and view their care pathway & appointments.
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  value={invitationData.link}
                  slotProps={{
                    input: {
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            size="small"
                            variant="contained"
                            color={copied ? "success" : "primary"}
                            startIcon={<ContentCopy fontSize="small" />}
                            onClick={handleCopyLink}
                            sx={{ textTransform: "none" }}
                          >
                            {copied ? "Copied!" : "Copy Link"}
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ bgcolor: "#ffffff" }}
                />

                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<OpenInNew />}
                    onClick={() => window.open(invitationData.link, "_blank")}
                    sx={{ textTransform: "none" }}
                  >
                    Open Set Password Page
                  </Button>
                </Box>
              </Box>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                No email was provided for this patient. You can update their email later to send an invitation.
              </Alert>
            )}
          </Box>
        ) : (
          /* Intake Form */
          <Box component="form" id="patient-form" onSubmit={handleSubmit} className="row g-3">
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2563eb", mb: 0 }}>
              1. Personal Information
            </Typography>

            <Box className="col-12 col-md-6">
              <TextField
                fullWidth
                required
                size="small"
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </Box>

            <Box className="col-12 col-md-6">
              <TextField
                fullWidth
                required
                size="small"
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </Box>

            <Box className="col-12 col-md-6">
              <TextField
                fullWidth
                required
                size="small"
                type="date"
                label="Date of Birth"
                name="date_of_birth"
                slotProps={{ inputLabel: { shrink: true } }}
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </Box>

            <Box className="col-12 col-md-6">
              <TextField
                select
                fullWidth
                required
                size="small"
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="O">Other</MenuItem>
                <MenuItem value="N">Prefer not to say</MenuItem>
              </TextField>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2563eb", mt: 2, mb: 0 }}>
              2. Contact & Emergency Contact
            </Typography>

            <Box className="col-12 col-md-6">
              <TextField
                fullWidth
                required
                size="small"
                type="email"
                label="Email (Used for Patient Login Invitation)"
                name="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={handleChange}
                helperText="Invitation link will be generated for this email"
              />
            </Box>

            <Box className="col-12 col-md-6">
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </Box>

            <Box className="col-12">
              <TextField
                fullWidth
                size="small"
                label="Residential Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
              />
            </Box>

            <Box className="col-12 col-md-6">
              <TextField
                fullWidth
                size="small"
                label="Emergency Contact Name"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
              />
            </Box>

            <Box className="col-12 col-md-6">
              <TextField
                fullWidth
                size="small"
                label="Emergency Contact Phone"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleChange}
              />
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2563eb", mt: 2, mb: 0 }}>
              3. Clinical Intake & Initial Assignment
            </Typography>

            <Box className="col-12 col-md-6">
              <TextField
                select
                fullWidth
                size="small"
                label="Triage Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <MenuItem value="routine">Routine</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="emergency">Emergency</MenuItem>
              </TextField>
            </Box>

            <Box className="col-12 col-md-6">
              <TextField
                select
                fullWidth
                size="small"
                label="Assign Initial Doctor"
                name="assigned_doctor"
                value={formData.assigned_doctor}
                onChange={handleChange}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {doctors.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    Dr. {doc.full_name || doc.username}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box className="col-12">
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                size="small"
                label="Chief Complaint / Reason for Hospital Visit"
                name="chief_complaint"
                placeholder="Describe patient's symptoms, duration, and reason for admission/visit..."
                value={formData.chief_complaint}
                onChange={handleChange}
              />
            </Box>

            <Box className="col-12">
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Medical & Family History"
                name="medical_history"
                placeholder="Past illnesses, ongoing medication, allergies, family history (diabetes, heart disease)..."
                value={formData.medical_history}
                onChange={handleChange}
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
        {invitationData ? (
          <Button variant="contained" onClick={handleResetAndClose} sx={{ minWidth: 120 }}>
            Done
          </Button>
        ) : (
          <>
            <Button onClick={handleResetAndClose} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              form="patient-form"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MedicalServices />}
              sx={{ bgcolor: "#2563eb", px: 3 }}
            >
              {loading ? "Registering Patient..." : "Register & Forward to Doctor"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AddPatientModal;
