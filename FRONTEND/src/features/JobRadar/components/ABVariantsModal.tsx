import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, Button,
  TextField, MenuItem, IconButton, CircularProgress, Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { JOB_ENDPOINTS } from "../../../constants/endpoints";
import { loadCvOptions } from "../../../utils/cvOptions";
import type { CvOption } from "../../../utils/cvOptions";
import { COLORS } from "../../../theme/tokens";

const PRIMARY = COLORS.primary;

interface Variant {
  id: string;
  label: "A" | "B";
  content: string;
}

interface ABVariantsModalProps {
  open: boolean;
  onClose: () => void;
  matchId: string | null;
  matchTitle: string;
  matchCompany: string;
}

const VARIANT_TITLES: Record<Variant["label"], string> = {
  A: "Impact-focused",
  B: "Skills-focused",
};

const ABVariantsModal = ({ open, onClose, matchId, matchTitle, matchCompany }: ABVariantsModalProps) => {
  const { t } = useTranslation();
  const [cvs, setCvs] = useState<CvOption[]>([]);
  const [selectedCv, setSelectedCv] = useState("");
  const [cvText, setCvText] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [usedId, setUsedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async (text: string) => {
    if (!matchId || !text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(JOB_ENDPOINTS.variants(matchId), { cvText: text }, { withCredentials: true });
      setVariants(res.data.variants ?? []);
      setUsedId("");
    } catch {
      setError(t("Could not generate variants. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !matchId) return;
    setVariants([]);
    setError("");
    loadCvOptions()
      .then((opts) => {
        setCvs(opts);
        if (opts.length > 0) {
          setSelectedCv(opts[0].id);
          setCvText(opts[0].text);
          generate(opts[0].text);
        }
      })
      .catch(() => setCvs([]));
  }, [open, matchId]);

  const close = () => {
    setCvs([]);
    setSelectedCv("");
    setCvText("");
    setVariants([]);
    setUsedId("");
    setError("");
    setLoading(false);
    onClose();
  };

  const pickCv = (id: string) => {
    setSelectedCv(id);
    const found = cvs.find((c) => c.id === id);
    if (found) setCvText(found.text);
  };

  const markVariantUsed = async (variantId: string) => {
    setUsedId(variantId);
    await axios.patch(JOB_ENDPOINTS.variantOutcome(variantId), { sent: true }, { withCredentials: true });
  };

  const copy = (content: string) => navigator.clipboard.writeText(content);

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: "24px", maxHeight: "90vh" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1, borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CompareArrowsIcon sx={{ color: PRIMARY }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: COLORS.textPrimary }}>{t("Tailor A/B")}</Typography>
            {matchTitle && (
              <Typography sx={{ color: COLORS.textSecondary, fontSize: "0.85rem" }}>
                {matchTitle}{matchCompany ? ` · ${matchCompany}` : ""}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={close} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {cvs.length > 0 && (
          <TextField select label={t("Use one of your CVs")} value={selectedCv} onChange={(e) => pickCv(e.target.value)} sx={{ mt: 1 }}>
            {cvs.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}
          </TextField>
        )}
        <TextField
          label={t("CV text")}
          placeholder={t("Copy the text of your CV and paste it here")}
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          multiline
          minRows={4}
          fullWidth
        />
        <Box>
          <Button
            variant="contained"
            onClick={() => generate(cvText)}
            disabled={loading || !cvText.trim()}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: COLORS.onAccent }} /> : <CompareArrowsIcon />}
            sx={{ bgcolor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px", "&:hover": { bgcolor: COLORS.primarySurfaceDark } }}
          >
            {loading ? t("Generating...") : variants.length > 0 ? t("Regenerate") : t("Generate")}
          </Button>
        </Box>

        {error && <Typography color="error" sx={{ fontSize: "0.9rem" }}>{error}</Typography>}

        {variants.length > 0 && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2.5 }}>
            {variants.map((variant) => (
              <Box key={variant.id} sx={{ p: 2.5, borderRadius: "16px", border: `1px solid ${COLORS.borderLight}`, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip label={variant.label} size="small" sx={{ bgcolor: PRIMARY, color: COLORS.onAccent, fontWeight: 700 }} />
                  <Typography sx={{ fontWeight: "bold", color: COLORS.textPrimary }}>{t(VARIANT_TITLES[variant.label])}</Typography>
                </Box>
                <Box
                  component="pre"
                  sx={{
                    fontFamily: "inherit", fontSize: "0.85rem", lineHeight: 1.65, color: COLORS.textPrimary,
                    whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0, p: 2,
                    borderRadius: "12px", bgcolor: COLORS.bgLight, flex: 1,
                  }}
                >
                  {variant.content}
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    onClick={() => markVariantUsed(variant.id)}
                    disabled={usedId === variant.id}
                    startIcon={usedId === variant.id ? <CheckIcon /> : undefined}
                    sx={{ bgcolor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px", "&:hover": { bgcolor: COLORS.primarySurfaceDark } }}
                  >
                    {usedId === variant.id ? t("Used") : t("Use this")}
                  </Button>
                  <Button variant="outlined" onClick={() => copy(variant.content)} startIcon={<ContentCopyIcon />} sx={{ color: PRIMARY, borderColor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px" }}>
                    {t("Copy")}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ABVariantsModal;
