import { useState, useRef, useMemo, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Autocomplete,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { Option } from "../../types/vectorExpression";
import type { ParseDescribeResponse, TermResponse } from "../../types/api";
import { ApiError, describeDescribeError } from "../../api/errors";
import type { DescribeNotice } from "../../api/errors";
import { buildOptions } from "../../utils/vectorExpressionOptions";
import { useVectorExpression } from "../../hooks/useVectorExpression";
import { useTerms } from "../../api/queries";

function VectorExpressionChips({
  expressionItems,
  onRemove,
}: {
  expressionItems: string[];
  onRemove: (index: number) => void;
}) {
  if (!expressionItems.length) return null;
  return (
    <InputAdornment
      position="start"
      sx={{
        display: "flex",
        flexWrap: "nowrap",
        gap: 0,
        height: "auto",
        maxWidth: "100%",
        minWidth: 0,
        mr: 0,
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {expressionItems.map((expressionItem, i) => (
        <Chip
          key={`${i}-${expressionItem}`}
          label={expressionItem}
          size="small"
          onDelete={() => onRemove(i)}
          sx={{ flexShrink: 0 }}
        />
      ))}
    </InputAdornment>
  );
}

/**
 * Resolve free-typed text to a vocabulary term, case-insensitively. Returns
 * null when the text names nothing in the corpus -- inventing a term would send
 * a word the embeddings have never seen.
 */
function matchTerm(text: string, allTerms: TermResponse[]): Option | null {
  const needle = text.trim().toLowerCase();
  if (!needle) return null;
  const hit = allTerms.find(({ term }) => term.toLowerCase() === needle);
  return hit ? { type: "term", value: hit.term, label: hit.term, hint: "" } : null;
}

type InputMode = "describe" | "vector";

function InputModeControl({
  mode,
  onModeChange,
}: {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<ExpandMoreIcon fontSize="small" />}
        sx={{
          color: "text.secondary",
          textTransform: "none",
          fontSize: 16,
          fontWeight: 400,
          px: 1,
          width: 100,
          flexShrink: 0,
          "&:hover": {
            bgcolor: "transparent",
          },
        }}
      >
        {mode === "describe" ? "Describe" : "Vector"}
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem
          selected={mode === "describe"}
          onClick={() => {
            onModeChange("describe");
            setAnchorEl(null);
          }}
        >
          Describe
        </MenuItem>

        <MenuItem
          selected={mode === "vector"}
          onClick={() => {
            onModeChange("vector");
            setAnchorEl(null);
          }}
        >
          Vector
        </MenuItem>
      </Menu>
    </>
  );
}

function VectorExpressionSubmitButton({
  disabled,
  disabledReason,
  loading,
  onSubmit,
}: {
  disabled?: boolean;
  disabledReason?: string;
  loading?: boolean;
  onSubmit?: () => void;
}) {
  return (
      <Tooltip title={disabled && disabledReason ? disabledReason : "Submit"}>
        <span style={{ alignSelf: "stretch", display: "flex" }}>
          <Button
            aria-label="Submit expression"
            disabled={disabled || loading}
            onClick={onSubmit}
            onMouseDown={(e) => e.preventDefault()}
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              width: 40,
              minWidth: 0,
              px: 0,
              alignSelf: "stretch",
              borderRadius: "0 4px 4px 0",
              "&:hover": {
                bgcolor: "primary.dark",
              },
              "&.Mui-disabled": {
                bgcolor: "action.disabledBackground",
                color: "action.disabled",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <PlayArrowIcon fontSize="large" />
            )}
          </Button>
        </span>
      </Tooltip>
  );
}


function TermOption({
  option,
  optionProps,
}: {
  option: Option;
  optionProps: React.HTMLAttributes<HTMLLIElement>;
}) {
  const isOperator = option.type === "op";

  return (
    <Box
      component="li"
      {...optionProps}
      sx={isOperator ? { bgcolor: "grey.50 !important" } : undefined}
    >
      <ListItemText
        primary={
          <Typography
            variant="body2"
            sx={
              isOperator
                ? { fontWeight: 700, fontFamily: "monospace" }
                : undefined
            }
          >
            {option.label}
          </Typography>
        }
        secondary={
          <Typography variant="caption" color="text.secondary">
            {option.hint}
          </Typography>
        }
      />
    </Box>
  );
}

export default function VectorExpressionInput({
  expression,
  onExpressionChange,
  onDescribeSubmit,
  describeSubmitting,
}: {
  expression: string;
  onExpressionChange: (expression: string) => void;
  onDescribeSubmit: (message: string) => Promise<ParseDescribeResponse>;
  describeSubmitting: boolean;
}) {
  const { data: allTerms = [] } = useTerms();
  const [mode, setMode] = useState<InputMode>("vector");
  const [draftExpression, setDraftExpression] = useState(expression);
  const { expressionItems, addExpressionItem, removeExpressionItem, isValid } =
    useVectorExpression(draftExpression, setDraftExpression);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // `expression` is URL-derived, so it also changes from OUTSIDE this input --
  // Back/Forward, or a term clicked in the results table. Without this re-seed
  // the chips keep showing the old expression while the chart plots the new
  // one. Remounting on a `key` would do it too, but would also destroy the
  // describe notice that handleDescribeSubmit sets in the same tick.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraftExpression(expression);
  }, [expression]);

  const [describeMessage, setDescribeMessage] = useState("");
  const [notice, setNotice] = useState<DescribeNotice | null>(null);

  const options = useMemo(
    () => (open ? buildOptions(expressionItems, allTerms, inputValue) : []),
    [open, expressionItems, allTerms, inputValue],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Backspace" &&
      inputValue === "" &&
      expressionItems.length > 0
    ) {
      e.preventDefault();
      removeExpressionItem(expressionItems.length - 1);
    }
  };

  const handleVectorSubmit = () => {
    onExpressionChange(draftExpression);
  };

  const handleDescribeSubmit = async () => {
    const trimmed = describeMessage.trim();
    if (!trimmed) return;

    setNotice(null);
    try {
      const result = await onDescribeSubmit(trimmed);
      setDraftExpression(result.expression);
      setMode("vector");

      if (result.substitutions.length) {
        const lines = result.substitutions.map(
          (s) => `"${s.original}" resolved to "${s.resolved}"`,
        );
        setNotice({ severity: "info", text: lines.join("; ") });
      }
    } catch (err) {
      setNotice(describeDescribeError(err instanceof ApiError ? err : null));
    }
  };

  const applyCandidate = (from: string, to: string) => {
    const pattern = new RegExp(
      `\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
      "gi",
    );
    const next = describeMessage.replace(pattern, to);
    setDescribeMessage(
      next === describeMessage ? `${describeMessage} (use "${to}")` : next,
    );
    setNotice(null);
  };

  const handleDescribeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleDescribeSubmit();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          height: 40,
          minWidth: 0,
          width: "100%",
        }}
      >
        <InputModeControl mode={mode} onModeChange={setMode} />

        {mode === "vector" ? (
          <>
            <Autocomplete
              freeSolo
              autoHighlight
              disableClearable
              forcePopupIcon={false}
              open={open}
              onOpen={() => setOpen(true)}
              onClose={() => setOpen(false)}
              options={options}
              getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.label)}
              filterOptions={(x) => x}
              sx={{ flex: 1, minWidth: 0 }}
              inputValue={inputValue}
              onInputChange={(_, value, reason) => {
                if (reason === "input") {
                  setInputValue(value);
                  if (!open) setOpen(true);
                }
              }}
              onChange={(_, option) => {
                // freeSolo hands back a raw STRING when Enter is pressed with
                // no option highlighted. Dropping it made Enter a no-op while
                // Submit stayed disabled for the same input; resolve it against
                // the vocabulary instead.
                const resolved =
                  typeof option === "string"
                    ? matchTerm(option, allTerms)
                    : option;
                if (!resolved) return;
                addExpressionItem(resolved.value);
                setInputValue("");
                if (resolved.type === "op") {
                  requestAnimationFrame(() => setOpen(true));
                }
                requestAnimationFrame(() => inputRef.current?.focus());
              }}
              renderOption={(props, opt) => {
                const { key, ...rest } = props;
                return <TermOption key={key} option={opt} optionProps={rest} />;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={inputRef}
                  onKeyDown={handleKeyDown}
                  placeholder={expressionItems.length === 0 ? "Select a term" : ""}
                  label="Vector Expression"
                  size="small"
                  error={!isValid}
                  autoComplete="off"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <VectorExpressionChips
                        expressionItems={expressionItems}
                        onRemove={removeExpressionItem}
                      />
                    ),
                    sx: {
                      minWidth: 0,
                      flexWrap: "nowrap",
                      overflow: "hidden",
                      "& .MuiAutocomplete-input": {
                        minWidth: 0,
                      },
                      "& .MuiInputAdornment-root": {
                        flexWrap: "nowrap",
                        height: "auto",
                        minWidth: 0,
                      },
                    },
                  }}
                  sx={{
                    minWidth: 0,
                    "& .MuiOutlinedInput-root": {
                      mx: 0,
                      px: 0,
                      bgcolor: "background.paper",
                      borderTopRightRadius: 0,
                      borderBottomRightRadius: 0,
                    },
                  }}
                />
              )}
              fullWidth
            />

            <VectorExpressionSubmitButton
              disabled={!isValid || inputValue.trim().length !== 0}
              disabledReason={
                inputValue.trim().length !== 0
                  ? "Pick a term from the list, or clear the box, before submitting"
                  : "This expression isn't complete yet"
              }
              onSubmit={handleVectorSubmit}
            />
          </>
        ) : (
          <>
            <TextField
              value={describeMessage}
              onChange={(e) => setDescribeMessage(e.target.value)}
              onKeyDown={handleDescribeKeyDown}
              placeholder="e.g. compare labour and capital"
              label="Describe"
              size="small"
              autoComplete="off"
              sx={{
                flex: 1,
                minWidth: 0,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "background.paper",
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            />

            <VectorExpressionSubmitButton
              disabled={describeMessage.trim().length === 0}
              loading={describeSubmitting}
              onSubmit={handleDescribeSubmit}
            />
          </>
        )}
      </Box>

      {notice && (
        <Alert
          severity={notice.severity}
          onClose={() => setNotice(null)}
          sx={{ py: 0, fontSize: 13 }}
        >
          {notice.text}
          {notice.candidates?.length ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.5,
                mt: 0.5,
                alignItems: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Did you mean:
              </Typography>
              {notice.candidates.map((candidate) => (
                <Chip
                  key={candidate}
                  label={candidate}
                  size="small"
                  variant="outlined"
                  onClick={() => applyCandidate(notice.term ?? "", candidate)}
                />
              ))}
            </Box>
          ) : null}
        </Alert>
      )}
    </Box>
  );
}
