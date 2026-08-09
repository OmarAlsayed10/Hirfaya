import { Box, Container, Typography, Paper, Button, Divider, TextField, MenuItem } from "@mui/material";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFile } from "../hooks/useFile";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CVAnalysisDashboard from "../features/CVAnalysis/CVAnalysisDashboard";
import ContentBlock from "../components/ui/ContentBlock";
import CvPicker from "../components/ui/CvPicker";
import type { CvOption } from "../utils/cvOptions";
import Seo from "../components/ui/Seo";
import { COLORS } from "../theme/tokens";


const CVAnalysisPage = () => {
  const { t } = useTranslation();
  const { uploadedFile, setUploadedFile } = useFile();
  const [savedCv, setSavedCv] = useState<CvOption | null>(null);
  const [primaryError, setPrimaryError] = useState("");
  const [level, setLevel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickSavedCv = (cv: CvOption) => {
    if (cv.text.trim().length < 30) {
      setPrimaryError(t("Your saved CV is too empty to analyze."));
      setSavedCv(null);
      return;
    }
    setPrimaryError("");
    setSavedCv(cv);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setSavedCv(null);
    setPrimaryError("");
  };

  return (
    <Box sx={{ bgcolor: COLORS.bgLight, minHeight: "100vh", py: { xs: 6, md: 10 } }}>
      <Seo
        title={t("Free CV Analysis & ATS Score")}
        description={t(
          "Upload your CV and get an instant ATS compatibility score with specific fixes for impact, structure and language."
        )}
      />
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

        {!uploadedFile && !savedCv ? (
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
                bgcolor: COLORS.bgWhite,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  borderColor: COLORS.primary,
                  bgcolor: "rgba(42, 92, 69, 0.02)",
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <CloudUploadOutlinedIcon
                sx={{ fontSize: 80, color: COLORS.primary, mb: 3 }}
              />
              <Typography
                variant="h5"
                sx={{ fontWeight: "bold", color: COLORS.textPrimary, mb: 1 }}
              >
                {t("Click to upload your resume")}
              </Typography>
              <Typography sx={{ color: COLORS.textSecondary, mb: 4 }}>
                {t("Supported formats: PDF, DOCX (Max 5MB)")}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  bgcolor: COLORS.primarySurface,
                  color: COLORS.onAccent,
                  px: 6,
                  py: 1.5,
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(42,92,69,0.2)",
                  "&:hover": { bgcolor: COLORS.primarySurfaceDark },
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
              <Typography sx={{ color: COLORS.textSecondary, fontSize: "0.85rem" }}>{t("or")}</Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            <CvPicker
              value={savedCv?.id ?? ""}
              onSelect={pickSavedCv}
              helperText={t("Pick one of your saved CVs. Your primary CV is marked with a star.")}
            />
            {primaryError && (
              <Typography sx={{ color: COLORS.accentOrange, fontSize: "0.85rem", textAlign: "center", mt: 1.5 }}>
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
              <Typography sx={{ color: COLORS.textSecondary, fontWeight: "bold" }}>
                Analyzing:{" "}
                <span style={{ color: COLORS.primary }}>{uploadedFile ? uploadedFile.name : savedCv?.title}</span>
              </Typography>
              <Button
                variant="outlined"
                onClick={clearFile}
                sx={{
                  color: COLORS.accentOrange,
                  borderColor: "rgba(194, 91, 26, 0.5)",
                  textTransform: "none",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  "&:hover": {
                    borderColor: COLORS.accentOrange,
                    bgcolor: "rgba(194, 91, 26, 0.05)",
                  },
                }}
              >
                {t("Analyze Another File")}
              </Button>
            </Box>
            <CVAnalysisDashboard uploadedFile={uploadedFile ?? undefined} cvText={savedCv?.text || undefined} level={level || undefined} />
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
