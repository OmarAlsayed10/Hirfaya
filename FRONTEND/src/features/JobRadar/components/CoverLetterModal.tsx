import { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, Button,
  TextField, MenuItem, IconButton, CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { JOB_ENDPOINTS } from "../../../constants/endpoints";
import { loadCvOptions } from "../../../utils/cvOptions";
import type { CvOption } from "../../../utils/cvOptions";
import { COLORS } from "../../../theme/tokens";

const PRIMARY = COLORS.primary;

interface CoverLetterModalProps {
  open: boolean;
  onClose: () => void;
  matchId: string | null;
  matchTitle: string;
  matchCompany: string;
  coverLetter?: string | null;
  coverLetterAr?: string | null;
}

type Language = "en" | "ar";

const CoverLetterModal = ({ open, onClose, matchId, matchTitle, matchCompany, coverLetter, coverLetterAr }: CoverLetterModalProps) => {
  const { t, i18n } = useTranslation();
  const uiLanguage: Language = i18n.language.startsWith("ar") ? "ar" : "en";
  const [cvs, setCvs] = useState<CvOption[]>([]);
  const [selectedCv, setSelectedCv] = useState("");
  const [cvText, setCvText] = useState("");
  const [letters, setLetters] = useState<Record<Language, string>>({ en: "", ar: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const prevLanguage = useRef<Language>(uiLanguage);

  const generate = async (text: string, language: Language) => {
    if (!matchId || !text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(JOB_ENDPOINTS.coverLetter(matchId), { cvText: text, language }, { withCredentials: true });
      setLetters((prev) => ({ ...prev, [language]: res.data.coverLetter ?? "" }));
    } catch {
      setError(t("Could not generate a cover letter. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !matchId) return;
    const seeded: Record<Language, string> = { en: coverLetter ?? "", ar: coverLetterAr ?? "" };
    setLetters(seeded);
    setError("");
    loadCvOptions()
      .then((opts) => {
        setCvs(opts);
        if (opts.length > 0) {
          setSelectedCv(opts[0].id);
          setCvText(opts[0].text);
          if (!seeded[uiLanguage]) generate(opts[0].text, uiLanguage);
        }
      })
      .catch(() => setCvs([]));
  }, [open, matchId]);

  useEffect(() => {
    if (!open || prevLanguage.current === uiLanguage) return;
    prevLanguage.current = uiLanguage;
    if (!letters[uiLanguage] && cvText.trim()) generate(cvText, uiLanguage);
  }, [uiLanguage]);

  const close = () => {
    setCvs([]);
    setSelectedCv("");
    setCvText("");
    setLetters({ en: "", ar: "" });
    setError("");
    setLoading(false);
    onClose();
  };

  const pickCv = (id: string) => {
    setSelectedCv(id);
    const found = cvs.find((c) => c.id === id);
    if (found) setCvText(found.text);
  };

  const activeLetter = letters[uiLanguage];

  const copy = () => navigator.clipboard.writeText(activeLetter);

  const download = () => {
    const blob = new Blob([activeLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cover-letter.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "24px", maxHeight: "90vh" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1, borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <DescriptionIcon sx={{ color: PRIMARY }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: COLORS.textPrimary }}>{t("Cover letter")}</Typography>
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
            onClick={() => generate(cvText, uiLanguage)}
            disabled={loading || !cvText.trim()}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: COLORS.onAccent }} /> : <DescriptionIcon />}
            sx={{ bgcolor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px", "&:hover": { bgcolor: COLORS.primarySurfaceDark } }}
          >
            {loading ? t("Generating...") : activeLetter ? t("Regenerate") : t("Generate")}
          </Button>
        </Box>

        {error && <Typography color="error" sx={{ fontSize: "0.9rem" }}>{error}</Typography>}

        {activeLetter && (
          <Box>
            <Box
              component="pre"
              sx={{
                fontFamily: "inherit", fontSize: "0.9rem", lineHeight: 1.7, color: COLORS.textPrimary,
                whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0, p: 2.5,
                borderRadius: "16px", border: `1px solid ${COLORS.borderLight}`, bgcolor: COLORS.bgLight,
              }}
            >
              {activeLetter}
            </Box>
            <Box sx={{ mt: 2, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={copy} startIcon={<ContentCopyIcon />} sx={{ color: PRIMARY, borderColor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px" }}>
                {t("Copy")}
              </Button>
              <Button variant="outlined" onClick={download} startIcon={<DownloadIcon />} sx={{ color: PRIMARY, borderColor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px" }}>
                {t("Download .txt")}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CoverLetterModal;
