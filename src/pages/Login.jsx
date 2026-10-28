import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
} from "@mui/material";
import { LocalHospital, LoginOutlined, VerifiedUser } from "@mui/icons-material";
import api from "../api/axios";
import { AuthLayout, authCardSx } from "../components/AuthLayout";

export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Two-factor step: set once the backend has emailed a verification code.
  const [otpUsername, setOtpUsername] = useState("");
  const [otp, setOtp] = useState("");

  const requestOtp = async () => {
    const response = await api.post("auth/login/", {
      username: username.trim(),
      password: password,
    });
    setOtpUsername(response.data.username);
    setOtp("");
    setInfo(response.data.detail || "Verification code sent to your registered email.");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setInfo("");
    setIsLoading(true);

    try {
      await requestOtp();
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password. Please verify your credentials.");
      } else {
        setError(
          err.response?.data?.detail || "Unable to reach the server. Make sure the backend is active."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setIsLoading(true);
    try {
      await requestOtp();
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to resend the verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setOtpUsername("");
    setOtp("");
    setError("");
    setInfo("");
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("auth/verify-otp/", {
        username: otpUsername,
        otp: otp,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // Fetch user profile to cache role immediately
      try {
        const profileRes = await api.get("auth/me/");
        if (profileRes.data?.role) {
          localStorage.setItem("user_role", profileRes.data.role);
        }
      } catch {
        // Continue if profile fetch fails
      }

      navigate("/dashboard");
    } catch (err) {
      setInfo("");
      setError(
        err.response?.data?.detail || "Unable to reach the server. Make sure the backend is active."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card elevation={0} sx={authCardSx}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          {/* Header */}
          <Box className="text-center mb-4">
            <Avatar
              sx={{
                bgcolor: "#2563eb",
                width: 56,
                height: 56,
                mx: "auto",
                mb: 1.5,
                boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              }}
            >
              <LocalHospital fontSize="large" />
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
              EHR Healthcare System
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
              {otpUsername
                ? "Enter the 6-digit code sent to your email"
                : "Sign in to access your clinical portal"}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {info && !error && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              {info}
            </Alert>
          )}

          {otpUsername ? (
          /* Verification Code Form */
          <Box component="form" onSubmit={handleVerify} className="d-flex flex-column gap-3">
            <TextField
              required
              fullWidth
              autoFocus
              label="Verification Code"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              slotProps={{
                input: { sx: { borderRadius: 2 } },
                htmlInput: {
                  inputMode: "numeric",
                  autoComplete: "one-time-code",
                  maxLength: 6,
                  style: { letterSpacing: "0.5em", textAlign: "center", fontSize: "1.25rem" },
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading || otp.length !== 6}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <VerifiedUser />}
              sx={{
                bgcolor: "#2563eb",
                py: 1.4,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {isLoading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <Box className="d-flex justify-content-between">
              <Button size="small" onClick={handleBack} disabled={isLoading} sx={{ textTransform: "none" }}>
                Back to login
              </Button>
              <Button size="small" onClick={handleResend} disabled={isLoading} sx={{ textTransform: "none" }}>
                Resend code
              </Button>
            </Box>
          </Box>
          ) : (
          /* Login Form */
          <Box component="form" onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <TextField
              required
              fullWidth
              label="Username or Email"
              placeholder="Your username or email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />

            <TextField
              required
              fullWidth
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{ input: { sx: { borderRadius: 2 } } }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginOutlined />}
              sx={{
                bgcolor: "#2563eb",
                py: 1.4,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                "&:hover": { bgcolor: "#1d4ed8" },
              }}
            >
              {isLoading ? "Sending code..." : "Sign In to Portal"}
            </Button>
          </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box className="text-center">
            <Typography variant="caption" sx={{ color: "#94a3b8" }}>
              Secure Role-Based Electronic Health Records · Thinkitive Intern EHR
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

export default Login;
