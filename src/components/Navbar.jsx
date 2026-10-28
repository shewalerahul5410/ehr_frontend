import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  LocalHospital,
  Dashboard as DashboardIcon,
  Groups,
  EventNote,
  Settings,
  Logout,
  Menu as MenuIcon,
  Search,
  NotificationsNone,
  KeyboardArrowRight,
  AddCircle,
} from "@mui/icons-material";

export function Navbar({ user, onBookAppointment }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const role = (user?.role || localStorage.getItem("user_role") || "").toLowerCase();
  const username = user?.username || "Staff";
  const userInitials = (user?.first_name && user?.last_name)
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : username.slice(0, 2).toUpperCase();

  const isStaff = ["admin", "superdoctor", "doctor", "nurse", "receptionist"].includes(role);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    navigate("/", { replace: true });
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon fontSize="small" />, show: true },
    { label: "Patients", path: "/patients", icon: <Groups fontSize="small" />, show: isStaff },
    { label: "Appointments", path: "/appointments", icon: <EventNote fontSize="small" />, show: true },
    { label: "Settings", path: "/settings", icon: <Settings fontSize="small" />, show: true },
  ];

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "#0b3875", // Deep clinical navy from reference image
          color: "#ffffff",
          borderBottom: "1px solid #092c5c",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: "56px !important", px: { xs: 2, md: 3 } }}>
          {/* Logo & Hospital Brand */}
          <Box
            className="d-flex align-items-center gap-2"
            sx={{ cursor: "pointer", mr: 3 }}
            onClick={() => navigate("/dashboard")}
          >
            <Avatar
              sx={{
                bgcolor: "#ffffff",
                color: "#0b3875",
                width: 34,
                height: 34,
                fontWeight: 800,
                fontSize: "1rem",
              }}
            >
              <LocalHospital sx={{ fontSize: 22, color: "#0b3875" }} />
            </Avatar>
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "0.5px",
                  lineHeight: 1.1,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                }}
              >
                EHR Healthcare
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#93c5fd",
                  fontWeight: 600,
                  fontSize: "0.68rem",
                  letterSpacing: "0.5px",
                  display: "block",
                }}
              >
                Provider Portal
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation Tabs */}
          <Box className="d-none d-lg-flex align-items-center gap-1" sx={{ flexGrow: 1 }}>
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive =
                  item.path.includes("?")
                    ? location.pathname + location.search === item.path
                    : location.pathname === item.path;

                return (
                  <Button
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: "#ffffff",
                      backgroundColor: isActive ? "#1976d2" : "transparent",
                      borderRadius: "6px",
                      px: 1.8,
                      py: 0.6,
                      fontSize: "0.84rem",
                      fontWeight: isActive ? 700 : 500,
                      textTransform: "none",
                      letterSpacing: "0.2px",
                      "&:hover": {
                        backgroundColor: isActive ? "#1565c0" : "rgba(255, 255, 255, 0.12)",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}

            <IconButton size="small" sx={{ color: "#93c5fd", ml: 0.5 }}>
              <KeyboardArrowRight fontSize="small" />
            </IconButton>
          </Box>

          {/* Right Area: Search, Notifications, User Initials Badge */}
          <Box className="d-flex align-items-center gap-2">
            {onBookAppointment && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircle fontSize="small" />}
                onClick={onBookAppointment}
                sx={{
                  display: { xs: "none", sm: "flex" },
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  borderRadius: "6px",
                  "&:hover": { backgroundColor: "#1d4ed8" },
                }}
              >
                + Add Appointment
              </Button>
            )}

            <Tooltip title="Search records">
              <IconButton size="small" sx={{ color: "#ffffff" }}>
                <Search fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: "#ffffff" }}>
                <NotificationsNone fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* User Initials Circle Badge (like LD in reference image) */}
            <Box
              sx={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <Avatar
                sx={{
                  bgcolor: "#1d4ed8",
                  color: "#ffffff",
                  width: 34,
                  height: 34,
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  border: "2px solid #60a5fa",
                }}
              >
                {userInitials}
              </Avatar>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                elevation: 3,
                sx: { borderRadius: 2, minWidth: 200, mt: 1 },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {username}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                  Role: {role}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate("/settings"); }}>
                <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
                Settings & Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: "#dc2626" }}>
                <ListItemIcon><Logout fontSize="small" sx={{ color: "#dc2626" }} /></ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>

            {/* Mobile Hamburger Menu */}
            <IconButton
              sx={{ display: { lg: "none" }, color: "#ffffff" }}
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 280, p: 2, bgcolor: "#ffffff" } }}
      >
        <Box sx={{ mb: 2, pb: 1, borderBottom: "1px solid #e2e8f0" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0b3875" }}>
            EHR Healthcare
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Role: {role}
          </Typography>
        </Box>

        <List>
          {navItems
            .filter((i) => i.show)
            .map((item) => (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate(item.path);
                  }}
                  sx={{ borderRadius: 1.5 }}
                >
                  <ListItemIcon sx={{ color: location.pathname === item.path ? "#0b3875" : "inherit" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      color: location.pathname === item.path ? "#0b3875" : "inherit",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

          <Divider sx={{ my: 2 }} />

          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1.5, color: "#dc2626" }}>
              <ListItemIcon><Logout sx={{ color: "#dc2626" }} /></ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </>
  );
}

export default Navbar;
