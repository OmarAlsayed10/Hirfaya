import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ADMIN_ENDPOINTS } from "../../constants/endpoints";
import { useFeedback } from "../../context/FeedbackContext";
import { displayName } from "../../utils/displayName";

interface LocalizedName {
  name: string;
  nameAr: string;
}

interface AdminRole extends LocalizedName {
  id: string;
  active: boolean;
}

interface AdminCategory extends LocalizedName {
  id: string;
  active: boolean;
  roles: AdminRole[];
}

interface RoleSuggestion {
  id: string;
  categoryName: string;
  roleName: string;
  note: string | null;
  user: { firstName: string; lastName: string; email: string };
}

interface SuggestionDraft {
  categoryName: string;
  categoryNameAr: string;
  roleName: string;
  roleNameAr: string;
}

const emptyLocalizedName = (): LocalizedName => ({ name: "", nameAr: "" });

const JobCatalogTab = () => {
  const { t } = useTranslation();
  const { notify } = useFeedback();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [suggestions, setSuggestions] = useState<RoleSuggestion[]>([]);
  const [suggestionDrafts, setSuggestionDrafts] = useState<Record<string, SuggestionDraft>>({});
  const [roleDrafts, setRoleDrafts] = useState<Record<string, LocalizedName>>({});
  const [newCategory, setNewCategory] = useState<LocalizedName>(emptyLocalizedName);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [catalogResponse, suggestionResponse] = await Promise.all([
        axios.get(ADMIN_ENDPOINTS.jobCatalog, { withCredentials: true }),
        axios.get(ADMIN_ENDPOINTS.jobRoleSuggestions, { withCredentials: true }),
      ]);
      const nextSuggestions: RoleSuggestion[] = suggestionResponse.data.suggestions ?? [];
      setCategories(catalogResponse.data.categories ?? []);
      setSuggestions(nextSuggestions);
      setSuggestionDrafts(Object.fromEntries(nextSuggestions.map((suggestion) => [
        suggestion.id,
        {
          categoryName: suggestion.categoryName,
          categoryNameAr: "",
          roleName: suggestion.roleName,
          roleNameAr: "",
        },
      ])));
    } catch (error: any) {
      notify(error.response?.data?.message || t("Could not load the job catalog."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const hasBothNames = (localized: LocalizedName): boolean =>
    localized.name.trim().length >= 2 && localized.nameAr.trim().length >= 2;

  const createCategory = async () => {
    if (!hasBothNames(newCategory)) {
      notify(t("Enter both English and Arabic names."), "warning");
      return;
    }
    try {
      await axios.post(ADMIN_ENDPOINTS.jobCategories, newCategory, { withCredentials: true });
      setNewCategory(emptyLocalizedName());
      await load();
      notify(t("Category added."), "success");
    } catch (error: any) {
      notify(error.response?.data?.message || t("Could not add the category."));
    }
  };

  const toggleCategory = async (category: AdminCategory) => {
    try {
      await axios.patch(ADMIN_ENDPOINTS.jobCategory(category.id), { active: !category.active }, { withCredentials: true });
      await load();
    } catch (error: any) {
      notify(error.response?.data?.message || t("Could not update the category."));
    }
  };

  const createRole = async (categoryId: string) => {
    const draft = roleDrafts[categoryId] ?? emptyLocalizedName();
    if (!hasBothNames(draft)) {
      notify(t("Enter both English and Arabic names."), "warning");
      return;
    }
    try {
      await axios.post(ADMIN_ENDPOINTS.jobRoles(categoryId), draft, { withCredentials: true });
      setRoleDrafts((drafts) => ({ ...drafts, [categoryId]: emptyLocalizedName() }));
      await load();
      notify(t("Role added."), "success");
    } catch (error: any) {
      notify(error.response?.data?.message || t("Could not add the role."));
    }
  };

  const toggleRole = async (role: AdminRole) => {
    try {
      await axios.patch(ADMIN_ENDPOINTS.jobRole(role.id), { active: !role.active }, { withCredentials: true });
      await load();
    } catch (error: any) {
      notify(error.response?.data?.message || t("Could not update the role."));
    }
  };

  const reviewSuggestion = async (suggestion: RoleSuggestion, action: "approve" | "reject") => {
    const draft = suggestionDrafts[suggestion.id];
    if (action === "approve" && (!draft?.roleNameAr.trim() || !draft.categoryNameAr.trim())) {
      notify(t("Add the Arabic category and role names before approving."), "warning");
      return;
    }
    try {
      await axios.patch(
        ADMIN_ENDPOINTS.jobRoleSuggestion(suggestion.id),
        { action, ...draft },
        { withCredentials: true },
      );
      await load();
      notify(
        t(action === "approve" ? "Suggestion approved and added." : "Suggestion rejected."),
        "success",
      );
    } catch (error: any) {
      notify(error.response?.data?.message || t("Could not review the suggestion."));
    }
  };

  const updateRoleDraft = (categoryId: string, field: keyof LocalizedName, value: string) => {
    setRoleDrafts((drafts) => ({
      ...drafts,
      [categoryId]: { ...(drafts[categoryId] ?? emptyLocalizedName()), [field]: value },
    }));
  };

  if (loading) return <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress /></Box>;

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={800}>{t("Job fields and roles")}</Typography>
            <Typography color="text.secondary" fontSize="0.9rem">
              {t("These choices appear in Job Radar and drive the shared provider-ingestion rotation.")}
            </Typography>
          </Box>
          <IconButton aria-label={t("Refresh job catalog")} onClick={load}><RefreshRoundedIcon /></IconButton>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr auto" }, gap: 1, mt: 2 }}>
          <TextField
            size="small"
            label={t("Category name in English")}
            value={newCategory.name}
            onChange={(event) => setNewCategory((category) => ({ ...category, name: event.target.value }))}
            inputProps={{ dir: "ltr" }}
          />
          <TextField
            size="small"
            label={t("Category name in Arabic")}
            value={newCategory.nameAr}
            onChange={(event) => setNewCategory((category) => ({ ...category, nameAr: event.target.value }))}
            inputProps={{ dir: "rtl" }}
          />
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={createCategory}>
            {t("Add category")}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 2 }}>
        {categories.map((category) => (
          <Paper key={category.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3, opacity: category.active ? 1 : 0.62 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={800}>{category.name}</Typography>
                <Typography color="text.secondary" fontSize="0.84rem" dir="rtl" textAlign="start">
                  {category.nameAr}
                </Typography>
              </Box>
              <Typography color="text.secondary" fontSize="0.78rem">{t("Active")}</Typography>
              <Switch checked={category.active} onChange={() => toggleCategory(category)} />
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", minHeight: 38 }}>
              {category.roles.map((role) => (
                <Chip
                  key={role.id}
                  label={
                    <Box sx={{ py: 0.35 }}>
                      <Typography component="span" fontSize="0.78rem" fontWeight={700}>{role.name}</Typography>
                      <Typography component="span" fontSize="0.76rem" sx={{ display: "block" }} dir="rtl">{role.nameAr}</Typography>
                    </Box>
                  }
                  color={role.active ? "primary" : "default"}
                  variant={role.active ? "filled" : "outlined"}
                  onClick={() => toggleRole(role)}
                  sx={{ height: "auto", textDecoration: role.active ? "none" : "line-through" }}
                />
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" }, gap: 1 }}>
              <TextField
                size="small"
                label={t("Role name in English")}
                value={roleDrafts[category.id]?.name ?? ""}
                onChange={(event) => updateRoleDraft(category.id, "name", event.target.value)}
                inputProps={{ dir: "ltr" }}
              />
              <TextField
                size="small"
                label={t("Role name in Arabic")}
                value={roleDrafts[category.id]?.nameAr ?? ""}
                onChange={(event) => updateRoleDraft(category.id, "nameAr", event.target.value)}
                inputProps={{ dir: "rtl" }}
              />
              <Button variant="outlined" onClick={() => createRole(category.id)}>{t("Add")}</Button>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={800}>{t("Pending user suggestions")}</Typography>
        <Typography color="text.secondary" fontSize="0.9rem" sx={{ mb: 2 }}>
          {t("Validate the wording, add both translations, then approve or reject it.")}
        </Typography>
        {suggestions.length === 0 ? (
          <Typography color="text.secondary">{t("No pending suggestions.")}</Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={2}>
            {suggestions.map((suggestion) => {
              const draft = suggestionDrafts[suggestion.id] ?? {
                categoryName: suggestion.categoryName,
                categoryNameAr: "",
                roleName: suggestion.roleName,
                roleNameAr: "",
              };
              return (
                <Box key={suggestion.id} sx={{ pt: 1 }}>
                  <Typography fontWeight={750}>
                    {displayName(suggestion.user.firstName, suggestion.user.lastName)} · {suggestion.user.email}
                  </Typography>
                  {suggestion.note && <Typography color="text.secondary" fontSize="0.88rem" sx={{ mt: 0.5 }}>{suggestion.note}</Typography>}
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1, mt: 1.5 }}>
                    <TextField
                      size="small"
                      label={t("Category name in English")}
                      value={draft.categoryName}
                      onChange={(event) => setSuggestionDrafts((drafts) => ({
                        ...drafts,
                        [suggestion.id]: { ...draft, categoryName: event.target.value },
                      }))}
                      inputProps={{ dir: "ltr" }}
                    />
                    <TextField
                      size="small"
                      label={t("Category name in Arabic")}
                      value={draft.categoryNameAr}
                      onChange={(event) => setSuggestionDrafts((drafts) => ({
                        ...drafts,
                        [suggestion.id]: { ...draft, categoryNameAr: event.target.value },
                      }))}
                      inputProps={{ dir: "rtl" }}
                    />
                    <TextField
                      size="small"
                      label={t("Role name in English")}
                      value={draft.roleName}
                      onChange={(event) => setSuggestionDrafts((drafts) => ({
                        ...drafts,
                        [suggestion.id]: { ...draft, roleName: event.target.value },
                      }))}
                      inputProps={{ dir: "ltr" }}
                    />
                    <TextField
                      size="small"
                      label={t("Role name in Arabic")}
                      value={draft.roleNameAr}
                      onChange={(event) => setSuggestionDrafts((drafts) => ({
                        ...drafts,
                        [suggestion.id]: { ...draft, roleNameAr: event.target.value },
                      }))}
                      inputProps={{ dir: "rtl" }}
                    />
                    <Box sx={{ display: "flex", gap: 1, gridColumn: { md: "1 / -1" } }}>
                      <Button variant="contained" startIcon={<CheckRoundedIcon />} onClick={() => reviewSuggestion(suggestion, "approve")}>
                        {t("Approve")}
                      </Button>
                      <Button color="error" startIcon={<CloseRoundedIcon />} onClick={() => reviewSuggestion(suggestion, "reject")}>
                        {t("Reject")}
                      </Button>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};

export default JobCatalogTab;