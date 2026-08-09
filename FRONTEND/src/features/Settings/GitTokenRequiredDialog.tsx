import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { RADIUS } from "../../theme/tokens";

interface GitTokenRequiredDialogProps {
  open: boolean;
  host: "GITHUB" | "GITLAB" | null;
  onClose: () => void;
}

export const GitTokenRequiredDialog: React.FC<GitTokenRequiredDialogProps> = ({
  open,
  host,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const hostName = host === "GITLAB" ? "GitLab" : "GitHub";

  const goToSettings = () => {
    onClose();
    navigate(`/settings?tab=connections&host=${host || "GITHUB"}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t("Connect your {{host}} account", { host: hostName })}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t("To read commit history from {{host}} we need a read-only access token. Without one, {{host}} limits us to a handful of requests per hour shared across everyone.", { host: hostName })}
        </Typography>

        <Alert severity="info" sx={{ borderRadius: RADIUS.sm, mb: 2 }}>
          {t("It takes about a minute. The token is read-only, encrypted, and you can remove it at any time.")}
        </Alert>

        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("You only need this if you want to import projects from {{host}}. Every other feature works without it.", { host: hostName })}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t("Not now")}</Button>
        <Button variant="contained" onClick={goToSettings}>
          {t("Add token in settings")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
