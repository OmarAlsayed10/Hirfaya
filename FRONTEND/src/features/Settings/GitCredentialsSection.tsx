import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Paper,
  Alert,
  Chip,
  Link,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AUTH_ENDPOINTS } from "../../constants/endpoints";
import { COLORS, RADIUS } from "../../theme/tokens";

type GitHost = "GITHUB" | "GITLAB";

interface CredentialSummary {
  host: GitHost;
  hint: string;
  label: string | null;
  createdAt: string;
}

const TOKEN_GUIDE: Record<GitHost, { url: string; scope: string; steps: string[] }> = {
  GITHUB: {
    url: "https://github.com/settings/tokens?type=beta",
    scope: "Contents: Read-only, Metadata: Read-only",
    steps: [
      "Open GitHub, then Settings, Developer settings, Personal access tokens, Fine-grained tokens.",
      "Click Generate new token and choose the repositories you want analyzed.",
      "Under Repository permissions set Contents and Metadata to Read-only. Grant nothing else.",
      "Generate the token, copy it once, and paste it below.",
    ],
  },
  GITLAB: {
    url: "https://gitlab.com/-/user_settings/personal_access_tokens",
    scope: "read_api, read_repository",
    steps: [
      "Open GitLab, then Edit profile, Access tokens.",
      "Click Add new token and set an expiry date.",
      "Select only the read_api and read_repository scopes.",
      "Create the token, copy it once, and paste it below.",
    ],
  },
};

interface GitCredentialsSectionProps {
  highlightHost?: GitHost;
}

export const GitCredentialsSection: React.FC<GitCredentialsSectionProps> = ({ highlightHost }) => {
  const { t } = useTranslation();
  const [host, setHost] = useState<GitHost>(highlightHost || "GITHUB");
  const [token, setToken] = useState("");
  const [credentials, setCredentials] = useState<CredentialSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await axios.get(AUTH_ENDPOINTS.gitCredentials, { withCredentials: true });
      setCredentials(response.data?.credentials || []);
    } catch {
      setCredentials([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const existing = credentials.find((credential) => credential.host === host);
  const guide = TOKEN_GUIDE[host];

  const save = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      await axios.post(
        AUTH_ENDPOINTS.gitCredentials,
        { host, token: token.trim() },
        { withCredentials: true },
      );
      setToken("");
      setSaved(true);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message || t("Could not save the access token."));
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    try {
      await axios.delete(AUTH_ENDPOINTS.gitCredential(host), { withCredentials: true });
      load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: RADIUS.md }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {t("Connected code hosts")}
      </Typography>

      <Typography variant="body2" sx={{ mb: 2, color: COLORS.textSecondary }}>
        {t("Optional. Add a read-only access token so we can read commit history and prove what you built. Only needed if you want to import projects from GitHub or GitLab.")}
      </Typography>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={host}
        onChange={(_, value) => value && setHost(value)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="GITHUB">GitHub</ToggleButton>
        <ToggleButton value="GITLAB">GitLab</ToggleButton>
      </ToggleButtonGroup>

      {existing ? (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip color="success" size="small" label={`${t("Connected")} ••••${existing.hint}`} />
          <Button size="small" color="error" onClick={remove} disabled={loading}>
            {t("Remove")}
          </Button>
        </Stack>
      ) : (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {t("How to create the token")}
          </Typography>

          <Box component="ol" sx={{ pl: 2.5, m: 0, mb: 1 }}>
            {guide.steps.map((step) => (
              <Typography component="li" variant="body2" key={step} sx={{ mb: 0.25 }}>
                {t(step)}
              </Typography>
            ))}
          </Box>

          <Alert severity="info" sx={{ borderRadius: RADIUS.sm, mb: 1 }}>
            {t("Grant read-only scopes only")}: <strong>{guide.scope}</strong>.{" "}
            {t("We never write to your repositories.")}
          </Alert>

          <Link href={guide.url} target="_blank" rel="noopener noreferrer" variant="body2">
            {t("Open the token page")}
          </Link>
        </Box>
      )}

      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder={host === "GITHUB" ? "github_pat_… or ghp_…" : "glpat-…"}
          disabled={loading}
          autoComplete="off"
        />
        <Button variant="contained" onClick={save} disabled={loading || !token.trim()}>
          {loading ? <CircularProgress size={20} /> : t("Save")}
        </Button>
      </Stack>

      {saved && (
        <Alert severity="success" sx={{ mt: 2, borderRadius: RADIUS.sm }}>
          {t("Token saved. It is encrypted and never shown again.")}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: RADIUS.sm }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
};
