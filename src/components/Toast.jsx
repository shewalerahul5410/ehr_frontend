import React from "react";
import { Snackbar, Alert } from "@mui/material";

export function Toast({ open, message, severity = "success", onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: "100%",
          boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          fontWeight: 600,
          borderRadius: "6px",
          fontSize: "0.88rem",
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Toast;
