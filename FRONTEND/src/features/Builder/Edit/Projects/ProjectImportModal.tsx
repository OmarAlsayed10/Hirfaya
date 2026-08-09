import React, { DragEvent, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Stack,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GitHubIcon from "@mui/icons-material/GitHub";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { Sparkles, FileUp, CheckCircle2, UploadCloud } from "../../../../components/icons/MuiIcons";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AI_ENDPOINTS } from "../../../../constants/endpoints";
import { COLORS, RADIUS } from "../../../../theme/tokens";

export interface ImportedProjectData {
  name: string;
  technologies: string;
  demoUrl: string;
  githubUrl: string;
  description: string;
}

interface ProjectImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (project: ImportedProjectData) => void;
}

export const ProjectImportModal: React.FC<ProjectImportModalProps> = ({
  open,
  onClose,
  onImportSuccess,
}) => {
  const { t } = useTranslation();
  const [tabIndex, setTabIndex] = useState(0);

  // Form states
  const [repoUrl, setRepoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Status & loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<ImportedProjectData | null>(null);

  const resetState = () => {
    setRepoUrl("");
    setSelectedFile(null);
    setLoading(false);
    setError(null);
    setPreviewProject(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setError(t("Please enter a GitHub or GitLab URL."));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        AI_ENDPOINTS.importProjectUrl,
        { url: repoUrl.trim() },
        { withCredentials: true }
      );

      const projects: ImportedProjectData[] = response.data?.projects || [];
      if (projects.length > 0) {
        setPreviewProject(projects[0]);
      } else {
        setError(t("No project details could be generated from this repository."));
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        t("Failed to import project from URL. Please ensure the repository is public and contains a README.md file.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectMarkdownFile = (file?: File) => {
    if (!file) return;
    if (file.size > 500 * 1024) {
      setError(t("File size exceeds 500 KB limit."));
      setSelectedFile(null);
      return;
    }
    if (!/\.(md|markdown)$/i.test(file.name)) {
      setError(t("Only .md or .markdown files are allowed."));
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    selectMarkdownFile(event.target.files?.[0]);
  };

  const handleFileDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!loading) selectMarkdownFile(event.dataTransfer.files?.[0]);
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t("Please select a .md file to upload."));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("readme", selectedFile);

      const response = await axios.post(AI_ENDPOINTS.importProjectFile, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const projects: ImportedProjectData[] = response.data?.projects || [];
      if (projects.length > 0) {
        setPreviewProject(projects[0]);
      } else {
        setError(t("No project details could be generated from this file."));
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        t("Failed to process markdown file. Please try again or check your file content.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (previewProject) {
      onImportSuccess(previewProject);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: RADIUS.lg } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Sparkles size={24} color={COLORS.primary} />
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {t("Import Project with AI")}
          </Typography>
        </Stack>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {!previewProject ? (
          <>
            <Tabs
              value={tabIndex}
              onChange={(_, val) => {
                setTabIndex(val);
                setError(null);
              }}
              variant="fullWidth"
              sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
            >
              <Tab icon={<GitHubIcon fontSize="small" />} label={t("Paste URL")} iconPosition="start" />
              <Tab icon={<FileUp size={18} />} label={t("Upload .md File")} iconPosition="start" />
            </Tabs>

            {tabIndex === 0 && (
              <Box component="form" onSubmit={handleUrlSubmit}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t("Enter a public GitHub or GitLab repository link containing a README.md file.")}
                </Typography>

                <TextField
                  fullWidth
                  label={t("Repository URL")}
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={loading}
                  sx={{ mb: 2 }}
                />

                <Paper variant="outlined" sx={{ p: 1.5, mb: 3, bgcolor: "action.hover", borderRadius: RADIUS.sm, display: "flex", alignItems: "center", gap: 1 }}>
                  <LightbulbOutlinedIcon sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }} />
                  <Typography variant="caption" color="text.secondary">
                    {t("Recommended: Ensure your project has a detailed README.md for best ATS metric extraction.")}
                  </Typography>
                </Paper>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !repoUrl.trim()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={20} />}
                  sx={{
                    bgcolor: COLORS.primarySurface,
                    py: 1.2,
                    textTransform: "none",
                    "&:hover": { bgcolor: COLORS.primarySurfaceDark },
                  }}
                >
                  {loading ? t("Analyzing & Generating...") : t("Import Project")}
                </Button>
              </Box>
            )}

            {tabIndex === 1 && (
              <Box component="form" onSubmit={handleFileSubmit}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t("Upload a .md (Markdown) file from your computer (max 500 KB).")}
                </Typography>

                <Box
                  component="label"
                  onDragEnter={(event: DragEvent<HTMLLabelElement>) => {
                    event.preventDefault();
                    if (!loading) setIsDragging(true);
                  }}
                  onDragOver={(event: DragEvent<HTMLLabelElement>) => event.preventDefault()}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    boxSizing: "border-box",
                    border: `2px dashed ${selectedFile || isDragging ? COLORS.primary : COLORS.borderMedium || COLORS.borderMedium}`,
                    borderRadius: RADIUS.md,
                    p: 4,
                    textAlign: "center",
                    bgcolor: selectedFile || isDragging ? COLORS.primaryAlpha12 : "transparent",
                    cursor: "pointer",
                    mb: 3,
                    transition: "border-color 0.2s ease, background-color 0.2s ease",
                    "&:hover": { borderColor: COLORS.primary, bgcolor: COLORS.primaryAlpha12 },
                  }}
                >
                  <input
                    type="file"
                    accept=".md,.markdown"
                    hidden
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <UploadCloud size={44} color={COLORS.primary} sx={{ mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedFile ? selectedFile.name : t("Click or drag & drop .md file here")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {selectedFile
                      ? `${Math.round(selectedFile.size / 1024)} KB`
                      : t("Supports .md, .markdown files up to 500 KB")}
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !selectedFile}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={20} />}
                  sx={{
                    bgcolor: COLORS.primarySurface,
                    py: 1.2,
                    textTransform: "none",
                    "&:hover": { bgcolor: COLORS.primarySurfaceDark },
                  }}
                >
                  {loading ? t("Processing File...") : t("Upload & Generate")}
                </Button>
              </Box>
            )}
          </>
        ) : (
          /* Preview State */
          <Box>
            <Alert severity="success" icon={<CheckCircle2 size={20} />} sx={{ mb: 2 }}>
              {t("Project parsed successfully! Review your generated ATS entry below before adding.")}
            </Alert>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: RADIUS.md, borderColor: COLORS.primary }}>
              <Typography variant="h6" fontWeight="bold" color={COLORS.primary} sx={{ mb: 1 }}>
                {previewProject.name}
              </Typography>

              {previewProject.technologies && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
                  {previewProject.technologies.split(",").map((tech, idx) => (
                    <Chip key={idx} label={tech.trim()} size="small" variant="outlined" color="primary" />
                  ))}
                </Stack>
              )}

              {previewProject.githubUrl && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>{t("Repo")}:</strong> {previewProject.githubUrl}
                </Typography>
              )}

              {previewProject.demoUrl && (
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                  <strong>{t("Demo")}:</strong> {previewProject.demoUrl}
                </Typography>
              )}

              <Typography variant="subtitle2" fontWeight="bold" sx={{ mt: 1.5, mb: 0.5 }}>
                {t("ATS Bullet Points")}:
              </Typography>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: "action.hover", whiteSpace: "pre-wrap" }}>
                <Typography variant="body2">{previewProject.description}</Typography>
              </Paper>
            </Paper>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {previewProject ? (
          <>
            <Button onClick={() => setPreviewProject(null)} color="inherit">
              {t("Try Another")}
            </Button>
            <Button
              onClick={handleConfirmAdd}
              variant="contained"
              sx={{ bgcolor: COLORS.primarySurface, "&:hover": { bgcolor: COLORS.primarySurfaceDark } }}
            >
              {t("Add to Resume")}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} color="inherit">
            {t("Cancel")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProjectImportModal;
