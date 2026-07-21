import { Box, Container, Typography, Paper, Button, Divider, TextField, MenuItem } from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { FileUser } from "../components/icons/MuiIcons";
import { useFile } from "../hooks/useFile";
import { CV_ENDPOINTS } from "../constants/endpoints";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CVAnalysisDashboard from "../features/CVAnalysis/CVAnalysisDashboard";
import ContentBlock from "../components/ui/ContentBlock";
import { cvToText } from "../utils/cvToText";


const CVAnalysisPage = () => {
  const { t } = useTranslation();
  const { uploadedFile, setUploadedFile } = useFile();
  const [primaryText, setPrimaryText] = useState("");
  const [primaryError, setPrimaryError] = useState("");
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  const [level, setLevel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usePrimaryCV = async () => {
    setPrimaryError("");
    setLoadingPrimary(true);
    try {
      const { data } = await axios.get(CV_ENDPOINTS.primary, { withCredentials: true });
      if (!data?.cv) {
        setPrimaryError(t("No saved CV found. Build one first."));
        return;
      }
      const text = cvToText(data.cv);
      if (text.trim().length < 30) {
        setPrimaryError(t("Your saved CV is too empty to analyze."));
        return;
      }
      setPrimaryText(text);
    } catch {
      setPrimaryError(t("Couldn't load your CV. Try again."));
    } finally {
      setLoadingPrimary(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPrimaryText("");
  };

  return (
    <Box sx={{ bgcolor: "#f5f4ef", minHeight: "100vh", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <ContentBlock
            size="section"
            headline={t("AI Resume Analyzer")}
            text={t(
              "Review the quality, clarity, formatting, and ATS readiness of your CV. Job matching lives in the separate Career Match feature.",
            )}
            textMaxWidth="700px"
          />
        </Box>

        {!uploadedFile && !primaryText ? (
          <Box sx={{ maxWidth: 800, mx: "auto", animation: "fadeIn 0.5s" }}>
            <Box sx={{ mb: 3 }}>
              <TextField
                select
                label={t("Experience level (optional)")}
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                helperText={t("Leave this blank if you want the analyzer to infer your level.")}
                fullWidth
              >
                <MenuItem value="">{t("Infer from my CV")}</MenuItem>
                {['Fresh', 'Junior', 'Mid', 'Senior', 'Lead'].map((option) => (
                  <MenuItem key={option} value={option}>{t(option)}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 4, md: 8 },
                borderRadius: "24px",
                border: "2px dashed rgba(42, 92, 69, 0.3)",
                bgcolor: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  borderColor: "#2a5c45",
                  bgcolor: "rgba(42, 92, 69, 0.02)",
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUploadOutlinedIcon
                sx={{ fontSize: 80, color: "#2a5c45", mb: 3 }}
              />
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: "#1a1a18", mb: 1 }}
              >
                {t("Click to upload your resume")}
              </Typography>
              <Typography sx={{ color: "#6b6b66", mb: 4 }}>
                {t("Supported formats: PDF, DOCX (Max 5MB)")}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#2a5c45",
                  color: "white",
                  px: 6,
                  py: 1.5,
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(42,92,69,0.2)",
                  "&:hover": { bgcolor: "#1e4332" },
                }}
              >
                {t("Browse Files")}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
            </Paper>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 3 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography sx={{ color: "#9b9b96", fontSize: "0.85rem" }}>{t("or")}</Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            <Button
              fullWidth
              variant="outlined"
              onClick={usePrimaryCV}
              disabled={loadingPrimary}
              startIcon={<FileUser size={20} />}
              sx={{
                py: 1.5,
                borderRadius: "16px",
                borderColor: "rgba(42, 92, 69, 0.4)",
                color: "#2a5c45",
                bgcolor: "white",
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem",
                "&:hover": { borderColor: "#2a5c45", bgcolor: "rgba(42, 92, 69, 0.02)" },
              }}
            >
              {loadingPrimary ? t("Loading your CV...") : t("Use my primary CV")}
            </Button>
            {primaryError && (
              <Typography sx={{ color: "#c25b1a", fontSize: "0.85rem", textAlign: "center", mt: 1.5 }}>
                {primaryError}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ animation: "fadeIn 0.5s" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Typography sx={{ color: "#6b6b66", fontWeight: "bold" }}>
                Analyzing:{" "}
                <span style={{ color: "#2a5c45" }}>{uploadedFile ? uploadedFile.name : t("Primary CV")}</span>
              </Typography>
              <Button
                variant="outlined"
                onClick={clearFile}
                sx={{
                  color: "#c25b1a",
                  borderColor: "rgba(194, 91, 26, 0.5)",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  "&:hover": {
                    borderColor: "#c25b1a",
                    bgcolor: "rgba(194, 91, 26, 0.05)",
                  },
                }}
              >
                {t("Analyze Another File")}
              </Button>
            </Box>
            <CVAnalysisDashboard uploadedFile={uploadedFile ?? undefined} cvText={primaryText || undefined} level={level || undefined} />
          </Box>
        )}
      </Container>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  );
};

export default CVAnalysisPage;
