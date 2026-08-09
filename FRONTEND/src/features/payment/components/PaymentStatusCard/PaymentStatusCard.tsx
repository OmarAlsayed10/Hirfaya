import { Box, Typography, Chip, Button, CircularProgress } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, TYPOGRAPHY } from "../../../../theme/tokens";
import type { PaymentRequestStatus } from "../../../../redux/store/slices/paymentSlice";

interface Props {
  status: PaymentRequestStatus | null;
  loading: boolean;
  onRetry: () => void;
}

const STATUS_CONFIG = {
  PENDING: {
    icon: <HourglassTopIcon sx={{ fontSize: 48, color: COLORS.warning }} />,
    label: "Under Review",
    color: COLORS.warning,
    bgcolor: COLORS.warningSoft,
    message:
      "Your payment is being reviewed. We'll send a confirmation email within 24 hours.",
  },
  APPROVED: {
    icon: <CheckCircleIcon sx={{ fontSize: 48, color: COLORS.primary }} />,
    label: "Approved",
    color: COLORS.primary,
    bgcolor: COLORS.bgIconTinted,
    message: "Your Pro plan is now active. Enjoy all premium features!",
  },
  REJECTED: {
    icon: <CancelIcon sx={{ fontSize: 48, color: COLORS.danger }} />,
    label: "Rejected",
    color: COLORS.danger,
    bgcolor: COLORS.dangerSoft,
    message: "Your payment could not be verified.",
  },
};

export const PaymentStatusCard = ({ status, loading, onRetry }: Props) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (!status) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ color: COLORS.textSecondary }}>
          {t('No payment request found.')}
        </Typography>
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{ mt: 2, bgcolor: COLORS.primarySurface }}
        >
          {t('Start Payment')}
        </Button>
      </Box>
    );
  }

  const cfg = STATUS_CONFIG[status.status];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        p: 3,
        borderRadius: RADIUS.xl,
        bgcolor: cfg.bgcolor,
        border: `1px solid ${cfg.color}33`,
        textAlign: "center",
      }}
    >
      {cfg.icon}

      <Chip
        label={t(cfg.label)}
        sx={{
          bgcolor: cfg.color,
          color: COLORS.onAccent,
          fontWeight: 700,
          fontSize: TYPOGRAPHY.sizeSm,
        }}
      />

      <Box>
        <Typography
          sx={{
            fontFamily: TYPOGRAPHY.fontSerif,
            fontSize: TYPOGRAPHY.sizeXl,
            fontWeight: 700,
            color: COLORS.textPrimary,
          }}
        >
          {status.plan?.displayName ?? `+${status.grantCreditsSnapshot} Credits`}
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          {status.amountSnapshot} {status.currency} ·{" "}
          {status.plan
            ? `${status.plan.durationDays} ${t('days')}`
            : `+${status.grantCreditsSnapshot} ${t('credits')}`}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ color: COLORS.textSecondary, maxWidth: 360 }}>
        {t(cfg.message)}
      </Typography>

      {status.status === "REJECTED" && status.rejectionReason && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: COLORS.dangerSoft,
            borderRadius: RADIUS.md,
            width: "100%",
          }}
        >
          <Typography variant="body2" sx={{ color: COLORS.dangerDark }}>
            {t('Reason:')} {status.rejectionReason}
          </Typography>
        </Box>
      )}

      {status.status === "REJECTED" && (
        <Button
          variant="contained"
          onClick={onRetry}
          sx={{ bgcolor: COLORS.primarySurface, "&:hover": { bgcolor: COLORS.primarySurfaceDark } }}
        >
          {t('Try Again')}
        </Button>
      )}

      <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
        {t('Reference:')} {status.referenceNumber} ·{" "}
        {new Date(status.createdAt).toLocaleDateString()}
      </Typography>
    </Box>
  );
};
