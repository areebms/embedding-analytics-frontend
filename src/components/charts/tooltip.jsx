import { Box } from "@mui/material";

// The app's tooltip convention: a dark card, a title, then label/number rows
// read down a shared right edge. Both charts show it, so it lives here rather
// than inside either of them. Everything is exported as a component -- the
// styling stays private, so there is no loose `sx` object for a caller to
// half-adopt.
const SURFACE = {
  background: "rgba(17,24,39,0.94)",
  color: "#fff",
  borderRadius: 1,
  px: 1.5,
  py: 1,
  fontSize: 12,
  lineHeight: 1.55,
  pointerEvents: "none",
  boxShadow: 3,
  whiteSpace: "nowrap",
};

const MARKER_SIZE = 8;

// `sx` is for placement only -- the scatter positions its card absolutely
// against a hovered point, the line chart lets recharts place it.
export function TooltipCard({ sx, children }) {
  return <Box sx={{ ...SURFACE, ...sx }}>{children}</Box>;
}

export function TooltipTitle({ children }) {
  return <div style={{ fontWeight: 700, marginBottom: 4 }}>{children}</div>;
}

// `marker` fills the swatch, `outline` draws it hollow -- the scatter needs the
// latter to key a row to an unfilled dot. `indent` aligns a qualifier line
// under the value it qualifies.
export function TooltipRow({ marker, outline, label, indent, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 6,
        ...(indent && { marginLeft: MARKER_SIZE + 6 }),
      }}
    >
      {(marker || outline) && (
        <span
          style={{
            flex: "0 0 auto",
            width: MARKER_SIZE,
            height: MARKER_SIZE,
            borderRadius: "50%",
            background: marker ?? "transparent",
            border: outline ? `1.5px solid ${outline}` : "none",
            boxSizing: "border-box",
            display: "inline-block",
          }}
        />
      )}
      <span>{label}</span>
      <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums" }}>
        {children}
      </span>
    </div>
  );
}
