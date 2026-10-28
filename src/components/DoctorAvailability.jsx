import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import api from "../api/axios";

const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const createDefaultSchedule = () =>
  weekdays.map((weekday) => ({
    weekday,
    start_time: "09:00",
    end_time: "17:00",
    is_available: !["saturday", "sunday"].includes(weekday),
  }));

// API is paginated ({ results: [...] }), but accept a plain array too
const toList = (data) =>
  Array.isArray(data) ? data : data?.results || [];

const mergeSaved = (previous, savedSchedules) =>
  previous.map((day) => {
    const saved = savedSchedules.find((item) => item.weekday === day.weekday);

    return saved
      ? {
          ...day,
          ...saved,
          start_time: (saved.start_time || day.start_time).slice(0, 5),
          end_time: (saved.end_time || day.end_time).slice(0, 5),
        }
      : day;
  });

export default function DoctorAvailability({ showToast }) {
  const [schedule, setSchedule] = useState(createDefaultSchedule());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await api.get("doctor-availability/");
        const savedSchedules = toList(response.data);

        setSchedule((previous) => mergeSaved(previous, savedSchedules));
      } catch (error) {
        showToast(
          error.response?.data?.detail ||
            "Unable to load doctor availability.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [showToast]);

  const updateDay = (weekday, field, value) => {
    setSchedule((previous) =>
      previous.map((day) =>
        day.weekday === weekday
          ? { ...day, [field]: value }
          : day
      )
    );
  };

  const saveSchedule = async () => {
    setSaving(true);

    try {
      for (const day of schedule) {
        const payload = {
          weekday: day.weekday,
          start_time: day.start_time,
          end_time: day.end_time,
          is_available: day.is_available,
        };

        if (day.is_available && day.start_time >= day.end_time) {
          showToast(
            `End time must be later than start time on ${day.weekday}.`,
            "error"
          );
          return;
        }

        const existing = day.id;

        if (existing) {
          await api.patch(`doctor-availability/${existing}/`, payload);
        } else {
          await api.post("doctor-availability/", payload);
        }
      }

      showToast("Doctor availability saved successfully.");
      const response = await api.get("doctor-availability/");

      const savedSchedules = toList(response.data);

      setSchedule((previous) => mergeSaved(previous, savedSchedules));
    } catch (error) {
      const data = error.response?.data;
      const message =
        data?.detail ||
        data?.weekday?.[0] ||
        data?.start_time?.[0] ||
        data?.end_time?.[0] ||
        "Unable to save doctor availability.";

      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 3,
        p: 3,
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Doctor Availability
      </Typography>

      <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
        Set your weekly working days and hours. Available hours are used to
        generate one-hour appointment slots.
      </Typography>

      {schedule.map((day) => (
        <Box
          key={day.weekday}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1.2fr 1fr 1fr 1fr",
            },
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={day.is_available}
                onChange={(event) =>
                  updateDay(
                    day.weekday,
                    "is_available",
                    event.target.checked
                  )
                }
              />
            }
            label={
              day.weekday.charAt(0).toUpperCase() +
              day.weekday.slice(1)
            }
          />

          <TextField
            label="Start time"
            type="time"
            size="small"
            value={day.start_time}
            disabled={!day.is_available}
            onChange={(event) =>
              updateDay(day.weekday, "start_time", event.target.value)
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="End time"
            type="time"
            size="small"
            value={day.end_time}
            disabled={!day.is_available}
            onChange={(event) =>
              updateDay(day.weekday, "end_time", event.target.value)
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Typography variant="body2" color="text.secondary">
            {day.is_available ? "Working day" : "Day off"}
          </Typography>
        </Box>
      ))}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={saveSchedule}
          disabled={saving}
          sx={{ textTransform: "none" }}
        >
          {saving ? "Saving..." : "Save Availability"}
        </Button>
      </Box>
    </Paper>
  );
}
