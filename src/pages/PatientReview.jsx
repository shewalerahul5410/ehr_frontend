import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Container, CircularProgress, Alert, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import api from "../api/axios";
import Navbar from "../components/Navbar";
import PatientWorkflowModal from "../components/PatientWorkflowModal";

export function PatientReview() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, patientRes] = await Promise.all([
          api.get("auth/me/"),
          api.get(`patients/${patientId}/`),
        ]);
        setCurrentUser(userRes.data);
        setPatient(patientRes.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load patient.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f6fb" }}>
      <Navbar user={currentUser} />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/patients")} sx={{ mb: 2, textTransform: "none" }}>
          Back to Patients
        </Button>

        {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : patient && (
          <PatientWorkflowModal
            asPage
            patient={patient}
            currentUser={currentUser}
            onWorkflowUpdated={setPatient}
          />
        )}
      </Container>
    </Box>
  );
}

export default PatientReview;
