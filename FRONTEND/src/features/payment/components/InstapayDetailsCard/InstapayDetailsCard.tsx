import {
  Box,
  Typography,
  Button,
  Divider,
  Skeleton,
  IconButton,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, SHADOWS, TYPOGRAPHY } from "../../../../theme/tokens";
import type { InstapayDetails } from "../../../../redux/store/slices/paymentSlice";

interface Props {
  details: InstapayDetails | null;
  loading: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const CopyField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.25,
        px: 2,
        bgcolor: COLORS.bgLight,
        borderRadius: RADIUS.md,
      }}
    >
      <Box>
        <Typography
          variant="caption"
          sx={{ color: COLORS.textSecondary, display: "block" }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
          {value}
        </Typography>
      </Box>
      <Tooltip title={copied ? t('Copied!') : t('Copy')}>
        <IconButton size="small" onClick={copy}>
          <ContentCopyIcon
            fontSize="small"
            sx={{ color: copied ? COLORS.primary : COLORS.textSecondary }}
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const InstapayDetailsCard = ({
  details,
  loading,
  onContinue,
  onBack,
}: Props) => {
  const { t } = useTranslation();
  if (loading || !details) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={60} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        sx={{
          p: 2,
          bgcolor: COLORS.primaryAlpha12,
          borderRadius: RADIUS.lg,
          border: `1px solid ${COLORS.primaryAlpha35}`,
        }}
      >
        <Typography
          sx={{
            fontFamily: TYPOGRAPHY.fontSerif,
            fontSize: TYPOGRAPHY.sizeXl,
            fontWeight: 700,
            color: COLORS.primary,
            textAlign: "center",
          }}
        >
          {details.amountEGP} {details.currency}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: COLORS.textSecondary, textAlign: "center", mt: 0.5 }}
        >
          {details.planDisplayName} · {details.durationDays} {t('days')}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <CopyField label={t('Bank')} value={details.bankName} />
        <CopyField label={t('Account Name')} value={details.accountName} />
        <CopyField label={t('Account Number')} value={details.accountNumber} />
        <CopyField label={t('Amount (EGP)')} value={details.amountEGP} />
      </Box>

      <Divider />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: COLORS.textPrimary }}
        >
          {t('Steps:')}
        </Typography>
        {details.instructions.map((step, i) => (
          <Box key={i} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <Box
              sx={{
                minWidth: 22,
                height: 22,
                borderRadius: RADIUS.full,
                bgcolor: COLORS.primarySurface,
                color: COLORS.onAccent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                mt: 0.15,
              }}
            >
              {i + 1}
            </Box>
            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
              {step}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          sx={{ flex: 1, borderColor: COLORS.borderMedium, color: COLORS.textPrimary }}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          onClick={onContinue}
          sx={{
            flex: 2,
            bgcolor: COLORS.primarySurface,
            "&:hover": { bgcolor: COLORS.primarySurfaceDark },
          }}
        >
          {t("I've Paid — Continue")}
        </Button>
      </Box>
    </Box>
  );
};
