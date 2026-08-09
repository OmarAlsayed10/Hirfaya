import React, { useState } from "react";
import { Box, Typography, Button, Alert, Stack, Paper, Chip, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AI_ENDPOINTS } from "../../../constants/endpoints";
import { COLORS, RADIUS } from "../../../theme/tokens";

export interface ClaimFinding {
  section: "experience" | "projects" | "summary";
  entryIndex: number;
  statement: string;
  unsourced: string[];
  challenge: string;
}

interface AuditableEntry {
  description: string;
  evidence?: string;
}

interface ClaimAuditPanelProps {
  cv: { summary?: string; experience?: AuditableEntry[]; projects?: AuditableEntry[] };
  evidence?: string;
  onEditStatement?: (finding: ClaimFinding) => void;
}

export const ClaimAuditPanel: React.FC<ClaimAuditPanelProps> = ({
  cv,
  evidence = "",
  onEditStatement,
}) => {
  const { t } = useTranslation();
  const [findings, setFindings] = useState<ClaimFinding[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        AI_ENDPOINTS.auditClaims,
        { cv, evidence },
        { withCredentials: true },
      );
      setFindings(response.data?.findings || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || t("Could not check your claims right now."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1.5, color: COLORS.textSecondary }}>
        {t("Find numbers on your CV that no evidence supports. An interviewer will ask about every one of them.")}
      </Typography>

      <Button variant="outlined" onClick={runAudit} disabled={loading} sx={{ mb: 2 }}>
        {loading ? <CircularProgress size={20} /> : t("Check my claims")}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: RADIUS.sm }}>
          {error}
        </Alert>
      )}

      {findings?.length === 0 && (
        <Alert severity="success" sx={{ borderRadius: RADIUS.sm }}>
          {t("Every number on your CV is supported by the evidence provided.")}
        </Alert>
      )}

      {findings && findings.length > 0 && (
        <Stack spacing={1.5}>
          <Alert severity="warning" sx={{ borderRadius: RADIUS.sm }}>
            {findings.length} {t("unsupported claims found. Nothing was changed — these are yours to decide on.")}
          </Alert>

          {findings.map((finding, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 1.5, borderRadius: RADIUS.sm }}>
              <Stack direction="row" spacing={0.5} sx={{ mb: 0.5 }}>
                <Chip label={t(finding.section)} size="small" />
                {finding.unsourced.map((value) => (
                  <Chip key={value} label={value} size="small" color="warning" />
                ))}
              </Stack>

              <Typography variant="body2" sx={{ fontStyle: "italic", mb: 0.5 }}>
                "{finding.statement}"
              </Typography>

              <Typography variant="body2" sx={{ mb: onEditStatement ? 1 : 0 }}>
                {finding.challenge}
              </Typography>

              {onEditStatement && (
                <Button size="small" onClick={() => onEditStatement(finding)}>
                  {t("Edit this line")}
                </Button>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
};
