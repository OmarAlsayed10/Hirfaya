import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { JOB_ENDPOINTS } from "../../../constants/endpoints";
import { useFeedback } from "../../../context/FeedbackContext";

const PRIMARY = "#2a5c45";

type JobField = "title" | "company" | "url" | "description";
type FieldErrors = Partial<Record<JobField, string>>;

interface JobDraft {
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  remote: boolean;
}

const emptyDraft = (): JobDraft => ({
  title: "",
  company: "",
  location: "",
  url: "",
  description: "",
  remote: false,
});

const isValidUrl = (value: string): boolean => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

interface JobSubmissionFormProps {
  onSubmitted?: () => void;
}

const JobSubmissionForm = ({ onSubmitted }: JobSubmissionFormProps) => {
  const { t } = useTranslation();
  const { notify } = useFeedback();
  const [draft, setDraft] = useState<JobDraft>(emptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof JobDraft, value: string | boolean) => {
    setDraft((current) => ({ ...current, [field]: value }));
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (draft.title.trim().length < 2) next.title = t("Enter at least 2 characters.");
    if (draft.company.trim().length < 2) next.company = t("Enter at least 2 characters.");
    if (!isValidUrl(draft.url.trim())) next.url = t("Enter a valid http(s) link.");
    if (draft.description.trim().length < 10) next.description = t("Enter at least 10 characters.");
    return next;
  };

  const submit = async () => {
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length) {
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(JOB_ENDPOINTS.submissions, draft, { withCredentials: true });
      setDraft(emptyDraft());
      notify(t("Job sent for admin review."), "success");
      onSubmitted?.();
    } catch (error) {
      const message = axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      notify(typeof message === "string" ? message : t("Could not submit the job."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography sx={{ color: "#6b6b66", mb: 2.5 }}>
        {t("Know a real vacancy? Send it to us. An admin reviews it before it appears in Job Radar.")}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <TextField label={t("Job title")} required value={draft.title} error={Boolean(errors.title)} helperText={errors.title} onChange={(event) => update("title", event.target.value)} />
        <TextField label={t("Company")} required value={draft.company} error={Boolean(errors.company)} helperText={errors.company} onChange={(event) => update("company", event.target.value)} />
        <TextField label={t("Location")} value={draft.location} onChange={(event) => update("location", event.target.value)} />
        <TextField label={t("Application link")} required type="url" value={draft.url} error={Boolean(errors.url)} helperText={errors.url} onChange={(event) => update("url", event.target.value)} />
        <TextField label={t("Job details")} required value={draft.description} error={Boolean(errors.description)} helperText={errors.description} onChange={(event) => update("description", event.target.value)} multiline minRows={3} sx={{ gridColumn: { sm: "1 / -1" } }} />
      </Box>
      <FormControlLabel
        control={<Checkbox checked={draft.remote} onChange={(event) => update("remote", event.target.checked)} sx={{ color: PRIMARY, "&.Mui-checked": { color: PRIMARY } }} />}
        label={t("Remote")}
        sx={{ mt: 1 }}
      />
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={submit} disabled={submitting} sx={{ bgcolor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px", "&:hover": { bgcolor: "#1e4332" } }}>
          {submitting ? t("Sending...") : t("Send for review")}
        </Button>
      </Box>
    </Box>
  );
};

export default JobSubmissionForm;
