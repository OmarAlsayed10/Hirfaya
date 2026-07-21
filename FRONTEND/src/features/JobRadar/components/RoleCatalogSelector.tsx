import { memo, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import AddCommentRoundedIcon from "@mui/icons-material/AddCommentRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { JOB_ENDPOINTS } from "../../../constants/endpoints";
import { useFeedback } from "../../../context/FeedbackContext";

const PRIMARY = "#2a5c45";
const MAX_SELECTED_ROLES = 5;

export interface JobRoleOption {
  id: string;
  name: string;
  nameAr: string;
}

export interface JobCategoryOption {
  id: string;
  name: string;
  nameAr: string;
  roles: JobRoleOption[];
}

const localizedName = (option: { name: string; nameAr: string }, language: string): string =>
  language.startsWith("ar") ? option.nameAr || option.name : option.name;

interface RoleCatalogSelectorProps {
  categories: JobCategoryOption[];
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
}

const RoleCatalogSelector = ({ categories, selectedRoleIds, onChange }: RoleCatalogSelectorProps) => {
  const { t, i18n } = useTranslation();
  const { notify } = useFeedback();
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!categories.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId(categories[0]?.id ?? "");
    }
  }, [activeCategoryId, categories]);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeCategoryId) ?? categories[0],
    [activeCategoryId, categories],
  );

  const toggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      onChange(selectedRoleIds.filter((id) => id !== roleId));
      return;
    }
    if (selectedRoleIds.length >= MAX_SELECTED_ROLES) {
      notify(t("You can select up to five roles."), "warning");
      return;
    }
    onChange([...selectedRoleIds, roleId]);
  };

  const submitSuggestion = async () => {
    if (categoryName.trim().length < 2 || roleName.trim().length < 2) {
      notify(t("Enter both a category and a role."), "warning");
      return;
    }
    setSending(true);
    try {
      await axios.post(
        JOB_ENDPOINTS.suggestions,
        { categoryName, roleName, note },
        { withCredentials: true },
      );
      setCategoryName("");
      setRoleName("");
      setNote("");
      setSuggestionOpen(false);
      notify(t("Suggestion sent for admin review."), "success");
    } catch (error: any) {
      notify(error.response?.data?.message || t("Could not send your suggestion."));
    } finally {
      setSending(false);
    }
  };

  if (categories.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
        <Typography color="text.secondary">{t("No job fields are available yet.")}</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, overflow: "hidden", borderColor: "rgba(42,92,69,0.18)" }}>
      <Box sx={{ display: { xs: "block", md: "grid" }, gridTemplateColumns: "250px 1fr" }}>
        <Box
          sx={{
            p: 2,
            bgcolor: "rgba(42,92,69,0.055)",
            borderInlineEnd: { md: "1px solid rgba(42,92,69,0.12)" },
            display: { xs: "flex", md: "block" },
            overflowX: { xs: "auto", md: "visible" },
            gap: 1,
          }}
        >
          {categories.map((category) => {
            const active = category.id === activeCategory?.id;
            const selectedCount = category.roles.filter((role) => selectedRoleIds.includes(role.id)).length;
            return (
              <Button
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                startIcon={<CategoryRoundedIcon />}
                endIcon={selectedCount ? <Chip size="small" label={selectedCount} /> : undefined}
                sx={{
                  minWidth: { xs: "max-content", md: "100%" },
                  justifyContent: "flex-start",
                  textTransform: "none",
                  color: active ? "white" : "text.primary",
                  bgcolor: active ? PRIMARY : "transparent",
                  borderRadius: 2.5,
                  mb: { md: 0.75 },
                  px: 1.5,
                  paddingInlineEnd: selectedCount ? 5 : 1.5,
                  position: "relative",
                  "&:hover": { bgcolor: active ? "#1e4332" : "rgba(42,92,69,0.09)" },
                  "& .MuiButton-endIcon": {
                    position: "absolute",
                    insetInlineEnd: 10,
                    top: "50%",
                    m: 0,
                    transform: "translateY(-50%)",
                  },
                }}
              >
                {localizedName(category, i18n.resolvedLanguage ?? i18n.language)}
              </Button>
            );
          })}
        </Box>

        <Box sx={{ p: { xs: 2.25, md: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <WorkOutlineRoundedIcon sx={{ color: PRIMARY }} />
            <Typography fontWeight={800}>{activeCategory ? localizedName(activeCategory, i18n.resolvedLanguage ?? i18n.language) : t("Choose roles")}</Typography>
            <Chip
              size="small"
              label={t("{{count}} of 5 selected", { count: selectedRoleIds.length })}
              sx={{ marginInlineStart: "auto", bgcolor: "rgba(42,92,69,0.1)", color: PRIMARY, fontWeight: 700 }}
            />
            <Button
              size="small"
              variant="outlined"
              startIcon={<FilterAltOffRoundedIcon />}
              onClick={() => onChange([])}
              disabled={selectedRoleIds.length === 0}
              sx={{ color: PRIMARY, borderColor: PRIMARY, textTransform: "none", fontWeight: 700, flexShrink: 0 }}
            >
              {t("Clear roles")}
            </Button>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
            {activeCategory?.roles.map((role) => {
              const checked = selectedRoleIds.includes(role.id);
              return (
                <FormControlLabel
                  key={role.id}
                  control={<Checkbox checked={checked} onChange={() => toggleRole(role.id)} />}
                  label={localizedName(role, i18n.resolvedLanguage ?? i18n.language)}
                  sx={{
                    m: 0,
                    px: 1,
                    py: 0.5,
                    border: "1px solid",
                    borderColor: checked ? PRIMARY : "rgba(0,0,0,0.1)",
                    bgcolor: checked ? "rgba(42,92,69,0.07)" : "white",
                    borderRadius: 2.5,
                    "& .MuiFormControlLabel-label": { fontWeight: checked ? 700 : 500 },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 2.25, borderTop: "1px solid rgba(42,92,69,0.12)", bgcolor: "#fbfcfa" }}>
        <Button
          variant="outlined"
          size="large"
          onClick={() => setSuggestionOpen((open) => !open)}
          startIcon={<AddCommentRoundedIcon />}
          aria-expanded={suggestionOpen}
          sx={{
            color: PRIMARY,
            borderColor: PRIMARY,
            borderWidth: 1.5,
            borderRadius: 2.5,
            px: 2,
            textTransform: "none",
            fontWeight: 750,
            bgcolor: "white",
            boxShadow: "0 2px 8px rgba(42,92,69,0.08)",
            "&:hover": {
              borderColor: "#1e4332",
              borderWidth: 1.5,
              bgcolor: "rgba(42,92,69,0.06)",
            },
            "&:focus-visible": {
              outline: "3px solid rgba(42,92,69,0.24)",
              outlineOffset: 2,
            },
          }}
        >
          {t("Can't see your field?")}
        </Button>
        <Typography color="text.secondary" fontSize="0.86rem" sx={{ mt: 0.25 }}>
          {t("Tell us what is missing. Our team will review it and add valid categories and roles.")}
        </Typography>
        <Collapse in={suggestionOpen}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mt: 2 }}>
            <TextField label={t("Category or field")} value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
            <TextField label={t("Role") } value={roleName} onChange={(event) => setRoleName(event.target.value)} />
            <TextField
              label={t("Why should we add it? (optional)")}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              multiline
              minRows={2}
              sx={{ gridColumn: { sm: "1 / -1" } }}
            />
            <Button
              variant="contained"
              onClick={submitSuggestion}
              disabled={sending}
              startIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
              sx={{ justifySelf: "start", bgcolor: PRIMARY, textTransform: "none", fontWeight: 700 }}
            >
              {t("Send suggestion")}
            </Button>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default memo(RoleCatalogSelector);
