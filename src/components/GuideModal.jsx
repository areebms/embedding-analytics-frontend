import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  MobileStepper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BarChartIcon from "@mui/icons-material/BarChart";
import DifferenceIcon from "@mui/icons-material/Difference";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";

function ExpressionChip({ label }) {
  return (
    <Chip
      label={label}
      variant="outlined"
      size="small"
      sx={{
        fontFamily: "monospace",
        bgcolor: "background.paper",
        maxWidth: "100%",
        "& .MuiChip-label": {
          overflowWrap: "anywhere",
          whiteSpace: "normal",
        },
      }}
    />
  );
}

function DescribeBlock({ children }) {
  return (
    <Box
      component="code"
      sx={{
        display: "inline-block",
        maxWidth: "100%",
        fontFamily: "monospace",
        fontSize: "0.8125rem",
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        px: 1.25,
        py: 0.25,
        overflowWrap: "anywhere",
      }}
    >
      {children}
    </Box>
  );
}

function GuideCard({ icon, title, children }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: 2.25, "&:last-child": { pb: 2.25 } }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              color: "primary.main",
              bgcolor: "action.hover",
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
              {title}
            </Typography>
            <Stack spacing={1}>{children}</Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StepHeader({ title }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Box>
  );
}

function ExploreStep() {
  return (
    <Box>
      <StepHeader title="Compare how different authors use the same word" />

      <Stack spacing={2.25}>
        <GuideCard icon={<SearchIcon fontSize="small" />} title="Overview">
          <Typography variant="body2" color="text.secondary">
            Search a word to see which concepts surround it across texts by
            Smith, Ricardo, Mill, Steuart, and Bastiat. Compare associations to
            spot shared vocabulary and track how ideas shift over time.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Go further with vector expressions. Enter{" "}
            <ExpressionChip label="labour + (productive - unproductive)" /> to
            probe a specific conceptual distinction rather than just browsing
            terms.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            If expressions feel like too much, switch the input to Describe and
            write what you want in plain English instead. The next step covers
            both.
          </Typography>
        </GuideCard>

        <GuideCard
          icon={<BarChartIcon fontSize="small" />}
          title="Reading the chart"
        >
          <Typography variant="body2" color="text.secondary">
            Books run along the horizontal axis in order of publication, so
            reading left to right is reading forward in time. Each line follows
            one term: your query, plus the terms used closest to it. Height shows
            how closely that term keeps the same company in each book — its{" "}
            <b>definitional agreement</b>, which is what the vertical axis
            measures.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The vertical axis runs below zero as well as above it. Above zero, a
            book keeps the company the other books also keep, and the higher it
            sits the more they agree. Around zero there is little shared context
            either way. Below zero the book keeps different company from the
            rest of the corpus for that term.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A line that drifts as it moves right is the thing to look at: the
            term is keeping different company in later books than in earlier
            ones. That change in agreement along a line is <b>definitional
            drift</b>, and it is the starting point for analysis — the movement
            matters more than any single point on it. Is the meaning of the word
            shifting over time? Is the author engaged in a different debate?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pin a book from the rail on the left to read every line relative to
            that author. With nothing pinned, each book is instead compared
            against all the others, showing how far it agrees with the corpus as
            a whole.
          </Typography>
        </GuideCard>
      </Stack>
    </Box>
  );
}

function QueryingStep() {
  return (
    <Box>
      <StepHeader title="Querying Concepts" />

      <Stack spacing={2.25}>
        <GuideCard
          icon={<DifferenceIcon fontSize="small" />}
          title="Vector expressions"
        >
          <Typography variant="subtitle2">Searching terms</Typography>
          <Typography variant="body2" color="text.secondary">
            Type a word into the search box and select from the autocomplete
            dropdown. The dropdown contains terms drawn directly from the
            corpus.
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Adding terms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Words can carry multiple meanings, so a single term query may return
            unrelated concepts. Use + to pull results toward a more specific
            meaning.
          </Typography>
          <Box>
            <ExpressionChip label="capital + profit" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Narrows the context around "capital", pulling it toward its economic
            sense and away from the geographical one.
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Subtracting terms
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Word2Vec places antonyms close together, so a single term query may
            return opposites. Use - to push an unwanted direction away.
          </Typography>
          <Box>
            <ExpressionChip label="productive - unproductive" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Pushes the query away from association with "unproductive" to
            isolate what is distinctive about "productive".
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 1 }}>
            Combining expressions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Without parentheses,{" "}
            <ExpressionChip label="labour + productive - unproductive" />{" "}
            averages all three directions together. With parentheses,{" "}
            <ExpressionChip label="labour + (productive - unproductive)" />{" "}
            isolates the productive/unproductive contrast first, then adds
            "labour". This surfaces terms similar to productive labour but not
            unproductive labour.
          </Typography>
        </GuideCard>

        <GuideCard icon={<AutoAwesomeIcon fontSize="small" />} title="Describe">
          <Typography variant="body2" color="text.secondary">
            Describe what you are looking for in plain English without needing
            to know how to construct an expression. The tool handles the
            translation. For example,{" "}
            <DescribeBlock>
              productive vs unproductive labour
            </DescribeBlock>{" "}
            produces{" "}
            <ExpressionChip label="labour + (productive - unproductive)" />. If
            a term in your description is not in the corpus, the closest match
            is substituted and flagged.
          </Typography>
        </GuideCard>
      </Stack>
    </Box>
  );
}

const steps = [ExploreStep, QueryingStep];

export default function GuideModal({ open, onClose }) {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const StepContent = steps[activeStep];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      TransitionProps={{ onExited: () => setActiveStep(0) }}
      PaperProps={{
        sx: { borderRadius: { xs: 0, sm: 2.5 } },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Using Embedding Analytics
      </DialogTitle>

      <DialogContent>
        <StepContent />
      </DialogContent>

      <MobileStepper
        variant="dots"
        steps={steps.length}
        position="static"
        activeStep={activeStep}
        sx={{ bgcolor: "transparent", px: 3, py: 1.5 }}
        nextButton={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={() => setActiveStep((s) => s + 1)}
              disabled={activeStep === steps.length - 1}
            >
              Next
              <KeyboardArrowRight />
            </Button>
            <Button size="small" onClick={onClose}>
              Close
            </Button>
          </Stack>
        }
        backButton={
          <Button
            size="small"
            onClick={() => setActiveStep((s) => s - 1)}
            disabled={activeStep === 0}
          >
            <KeyboardArrowLeft />
            Back
          </Button>
        }
      />
    </Dialog>
  );
}
