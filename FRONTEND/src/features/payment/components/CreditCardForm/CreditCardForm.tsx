import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, TYPOGRAPHY } from "../../../../theme/tokens";

interface Props {
  referenceNumber: string;
  onReferenceChange: (value: string) => void;
  screenshot: File | null;
  onScreenshotChange: (file: File | null) => void;
  refError: string;
  fileError: string;
  loading: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export const CreditCardForm = ({
  referenceNumber,
  onReferenceChange,
  screenshot,
  onScreenshotChange,
  refError,
  fileError,
  loading,
  onSubmit,
  onBack,
}: Props) => {
  const { t } = useTranslation();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onScreenshotChange(e.target.files?.[0] ?? null);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, color: COLORS.textSecondary, fontWeight: 500 }}
        >
          {t('InstaPay Reference Number')}
        </Typography>
        <TextField
          fullWidth
          placeholder={t('e.g. TRX20250525123456')}
          value={referenceNumber}
          onChange={(e) => onReferenceChange(e.target.value)}
          error={!!refError}
          helperText={refError}
          disabled={loading}
          inputProps={{ maxLength: 60 }}
        />
      </Box>

      <Box>
        <Typography
          variant="body2"
          sx={{ mb: 0.75, color: COLORS.textSecondary, fontWeight: 500 }}
        >
          {t('Payment Screenshot')}
        </Typography>
        <Box
          component="label"
          htmlFor="screenshot-upload"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            p: 3,
            border: `2px dashed ${fileError ? COLORS.danger : COLORS.borderMedium}`,
            borderRadius: RADIUS.lg,
            cursor: loading ? "not-allowed" : "pointer",
            bgcolor: screenshot ? COLORS.bgIconTinted : "transparent",
            transition: "background 0.2s",
            "&:hover": { bgcolor: loading ? undefined : COLORS.primaryAlpha12 },
          }}
        >
          <input
            id="screenshot-upload"
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
            disabled={loading}
          />
          <CloudUploadIcon sx={{ color: COLORS.primary, fontSize: 32 }} />
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            {screenshot
              ? screenshot.name
              : t('Click to upload screenshot (JPG, PNG)')}
          </Typography>
        </Box>
        {fileError && (
          <Typography variant="caption" sx={{ color: COLORS.danger, mt: 0.5, display: "block" }}>
            {fileError}
          </Typography>
        )}
      </Box>

      <Alert severity="info" sx={{ borderRadius: RADIUS.md }}>
        {t('Your plan activates within 24 hours after we verify your payment. You will receive a confirmation email.')}
      </Alert>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          disabled={loading}
          sx={{
            flex: 1,
            borderColor: COLORS.borderMedium,
            color: COLORS.textPrimary,
          }}
        >
          {t('Back')}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          sx={{
            flex: 2,
            bgcolor: COLORS.primarySurface,
            "&:hover": { bgcolor: COLORS.primarySurfaceDark },
          }}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {loading ? t('Submitting…') : t('Submit Payment')}
        </Button>
      </Box>
    </Box>
  );
};
