import { useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Container,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { cvTemplateAction } from "../redux/store/slices/cvTemplateSlice";
import { hasPaidAccess } from "../utils/proAccess";
import { useTemplate } from "../hooks/useTemplate";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Seo from "../components/ui/Seo";
import { COLORS } from "../theme/tokens";

const TemplatesPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const templates = useSelector((state: any) => state.cvTemplate.cvTemplate);
  const { setChoosenTemp } = useTemplate();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPro = hasPaidAccess(user);

  useEffect(() => {
    dispatch(cvTemplateAction());
  }, [dispatch]);

  const handleSelect = (title: string) => {
    setChoosenTemp(title);
    navigate("/builder");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Seo
        title={t("CV Templates")}
        description={t(
          "Modern, executive, creative and minimal CV templates that pass ATS screening, with full Arabic and RTL support."
        )}
      />
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            color: COLORS.textPrimary,
            mb: 1,
            fontFamily: '"DM Serif Display", serif'
          }}
        >
          {t("CV Templates")}
        </Typography>
        <Typography color="text.secondary" fontSize={15}>
          {t(
            "Choose from our professionally designed templates to create your perfect CV",
          )}
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {templates.map((template: any, index: number) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                transition: "all 0.3s ease",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 12px 40px rgba(106,17,203,0.15)",
                  borderColor: "primary.main",
                },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  image={template.img}
                  alt={template.title}
                  sx={{ height: 380, objectFit: "cover" }}
                />
                {template.pro && (
                  <Chip
                    label={t("PRO")}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: COLORS.primary,
                      color: COLORS.onAccent,
                      fontWeight: 700,
                      fontSize: 11,
                    }}
                  />
                )}
              </Box>
              <CardContent sx={{ pb: 1 }}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{ textTransform: "capitalize" }}
                >
                  {template.title.replace("-", " ")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {t(template.disc)}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!isPro && template.pro}
                  onClick={() => handleSelect(template.title)}
                  sx={{
                    background:
                      !isPro && template.pro
                        ? undefined
                        : COLORS.primary,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": {
                       background: !isPro && template.pro ? undefined : COLORS.primaryDark,
                       boxShadow: "none"
                    }
                  }}
                >
                  {!isPro && template.pro ? t("Pro Only") : t("Use Template")}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default TemplatesPage;
