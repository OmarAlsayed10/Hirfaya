import { Box, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ContentBlock from "../components/ui/ContentBlock";
import PlanCard from "../components/ui/PlanCard";
import { FEATURE_HIGHLIGHTS } from "../constants/pricingData";

const PricingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: "#f5f4ef", minHeight: "100vh", py: 8 }}>
      <Container maxWidth="lg">
        {/* Pricing Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <ContentBlock
            size="section"
            headline={t(
              "A feature-packed resume builder that makes resume creation a breeze",
            )}
            text={t(
              "Create a visually stunning resume with ease. Our resume builder will guide you through the process. We help with content suggestions and choosing the right design and layout, while you focus on presenting yourself.",
            )}
            textMaxWidth="800px"
          />
        </Box>

        {/* Pricing Cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            justifyContent: "center",
            alignItems: "stretch",
            mb: 10,
          }}
        >
          <Box sx={{ flex: "0 1 380px" }}>
            <PlanCard
              variant="free"
              buttonLabel={t("Build My Resume")}
              onButtonClick={() => navigate("/getStart")}
            />
          </Box>

          <Box sx={{ flex: "0 1 460px" }}>
            <PlanCard
              variant="pro"
              buttonLabel={t("Build My Resume")}
              onButtonClick={() => navigate("/payment-check")}
            />
          </Box>
        </Box>

        {/* Feature Highlights */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 6, mb: 10 }}>
          {FEATURE_HIGHLIGHTS.map((item) => (
            <Box key={item.headline} sx={{ flex: "1 1 260px" }}>
              <ContentBlock
                icon={item.icon}
                headline={t(item.headline)}
                text={t(item.text)}
              />
            </Box>
          ))}
        </Box>

        {/* Testimonial Section */}
        <Box
          sx={{
            bgcolor: "#ffffff",
            borderRadius: "10px",
            border: "1px solid rgba(26,26,24,0.1)",
            p: { xs: 4, md: 6 },
            textAlign: "center",
            maxWidth: "800px",
            mx: "auto",
          }}
        >
          <Typography
            sx={{
              color: "#2a5c45",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              mb: 2,
              fontSize: "0.85rem",
            }}
          >
            {t("What do people say about us?")}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"DM Serif Display", serif',
              fontSize: { xs: "1.2rem", md: "1.5rem" },
              color: "#1a1a18",
              fontStyle: "italic",
              mb: 4,
            }}
          >
            {t("pricing.testimonial.text")}
          </Typography>
          <Typography sx={{ fontWeight: "bold", color: "#1a1a18" }}>
            {t("Joshua Perk")}
          </Typography>
          <Typography sx={{ color: "#6b6b66" }}>
            {t("Account Manager, OpenNest")}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingPage;
