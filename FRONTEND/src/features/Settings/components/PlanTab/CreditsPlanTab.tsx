import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import AddCardRoundedIcon from "@mui/icons-material/AddCardRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { QUOTA_ENDPOINTS } from "../../../../constants/endpoints";
import { useFeedback } from "../../../../context/FeedbackContext";
import type { QuotaStatus, UserQuotaStatus } from "../../../../types/quota";

const CreditStat = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
}) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, minWidth: 0 }}>
    <Stack direction="row" alignItems="center" gap={1} color="primary.main">
      {icon}
      <Typography fontSize={13} fontWeight={700} color="text.secondary">
        {label}
      </Typography>
    </Stack>
    <Typography variant="h4" fontWeight={800} mt={1}>
      {value === null ? "Unlimited" : value.toLocaleString()}
    </Typography>
  </Paper>
);

const SignedInCredits = ({ status }: { status: UserQuotaStatus }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const date = status.resetsAt || status.expiresAt;
  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={2}>
        <Box>
          <Chip label={status.planTier.toUpperCase()} color="primary" size="small" />
          <Typography color="text.secondary" fontSize={13} mt={1}>
            {status.unlimited
              ? t("Admin accounts have unlimited credits.")
              : date
                ? `${status.resetsAt ? t("Base credits reset") : t("Plan expires")} ${new Date(date).toLocaleDateString()}`
                : t("Credits remain available until used.")}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate("/buy-credits")}>
          {t("Buy credits")}
        </Button>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        <CreditStat
          label={t("Base credits")}
          value={status.baseCredits}
          icon={<AutoAwesomeRoundedIcon fontSize="small" />}
        />
        <CreditStat
          label={t("Top-up credits")}
          value={status.bonusCredits}
          icon={<AddCardRoundedIcon fontSize="small" />}
        />
        <CreditStat
          label={t("Available credits")}
          value={status.totalCredits}
          icon={<AccountBalanceWalletRoundedIcon fontSize="small" />}
        />
      </Box>
    </Stack>
  );
};

const CreditsPlanTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notify } = useFeedback();
  const [status, setStatus] = useState<QuotaStatus | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await axios.get<QuotaStatus>(QUOTA_ENDPOINTS.status, {
        withCredentials: true,
      });
      setStatus(response.data);
    } catch {
      notify(t("We couldn't load your credit balance."));
    }
  }, [notify, t]);

  useEffect(() => {
    void loadStatus();
    window.addEventListener("quota:refresh", loadStatus);
    return () => window.removeEventListener("quota:refresh", loadStatus);
  }, [loadStatus]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} mb={3}>
        {t("Credits & Plan")}
      </Typography>
      {!status ? (
        <Box py={6} display="grid" sx={{ placeItems: "center" }}><CircularProgress /></Box>
      ) : status.identity === "guest" ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">{t("Free CV analyses remaining")}</Typography>
          <Typography variant="h3" fontWeight={800} my={1}>
            {status.freeAnalysesRemaining} / {status.freeAnalysesLimit}
          </Typography>
          <Typography color="text.secondary" mb={2}>
            {t("Sign in to receive credits and keep your CV tools in one account.")}
          </Typography>
          <Button variant="contained" onClick={() => navigate("/login")}>{t("Sign in")}</Button>
        </Paper>
      ) : (
        <SignedInCredits status={status} />
      )}
    </Box>
  );
};

export default CreditsPlanTab;
