import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { ADMIN_ENDPOINTS } from "../../constants/endpoints";
import { useFeedback } from "../../context/FeedbackContext";
import { displayName } from "../../utils/displayName";

interface JobSubmission {
  id: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  url: string;
  description: string;
  user: { firstName: string; lastName: string; email: string };
}

const JobSubmissionsTab = () => {
  const { t } = useTranslation();
  const { notify } = useFeedback();
  const [submissions, setSubmissions] = useState<JobSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await axios.get(ADMIN_ENDPOINTS.jobSubmissions, { withCredentials: true });
      setSubmissions(response.data.submissions ?? []);
    } catch {
      notify(t("Could not load job submissions."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const review = async (id: string, action: "approve" | "reject") => {
    try {
      await axios.patch(ADMIN_ENDPOINTS.jobSubmission(id), { action }, { withCredentials: true });
      setSubmissions((current) => current.filter((submission) => submission.id !== id));
      notify(t(action === "approve" ? "Job approved." : "Job rejected."), "success");
    } catch {
      notify(t("Could not review the job."));
    }
  };

  if (loading) return <Box sx={{ py: 8, textAlign: "center" }}><CircularProgress /></Box>;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight={800}>{t("Pending job review")}</Typography>
      <Typography color="text.secondary" fontSize="0.9rem" sx={{ mb: 2 }}>
        {t("Review submitted job details and application link before publishing it to Job Radar.")}
      </Typography>
      {submissions.length === 0 ? (
        <Typography color="text.secondary">{t("No pending job submissions.")}</Typography>
      ) : (
        <Stack divider={<Divider flexItem />} spacing={2}>
          {submissions.map((submission) => (
            <Box key={submission.id} sx={{ pt: 1 }}>
              <Typography fontWeight={800}>{submission.title}</Typography>
              <Typography color="text.secondary">
                {submission.company}{submission.location ? " - " + submission.location : ""}{submission.remote ? " - " + t("Remote") : ""}
              </Typography>
              <Link href={submission.url} target="_blank" rel="noopener noreferrer" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                {t("Open job link")} <OpenInNewIcon fontSize="inherit" />
              </Link>
              <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{submission.description}</Typography>
              <Typography color="text.secondary" fontSize="0.84rem" sx={{ mt: 1 }}>
                {t("Submitted by")} {displayName(submission.user.firstName, submission.user.lastName)} - {submission.user.email}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <Button variant="contained" onClick={() => review(submission.id, "approve")}>{t("Approve")}</Button>
                <Button color="error" variant="outlined" onClick={() => review(submission.id, "reject")}>{t("Reject")}</Button>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default JobSubmissionsTab;