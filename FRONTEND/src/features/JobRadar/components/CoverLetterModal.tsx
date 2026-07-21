import { useState, useEffect } from "react";
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
import { loadCvOptions, CvOption } from "../cvSource";

const PRIMARY = "#2a5c45";

interface CoverLetterModalProps {
  open: boolean;
  onClose: () => void;
  matchId: string | null;
  matchTitle: string;
  matchCompany: string;
}

const CoverLetterModal = ({ open, onClose, matchId, matchTitle, matchCompany }: CoverLetterModalProps) => {
  const { t } = useTranslation();
  const [cvs, setCvs] = useState<CvOption[]>([]);
  const [selectedCv, setSelectedCv] = useState("");
  const [cvText, setCvText] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async (text: string) => {
    if (!matchId || !text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(JOB_ENDPOINTS.coverLetter(matchId), { cvText: text }, { withCredentials: true });
      setCoverLetter(res.data.coverLetter ?? "");
    } catch {
      setError(t("Could not generate a cover letter. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !matchId) return;
    setCoverLetter("");
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
    setCoverLetter("");
    setError("");
    setLoading(false);
    onClose();
  };

  const pickCv = (id: string) => {
    setSelectedCv(id);
    const found = cvs.find((c) => c.id === id);
    if (found) setCvText(found.text);
  };

  const copy = () => navigator.clipboard.writeText(coverLetter);

  const download = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cover-letter.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: "24px", maxHeight: "90vh" } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <DescriptionIcon sx={{ color: PRIMARY }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1a1a18" }}>{t("Cover letter")}</Typography>
            {matchTitle && (
              <Typography sx={{ color: "#6b6b66", fontSize: "0.85rem" }}>
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
            startIcon={loading ? <CircularProgress size={16} sx={{ color: "white" }} /> : <DescriptionIcon />}
            sx={{ bgcolor: PRIMARY, textTransform: "none", fontWeight: "bold", borderRadius: "10px", "&:hover": { bgcolor: "#1e4332" } }}
          >
            {loading ? t("Generating...") : coverLetter ? t("Regenerate") : t("Generate")}
          </Button>
        </Box>

        {error && <Typography color="error" sx={{ fontSize: "0.9rem" }}>{error}</Typography>}

        {coverLetter && (
          <Box>
            <Box
              component="pre"
              sx={{
                fontFamily: "inherit", fontSize: "0.9rem", lineHeight: 1.7, color: "#1a1a18",
                whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0, p: 2.5,
                borderRadius: "16px", border: "1px solid rgba(0,0,0,0.08)", bgcolor: "#f5f4ef",
              }}
            >
              {coverLetter}
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
