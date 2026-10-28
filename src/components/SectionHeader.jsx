import React from "react";
import { Box, Typography, Chip } from "@mui/material";

// Consistent page/section heading used above tables
export function SectionHeader({ title, subtitle, count, action, variant = "h6" }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "flex-end" },
        flexWrap: "wrap",
        gap: 1.5,
        mb: 1.5,
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant={variant} sx={{ fontWeight: 800, color: "#0f172a" }}>
            {title}
          </Typography>
          {count !== undefined && (
            <Chip
              size="small"
              label={count}
              sx={{ bgcolor: "#e0e7ff", color: "#3730a3", fontWeight: 700, height: 22 }}
            />
          )}
        </Box>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}

export default SectionHeader;
