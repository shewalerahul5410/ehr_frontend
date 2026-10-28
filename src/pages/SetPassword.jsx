import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import { LockReset, CheckCircle, ArrowBack } from "@mui/icons-material";
import api from "../api/axios";
import { AuthLayout, authCardSx } from "../components/AuthLayout";

export function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invitation token is missing from the link. Please request a new invitation from reception.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your typing.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("auth/set-password/", {
        token,
        password,
        confirm_password: confirmPassword,
      });

      setSuccess(
        response.data.detail || "Your password has been successfully set! Redirecting to sign in..."
      );

      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object" && data !== null) {
        const errorList = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
          .join(" | ");
        setError(errorList || "Unable to set password. Invitation link may be expired or invalid.");
      } else {
        setError(err.response?.data?.detail || "Unable to set password. Check your invitation link.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card elevation={0} sx={authCardSx}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box className="text-center mb-4">
            <Avatar
              sx={{
                bgcolor: "#2563eb",
                width: 56,
                height: 56,
                mx: "auto",
                mb: 1.5,
              }}
            >
              <LockReset fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Set Your Password
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              Create a secure password to activate your account
            </Typography>
          </Box>

          {!token && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              No invitation token found in this URL. Please verify you clicked the complete link provided in your email or by reception.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              icon={<CheckCircle fontSize="inherit" />}
              severity="success"
              sx={{ mb: 3 }}
            >
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <TextField
              fullWidth
              required
              type="password"
              label="New Password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || Boolean(success)}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />

            <TextField
              fullWidth
              required
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || Boolean(success)}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !token || Boolean(success)}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
              sx={{
                bgcolor: "#2563eb",
                py: 1.3,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {loading ? "Activating Account..." : "Save Password & Activate"}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Button
            fullWidth
            variant="text"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/")}
            sx={{ textTransform: "none", color: "#64748b" }}
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export default SetPassword;
