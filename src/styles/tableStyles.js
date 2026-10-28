// Shared table styles — declared once here and imported by every table.
// Order: 1) colors  2) container/toolbar  3) tabs  4) cells  5) chips  6) pagination

// 1) Neutral color palette (only one accent blue for actions)
export const COLORS = {
  text: "#0f172a",
  textMuted: "#64748b",
  textLight: "#94a3b8",
  border: "#e2e8f0",
  rowAlt: "#fcfdfe",
  surface: "#ffffff",
  subtle: "#f1f5f9",
  accent: "#1d4ed8",
};

// 2) Card wrapper and toolbar above a table
export const tableCardSx = {
  backgroundColor: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: "12px",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  overflow: "hidden",
};

export const toolbarSx = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 1.5,
  px: 2.5,
  py: 2,
};

export const tableContainerSx = { borderTop: `1px solid ${COLORS.border}`, overflowX: "auto" };

// 3) Segmented tabs (Upcoming / Past, stage filters)
export const segmentedTabsSx = {
  bgcolor: COLORS.subtle,
  p: 0.5,
  borderRadius: "10px",
  flexWrap: "wrap",
  "& .MuiToggleButton-root": {
    border: 0,
    borderRadius: "8px !important",
    px: 2,
    py: 0.6,
    fontWeight: 600,
    fontSize: "0.84rem",
    color: COLORS.textMuted,
    textTransform: "none",
  },
  "& .Mui-selected": {
    bgcolor: `${COLORS.surface} !important`,
    color: `${COLORS.accent} !important`,
    boxShadow: "0 1px 3px rgba(15,23,42,0.12)",
  },
};

// 4) Rows and cells
export const rowSx = (idx) => ({
  bgcolor: idx % 2 ? COLORS.rowAlt : COLORS.surface,
  "&:last-child td": { border: 0 },
});

export const primaryTextSx = { fontSize: "0.86rem", fontWeight: 700, color: COLORS.text, lineHeight: 1.3 };
export const secondaryTextSx = { fontSize: "0.76rem", color: COLORS.textLight };

export const avatarSx = {
  width: 34,
  height: 34,
  fontSize: "0.78rem",
  fontWeight: 700,
  bgcolor: COLORS.subtle,
  color: "#334155",
  border: `1px solid ${COLORS.border}`,
};

// 5) Neutral chip used for status / stage / priority
export const neutralChipSx = {
  bgcolor: COLORS.subtle,
  color: "#334155",
  border: `1px solid ${COLORS.border}`,
  fontWeight: 600,
  fontSize: "0.75rem",
  textTransform: "capitalize",
};

// 6) Pagination footer
export const paginationSx = { borderTop: `1px solid ${COLORS.border}`, color: COLORS.textMuted };
