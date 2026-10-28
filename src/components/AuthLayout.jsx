import React from "react";
import { Box, Typography } from "@mui/material";
import healthCareImg from "../assets/HelthCare.jpg";

// Split screen for Login / Set Password: healthcare image on the left
// (top banner on phones) and the page's form card on the right
export function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        bgcolor: "#ffffff",
      }}
    >
      <Box
        sx={{
          flex: { md: "1 1 55%" },
          bgcolor: "#030c22",
          backgroundImage: "radial-gradient(circle at 70% 40%, #0b2a5c 0%, #030c22 70%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 0, md: 6 },
          py: { xs: 0, md: 6 },
          color: "#ffffff",
        }}
      >
        <Box
          component="img"
          src={healthCareImg}
          alt="Connected healthcare illustration"
          sx={{
            display: "block",
            width: "100%",
            maxWidth: { md: 560 },
            height: { xs: 180, sm: 240, md: "auto" },
            aspectRatio: { md: "6 / 5" },
            objectFit: "cover",
            // Focus on the illustration and crop the stock caption on the left
            objectPosition: "78% center",
            borderRadius: { xs: 0, md: 4 },
            boxShadow: { md: "0 20px 60px rgba(0, 120, 255, 0.25)" },
          }}
        />

        <Box sx={{ display: { xs: "none", md: "block" }, mt: 5, maxWidth: 560, width: "100%" }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
            Connected care, one record.
          </Typography>
          <Typography sx={{ color: "#93c5fd", mt: 1.5, lineHeight: 1.7 }}>
            Reception, doctors, nurses and super doctors work on the same patient journey —
            from intake to vitals to admission — with every step tracked securely.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: { md: "1 1 45%" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 4 },
          bgcolor: { xs: "#ffffff", md: "#f8fafc" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// Card style shared by the auth pages
export const authCardSx = {
  width: "100%",
  maxWidth: 440,
  borderRadius: 4,
  border: { xs: 0, md: "1px solid #e2e8f0" },
  boxShadow: { xs: "none", md: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" },
  bgcolor: "#ffffff",
};

export default AuthLayout;
