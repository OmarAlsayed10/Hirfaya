import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  FormControlLabel,
  Checkbox,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AI_ENDPOINTS } from "../../../../constants/endpoints";
import { COLORS, RADIUS } from "../../../../theme/tokens";
import { GitTokenRequiredDialog } from "../../../Settings/GitTokenRequiredDialog";

export interface RepoAuthor {
  login: string;
  email?: string;
  commits: number;
  share: number;
}

export interface RepoEvidence {
  host: "github" | "gitlab";
  repoUrl: string;
  repo: string;
  description: string;
  totalCommits: number;
  authors: RepoAuthor[];
  languages: string[];
  dependencies: string[];
  firstCommit: string;
  lastCommit: string;
  matchedAuthor?: RepoAuthor;
  ownership?: "sole" | "primary" | "major" | "contributor";
}

interface RepoEvidencePanelProps {
  onEvidenceConfirmed: (evidence: RepoEvidence, sourceText: string) => void;
}

const OWNERSHIP_LABEL: Record<string, string> = {
  sole: "Sole engineer",
  primary: "Primary engineer",
  major: "Major contributor",
  contributor: "Contributor",
};

const formatMonth = (iso: string): string =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";

export const RepoEvidencePanel: React.FC<RepoEvidencePanelProps> = ({ onEvidenceConfirmed }) => {
  const { t } = useTranslation();
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<RepoEvidence | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [claimed, setClaimed] = useState<string[]>([]);
  const [tokenPromptHost, setTokenPromptHost] = useState<"GITHUB" | "GITLAB" | null>(null);

  const request = async (identities: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        AI_ENDPOINTS.analyzeRepo,
        { repoUrl: repoUrl.trim(), authorIdentities: identities },
        { withCredentials: true },
      );
      setEvidence(response.data?.evidence || null);
      setSourceText(response.data?.sourceText || "");
    } catch (err: any) {
      if (err?.response?.status === 428 && err?.response?.data?.code === "git_token_required") {
        setTokenPromptHost(err.response.data.host || "GITHUB");
        return;
      }
      setError(
        err?.response?.data?.message ||
          t("Could not read this repository. Check the URL and that you have access to it."),
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleIdentity = (identity: string) => {
    const next = claimed.includes(identity)
      ? claimed.filter((value) => value !== identity)
      : [...claimed, identity];
    setClaimed(next);
    if (evidence) request(next);
  };

  return (
    <Box>
      <GitTokenRequiredDialog
        open={tokenPromptHost !== null}
        host={tokenPromptHost}
        onClose={() => setTokenPromptHost(null)}
      />

      <Typography variant="body2" sx={{ mb: 1.5, color: COLORS.textSecondary }}>
        {t("Read commit history from GitHub or GitLab so your project entry can state what you actually built.")}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          value={repoUrl}
          onChange={(event) => setRepoUrl(event.target.value)}
          placeholder="https://github.com/owner/repo"
          disabled={loading}
        />
        <Button
          variant="contained"
          onClick={() => request(claimed)}
          disabled={loading || !repoUrl.trim()}
        >
          {loading ? <CircularProgress size={20} /> : t("Analyze")}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: RADIUS.sm }}>
          {error}
        </Alert>
      )}

      {evidence && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: RADIUS.sm }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {evidence.repo}
          </Typography>

          {evidence.description && (
            <Typography variant="body2" sx={{ mb: 1, color: COLORS.textSecondary }}>
              {evidence.description}
            </Typography>
          )}

          <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
            {t("Which of these committers are you?")}
          </Typography>

          <Stack sx={{ mb: 1.5 }}>
            {evidence.authors.slice(0, 8).map((author) => (
              <FormControlLabel
                key={author.login}
                control={
                  <Checkbox
                    size="small"
                    checked={claimed.includes(author.login)}
                    onChange={() => toggleIdentity(author.login)}
                    disabled={loading}
                  />
                }
                label={
                  <Typography variant="body2">
                    {author.login} — {author.commits} {t("commits")} (
                    {Math.round(author.share * 100)}%)
                  </Typography>
                }
              />
            ))}
          </Stack>

          {evidence.matchedAuthor && evidence.ownership && (
            <Alert severity="success" sx={{ mb: 1.5, borderRadius: RADIUS.sm }}>
              {OWNERSHIP_LABEL[evidence.ownership]} — {evidence.matchedAuthor.commits}{" "}
              {t("of")} {evidence.totalCommits} {t("commits")}
              {evidence.firstCommit && `, ${formatMonth(evidence.firstCommit)} – ${formatMonth(evidence.lastCommit)}`}
            </Alert>
          )}

          {evidence.languages.length > 0 && (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              {evidence.languages.slice(0, 6).map((language) => (
                <Chip key={language} label={language} size="small" />
              ))}
            </Stack>
          )}

          {evidence.dependencies.length > 0 && (
            <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: COLORS.textSecondary }}>
              {t("Detected dependencies")}: {evidence.dependencies.slice(0, 12).join(", ")}
            </Typography>
          )}

          <Button
            variant="contained"
            fullWidth
            disabled={!evidence.matchedAuthor}
            onClick={() => onEvidenceConfirmed(evidence, sourceText)}
          >
            {evidence.matchedAuthor
              ? t("Use this evidence")
              : t("Select your committer identity first")}
          </Button>
        </Paper>
      )}
    </Box>
  );
};
