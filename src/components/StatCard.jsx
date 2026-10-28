import React from "react";
import { Card, CardContent, Typography, Box, Avatar, Button } from "@mui/material";

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "#334155",
  bgColor = "#f1f5f9",
  actionText,
  onAction,
}) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box className="d-flex align-items-center justify-content-between mb-2">
          <Typography variant="body2" sx={{ color: "#475569", fontWeight: 700, textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.05em" }}>
            {title}
          </Typography>
          <Avatar
            sx={{
              bgcolor: bgColor,
              color: color,
              width: 44,
              height: 44,
            }}
          >
            {icon}
          </Avatar>
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", my: 0.5 }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            {subtitle}
          </Typography>
        )}

        {actionText && onAction && (
          <Box sx={{ mt: 2, pt: 1, borderTop: "1px solid #f1f5f9" }}>
            <Button
              size="small"
              onClick={onAction}
              sx={{ color: "#1d4ed8", fontWeight: 600, p: 0, textTransform: "none" }}
            >
              {actionText} →
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
