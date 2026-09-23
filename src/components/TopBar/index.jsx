import { AppBar, Toolbar, Box, IconButton, Divider } from "@mui/material";
import HelpCenterIcon from "@mui/icons-material/HelpCenter";
import VectorExpressionInput from "./VectorExpressionInput";

const LogoBox = () => (
  <Box
    sx={{
      gridArea: "logo",
      display: "flex",
      alignItems: "center",
      gap: 2,
      minWidth: 0,
    }}
  >
    <Box
      component="span"
      sx={{
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 0.3,
        color: "text.primary",
        whiteSpace: "nowrap",
      }}
    >
      Embedding Analytics
    </Box>

    <Divider
      orientation="vertical"
      flexItem
      sx={{ display: { xs: "none", lg: "block" } }}
    />
  </Box>
);

export default function TopBar({
  expression,
  onExpressionChange,
  onDescribeSubmit,
  describeSubmitting,
  onHelpClick,
}) {
  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(10px)",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ width: "100%", py: 1 }}>
        <Box
          sx={{
            display: "grid",
            width: "100%",
            alignItems: "center",
            columnGap: 2,
            rowGap: 1.5,
            gridTemplateColumns: {
              xs: "minmax(0, 1fr) auto",
              lg: "auto minmax(0, 1fr) auto",
            },
            gridTemplateAreas: {
              xs: `"logo help" "input input"`,
              lg: `"logo input help"`,
            },
          }}
        >
          <LogoBox />

          <Box sx={{ gridArea: "input", minWidth: 0 }}>
            <VectorExpressionInput
              expression={expression}
              onExpressionChange={onExpressionChange}
              onDescribeSubmit={onDescribeSubmit}
              describeSubmitting={describeSubmitting}
            />
          </Box>

          <IconButton
            onClick={onHelpClick}
            sx={{ gridArea: "help", justifySelf: "end", color: "primary.main" }}
          >
            <HelpCenterIcon fontSize="large" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
