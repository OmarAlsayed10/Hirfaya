import { useEffect, useState } from "react";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { JOB_ENDPOINTS } from "../../../constants/endpoints";
import { COLORS } from "../../../theme/tokens";

const PRIMARY = COLORS.primary;

interface Analytics {
  totals: { matched: number; applied: number; interview: number; offer: number; rejected: number };
  applyRate: number;
  responseRate: number;
  byWeek: { week: string; applied: number }[];
}

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", border: `1px solid ${COLORS.borderLight}`, textAlign: "center" }}>
    <Typography sx={{ fontWeight: "bold", color: PRIMARY, fontSize: "1.6rem", lineHeight: 1.2 }}>{value}</Typography>
    <Typography sx={{ color: COLORS.textSecondary, fontSize: "0.8rem", mt: 0.5 }}>{label}</Typography>
  </Paper>
);

const asPercent = (rate: number) => `${Math.round((Number.isFinite(rate) ? rate : 0) * 100)}%`;

const JobAnalytics = () => {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(JOB_ENDPOINTS.analytics, { withCredentials: true })
      .then((res) => setAnalytics(res.data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress sx={{ color: PRIMARY }} /></Box>
    );
  }

  if (!analytics) return null;

  const { totals, applyRate, responseRate, byWeek } = analytics;
  const hasData = Object.values(totals).some((v) => v > 0) || byWeek.length > 0;

  if (!hasData) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: "20px", textAlign: "center", border: `1px dashed ${COLORS.borderMedium}` }}>
        <Typography sx={{ color: COLORS.textSecondary }}>{t("No analytics yet. Start applying to see your stats here.")}</Typography>
      </Paper>
    );
  }

  const maxApplied = Math.max(...byWeek.map((w) => w.applied), 1);

  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(5, 1fr)" }, gap: 2, mb: 2 }}>
        <StatCard label={t("Matched")} value={totals.matched} />
        <StatCard label={t("Applied")} value={totals.applied} />
        <StatCard label={t("Interviews")} value={totals.interview} />
        <StatCard label={t("Offers")} value={totals.offer} />
        <StatCard label={t("Rejected")} value={totals.rejected} />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr" }, gap: 2, mb: 3 }}>
        <StatCard label={t("Apply rate")} value={asPercent(applyRate)} />
        <StatCard label={t("Response rate")} value={asPercent(responseRate)} />
      </Box>

      {byWeek.length > 0 && (
        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: "20px", border: `1px solid ${COLORS.borderLight}` }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>{t("Applications per week")}</Typography>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, height: 180 }}>
            {byWeek.map((entry) => (
              <Box key={entry.week} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, height: "100%" }}>
                <Box sx={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <Box
                    sx={{
                      width: "70%", minWidth: 12, maxWidth: 48,
                      height: `${(entry.applied / maxApplied) * 100}%`,
                      minHeight: entry.applied > 0 ? 4 : 0,
                      bgcolor: PRIMARY, borderRadius: "8px 8px 0 0",
                    }}
                  />
                </Box>
                <Typography sx={{ fontWeight: 700, color: PRIMARY, fontSize: "0.85rem" }}>{entry.applied}</Typography>
                <Typography sx={{ color: COLORS.textSecondary, fontSize: "0.72rem", textAlign: "center" }}>{entry.week}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default JobAnalytics;
