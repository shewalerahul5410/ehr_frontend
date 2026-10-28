import { createTheme } from "@mui/material/styles";

// Shared clinical design tokens used across all pages and tables
const theme = createTheme({
  palette: {
    primary: { main: "#1d4ed8", dark: "#1e40af", light: "#3b82f6" },
    secondary: { main: "#0b3875" },
    success: { main: "#16a34a" },
    warning: { main: "#d97706" },
    error: { main: "#dc2626" },
    background: { default: "#f4f6fb", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#64748b" },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Arial, sans-serif',
    h5: { fontWeight: 800, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700, letterSpacing: "-0.01em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#eef2f7", fontSize: "0.84rem" },
        head: {
          backgroundColor: "#f8fafc",
          color: "#475569",
          fontWeight: 700,
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          borderBottom: "1px solid #e2e8f0",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.MuiTableRow-hover:hover": { backgroundColor: "#f1f5ff" },
        },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 12 } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: "#ffffff" } },
    },
  },
});

export default theme;
