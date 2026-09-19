import { Chip } from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import { QUERY_COLOR } from "../charts/palette";

export default function BookChip({ label, active, selected, onSelect, clickable }) {
  return (
    <Chip
      label={label}
      size="medium"
      variant={selected ? "filled" : "outlined"}
      clickable={clickable}
      onClick={clickable ? onSelect : undefined}
      icon={selected ? <PushPinIcon /> : undefined}
      sx={{
        width: { xs: "auto", md: "100%" },
        flexShrink: { xs: 0, md: "unset" },
        justifyContent: "flex-start",
        bgcolor: selected ? QUERY_COLOR : "transparent",
        color: selected ? "#fff" : active ? "text.primary" : "grey",
        border: "1px solid",
        borderColor: selected ? QUERY_COLOR : active ? "divider" : "grey",
        fontWeight: selected ? 700 : 600,
        opacity: active ? 1 : 0.5,
        "& .MuiChip-icon": { color: "#fff" },
        "& .MuiChip-label": { px: 1.5 },
      }}
    />
  );
}
