import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";
import CountrySelect from "../../../components/ui/CountrySelect";
import RoleCatalogSelector, { JobCategoryOption } from "./RoleCatalogSelector";

const LEVELS = ["Fresh", "Junior", "Mid", "Senior", "Lead"];
const PRIMARY = "#2a5c45";

export interface JobRadarPreference {
  roleIds: string[];
  level: string;
  location: string;
  remote: boolean;
  keywords: string;
  blocklist: string;
}

interface JobRadarTargetsPanelProps {
  preference: JobRadarPreference;
  categories: JobCategoryOption[];
  saving: boolean;
  refreshing: boolean;
  onSave: (preference: JobRadarPreference) => void;
  onRefresh: () => void;
}

const JobRadarTargetsPanel = ({
  preference,
  categories,
  saving,
  refreshing,
  onSave,
  onRefresh,
}: JobRadarTargetsPanelProps) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(preference);

  useEffect(() => {
    setDraft(preference);
  }, [preference]);

  const updateText = (key: "keywords" | "blocklist", value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "20px", mb: 4, border: "1px solid rgba(0,0,0,0.08)" }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2.5 }}>{t("Your targets")}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
          <RoleCatalogSelector
            categories={categories}
            selectedRoleIds={draft.roleIds}
            onChange={(roleIds) => setDraft((current) => ({ ...current, roleIds }))}
          />
        </Box>
        <TextField
          select
          label={t("Experience level")}
          value={draft.level}
          onChange={(event) => setDraft((current) => ({ ...current, level: event.target.value }))}
        >
          <MenuItem value="">{t("Any")}</MenuItem>
          {LEVELS.map((level) => <MenuItem key={level} value={level}>{t(level)}</MenuItem>)}
        </TextField>
        <CountrySelect
          value={draft.location}
          onChange={(location) => setDraft((current) => ({ ...current, location }))}
          label={t("Target country")}
          placeholder={t("Select or type a country")}
          size="medium"
        />
        <TextField
          label={t("Keywords")}
          placeholder="react, typescript, node"
          value={draft.keywords}
          onChange={(event) => updateText("keywords", event.target.value)}
        />
        <TextField
          label={t("Exclude companies")}
          placeholder={t("comma separated")}
          value={draft.blocklist}
          onChange={(event) => updateText("blocklist", event.target.value)}
          sx={{ gridColumn: { sm: "1 / -1" } }}
        />
      </Box>
      <FormControlLabel
        sx={{ mt: 1 }}
        control={
          <Checkbox
            checked={draft.remote}
            onChange={(event) => setDraft((current) => ({ ...current, remote: event.target.checked }))}
            sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }}
          />
        }
        label={t("Remote only")}
      />
      <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={() => onSave(draft)}
          disabled={saving || draft.roleIds.length === 0}
          sx={{ bgcolor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px", "&:hover": { bgcolor: "#1e4332" } }}
        >
          {saving ? t("Saving...") : t("Save & find jobs")}
        </Button>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={onRefresh}
          disabled={refreshing}
          sx={{ color: PRIMARY, borderColor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px" }}
        >
          {t("Refresh")}
        </Button>
      </Box>
    </Paper>
  );
};

export default JobRadarTargetsPanel;