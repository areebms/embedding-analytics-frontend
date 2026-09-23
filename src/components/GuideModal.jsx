import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SouthIcon from "@mui/icons-material/South";
import { labels } from "../content/labels";
import { TERM_TYPE_COLOR } from "./charts/palette";

const BODY_LINE_HEIGHT = 1.6;

function Body({ children, sx }) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ lineHeight: BODY_LINE_HEIGHT, ...sx }}
    >
      {children}
    </Typography>
  );
}

function Section({ title, children }) {
  return (
    <Box component="section">
      <Typography
        variant="h6"
        component="h3"
        sx={{ fontSize: "1.125rem", fontWeight: 700, mb: 1 }}
      >
        {title}
      </Typography>
      <Stack spacing={1.5}>{children}</Stack>
    </Box>
  );
}

function SubSection({ title, children }) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" component="h4" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
}

// One chip per token, as the query input draws them.
function Expression({ value }) {
  const tokens = value.replace(/([()])/g, " $1 ").trim().split(/\s+/);
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {tokens.map((token, i) => (
        <Chip key={`${i}-${token}`} label={token} size="small" />
      ))}
    </Box>
  );
}

function Operator({ children }) {
  return (
    <Box
      component="code"
      sx={{
        px: 0.75,
        borderRadius: 1,
        bgcolor: "action.selected",
        fontFamily: "monospace",
        fontWeight: 700,
        color: "text.primary",
      }}
    >
      {children}
    </Box>
  );
}

function Example({ label, caption, children }) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      {label && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontWeight: 600, mb: 0.75 }}
        >
          {label}
        </Typography>
      )}
      {children}
      {caption && <Body sx={{ mt: 1 }}>{caption}</Body>}
    </Box>
  );
}

function DescribeText({ children }) {
  return (
    <Box
      sx={{
        display: "inline-block",
        maxWidth: "100%",
        px: 1.25,
        py: 0.25,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        typography: "body2",
        overflowWrap: "anywhere",
      }}
    >
      “{children}”
    </Box>
  );
}

function TermKind({ type, children }) {
  return (
    <ListItem disableGutters sx={{ alignItems: "flex-start", gap: 1.25, py: 0.5 }}>
      <Box
        sx={{
          width: 10,
          height: 10,
          mt: "6px",
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: TERM_TYPE_COLOR[type],
        }}
      />
      <Body>
        <Box component="span" sx={{ fontWeight: 700, color: "text.primary" }}>
          {labels.comparativeTerms.types[type]} terms
        </Box>{" "}
        {children}
      </Body>
    </ListItem>
  );
}

function IntroductionTab() {
  return (
    <Stack spacing={3}>
      <Typography variant="body1" sx={{ lineHeight: BODY_LINE_HEIGHT }}>
        Two documents can use the same word to mean vastly different things.
        Embedding Analytics measures that difference. For each text, the tool
        encodes which words tend to appear in similar surroundings into
        numerical word vectors (using PPMI + SVD). Semantically similar words
        end up with similar vectors. When you enter a query, the tool finds the
        terms whose usage in each text most resembles the query's.
      </Typography>

      <Section title="Making texts comparable">
        <Body>
          Since each text's vectors are built independently, the vector
          similarities from different texts are not directly comparable. To
          correct this, the query's average similarity to its 75 closest terms
          in each text is treated as that text's baseline. Each text's
          similarities are then shifted so that its baseline equals the average
          baseline across all texts, which makes them more comparable. This
          adjustment is adapted from cross-domain similarity local scaling (
          <Link
            href="https://arxiv.org/abs/1710.04087"
            target="_blank"
            rel="noopener"
          >
            Conneau et al., 2018
          </Link>
          ).
        </Body>
        <Body
          sx={{
            color: "text.primary",
            borderLeft: 3,
            borderColor: "divider",
            pl: 1.5,
          }}
        >
          Adjusted similarities from different queries cannot be compared.
        </Body>
      </Section>

      <Section title="Selecting relevant terms">
        <Body>
          A term is considered relevant if its adjusted similarity to the query
          is above the baseline in at least 20% of the texts. For each relevant
          term, the tool calculates its mean adjusted similarity and the
          standard deviation of that similarity across the collection. Two
          lists of six terms are then chosen:
        </Body>
        <List disablePadding>
          <TermKind type="consistent">
            have the highest mean similarity. They are closely tied to the
            query across the collection.
          </TermKind>
          <TermKind type="contested">
            have the highest standard deviation. They are close to the query in
            some texts but not in others, which shows where its meaning shifts.
          </TermKind>
        </List>
      </Section>
    </Stack>
  );
}

function QueryingTab() {
  return (
    <Stack spacing={3}>
      <Section title="Vector expressions">
        <Stack spacing={2.5}>
          <SubSection title="Searching terms">
            <Body>
              Type a word into the search box and select from the autocomplete
              dropdown. The dropdown contains terms drawn directly from the
              corpus.
            </Body>
          </SubSection>

          <SubSection title="Adding terms">
            <Body>
              Words can carry multiple meanings, so a single term query may
              return unrelated concepts. Use <Operator>+</Operator> to pull
              results toward a more specific meaning.
            </Body>
            <Example caption='Narrows the context around "capital", pulling it toward its economic sense and away from the geographical one.'>
              <Expression value="capital + profit" />
            </Example>
          </SubSection>

          <SubSection title="Subtracting terms">
            <Body>
              Opposites tend to be discussed in the same company, so they sit
              close together and a single term query may return them. Use{" "}
              <Operator>-</Operator> to push an unwanted direction away.
            </Body>
            <Example caption='Pushes the query away from association with "unproductive" to isolate what is distinctive about "productive".'>
              <Expression value="productive - unproductive" />
            </Example>
          </SubSection>

          <SubSection title="Combining expressions">
            <Example
              label="Without parentheses"
              caption="Averages all three directions together."
            >
              <Expression value="labour + productive - unproductive" />
            </Example>
            <Example
              label="With parentheses"
              caption='Isolates the productive/unproductive contrast first, then adds "labour". This surfaces terms similar to productive labour but not unproductive labour.'
            >
              <Expression value="labour + (productive - unproductive)" />
            </Example>
          </SubSection>
        </Stack>
      </Section>

      <Divider />

      <Section title="Describe">
        <Body>
          Describe what you are looking for in plain English without needing to
          know how to construct an expression. The tool handles the
          translation.
        </Body>
        <Example>
          <Stack spacing={0.75} alignItems="flex-start">
            <DescribeText>productive vs unproductive labour</DescribeText>
            <SouthIcon
              fontSize="small"
              sx={{ color: "text.secondary", ml: 1 }}
            />
            <Expression value="labour + (productive - unproductive)" />
          </Stack>
        </Example>
        <Body>
          If a term in your description is not in the corpus, the closest match
          is substituted and flagged.
        </Body>
      </Section>
    </Stack>
  );
}

const tabs = [
  { label: "Introduction", Content: IntroductionTab },
  { label: "Querying concepts", Content: QueryingTab },
];

export default function GuideModal({ open, onClose }) {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const TabContent = tabs[tab].Content;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      aria-labelledby="guide-title"
      TransitionProps={{ onExited: () => setTab(0) }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2.5 },
          height: { sm: "min(720px, 90vh)" },
        },
      }}
    >
      <DialogTitle id="guide-title" sx={{ fontWeight: 700, pr: 7, pb: 0.5 }}>
        Using Embedding Analytics
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Tabs
        value={tab}
        onChange={(_, next) => setTab(next)}
        sx={{ px: 1.5, borderBottom: 1, borderColor: "divider" }}
      >
        {tabs.map(({ label }, i) => (
          <Tab
            key={label}
            label={label}
            id={`guide-tab-${i}`}
            aria-controls="guide-tabpanel"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
        ))}
      </Tabs>

      {/* Keyed so a tab switch starts at the top rather than at the old scroll. */}
      <DialogContent
        key={tab}
        role="tabpanel"
        id="guide-tabpanel"
        aria-labelledby={`guide-tab-${tab}`}
        sx={{ pt: 3 }}
      >
        <TabContent />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, borderTop: 1, borderColor: "divider" }}>
        <Button
          variant="contained"
          disableElevation
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
}
