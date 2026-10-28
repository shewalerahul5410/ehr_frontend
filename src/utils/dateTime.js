// All appointment dates/times are stored in UTC on the server and
// shown / entered in the browser's local time zone. Use these helpers everywhere.

const pad = (n) => String(n).padStart(2, "0");

// Local "YYYY-MM-DD" for <input type="date">
export const toDateInput = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Local "HH:MM" for <input type="time">
export const toTimeInput = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Combine local date + time inputs into a UTC ISO string for the API
export const toApiDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}`).toISOString();

// Short zone name of this browser, e.g. "IST", "GMT+5:30"
export const zoneName = () =>
  new Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
    .formatToParts(new Date())
    .find((p) => p.type === "timeZoneName")?.value || "";

const parse = (value) => {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

// "26 Oct 2026"
export const formatDate = (value) => {
  const d = parse(value);
  return d ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
};

// "10:00 AM IST"
export const formatTime = (value) => {
  const d = parse(value);
  return d ? `${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} ${zoneName()}` : "—";
};
