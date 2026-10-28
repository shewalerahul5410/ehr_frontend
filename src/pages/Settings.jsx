
import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  Container,
  Grid,
} from "@mui/material";
import {
  Person,
  LockReset,
  Save,
} from "@mui/icons-material";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import Toast from "../components/Toast";
import StaffManagement from "../components/StaffManagement";
import DoctorAvailability from "../components/DoctorAvailability";

export function Settings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Stable reference so child effects that depend on it don't re-run every render
  const showToast = useCallback((message, severity = "success") => {
    setToast({ open: true, message, severity });
  }, []);

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("auth/me/");

      setProfile(response.data);

      setFormData({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        email: response.data.email || "",
      });
    } catch (err) {
      showToast(
        err.response?.data?.detail ||
          "Unable to load your profile settings.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const response = await api.patch("auth/me/", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      });

      setProfile(response.data);
      showToast("Profile information saved successfully!");
    } catch (err) {
      const data = err.response?.data;

      if (typeof data === "object" && data !== null) {
        const errorList = Object.entries(data)
          .map(([k, v]) =>
            `${k}: ${Array.isArray(v) ? v.join(" ") : v}`
          )
          .join(" | ");

        showToast(
          errorList || "Failed to update profile information.",
          "error"
        );
      } else {
        showToast(
          err.response?.data?.detail || "Unable to save profile.",
          "error"
        );
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.new_password.length < 8) {
      showToast(
        "New password must be at least 8 characters long.",
        "error"
      );
      return;
    }

    if (
      passwordData.new_password !== passwordData.confirm_password
    ) {
      showToast("New passwords do not match.", "error");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await api.post("auth/change-password/", {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
      });

      showToast(
        response.data.detail || "Password changed successfully!"
      );

      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      const data = err.response?.data;

      if (typeof data === "object" && data !== null) {
        const errorList = Object.entries(data)
          .map(([k, v]) =>
            `${k}: ${Array.isArray(v) ? v.join(" ") : v}`
          )
          .join(" | ");

        showToast(
          errorList ||
            "Unable to change password. Please verify current password.",
          "error"
        );
      } else {
        showToast(
          err.response?.data?.detail ||
            "Failed to change password.",
          "error"
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Navbar user={profile} />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "#0f172a" }}
          >
            Account Settings & User Information
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: "#64748b", mt: 0.5 }}
          >
            Update your profile details, clinical provider credentials,
            and security settings.
          </Typography>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 8,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Section 1: User Profile Information Form */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Box className="d-flex align-items-center gap-2 mb-3">
                  <Person sx={{ color: "#1976d2" }} />

                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Personal Profile & Provider Information
                  </Typography>
                </Box>

                <Box
                  component="form"
                  onSubmit={handleSaveProfile}
                  className="d-flex flex-column gap-3"
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleProfileChange}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleProfileChange}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleProfileChange}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Username"
                        value={profile?.username || ""}
                        slotProps={{
                          input: { readOnly: true },
                        }}
                        helperText="System login identifier"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Assigned System Role"
                        value={(profile?.role || "").toUpperCase()}
                        slotProps={{
                          input: { readOnly: true },
                        }}
                      />
                    </Grid>

                    {profile?.patient_id && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Linked Patient Record ID"
                          value={profile.patient_id}
                          slotProps={{
                            input: { readOnly: true },
                          }}
                        />
                      </Grid>
                    )}
                  </Grid>

                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      disabled={savingProfile}
                      startIcon={<Save />}
                      sx={{
                        backgroundColor: "#1976d2",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "6px",
                        px: 2.5,
                        py: 0.8,
                        "&:hover": {
                          backgroundColor: "#1565c0",
                        },
                      }}
                    >
                      {savingProfile
                        ? "Saving..."
                        : "Save Profile Information"}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Section 2: Security & Password Update */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Box className="d-flex align-items-center gap-2 mb-3">
                  <LockReset sx={{ color: "#1976d2" }} />

                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Change Password
                  </Typography>
                </Box>

                <Box
                  component="form"
                  onSubmit={handlePasswordChange}
                  className="d-flex flex-column gap-3"
                >
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Current Password"
                    name="current_password"
                    required
                    value={passwordData.current_password}
                    onChange={handlePasswordInputChange}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="New Password"
                    name="new_password"
                    required
                    placeholder="Min. 8 characters"
                    value={passwordData.new_password}
                    onChange={handlePasswordInputChange}
                  />

                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    label="Confirm New Password"
                    name="confirm_password"
                    required
                    value={passwordData.confirm_password}
                    onChange={handlePasswordInputChange}
                  />

                  <Box
                    sx={{
                      mt: 1,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      size="small"
                      disabled={changingPassword}
                      sx={{
                        backgroundColor: "#1976d2",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: "6px",
                        px: 2.5,
                        py: 0.8,
                        "&:hover": {
                          backgroundColor: "#1565c0",
                        },
                      }}
                    >
                      {changingPassword
                        ? "Updating..."
                        : "Update Password"}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Doctor Availability — doctors only */}
        {!loading &&
          (profile?.role || "").toLowerCase() === "doctor" && (
            <DoctorAvailability showToast={showToast} />
          )}

        {/* Only the super doctor (or admin) can add and invite staff */}
        {!loading &&
          ["superdoctor", "admin"].includes(
            (profile?.role || "").toLowerCase()
          ) && <StaffManagement showToast={showToast} />}
      </Container>

      {/* Toast Notification */}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleCloseToast}
      />
    </Box>
  );
}

export default Settings;
