import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Tabs, Tab, Button } from "@mui/material";
import { Home } from "../../components/icons/MuiIcons";
import { useTranslation } from "react-i18next";
import { COLORS, TYPOGRAPHY } from "../../theme/tokens";
import UsersTab from "./UsersTab";
import PaymentsTab from "./PaymentsTab";
import BlogsTab from "./BlogsTab";
import BannedIpsTab from "./BannedIpsTab";
import AiStatusTab from "./AiStatusTab";
import JobCatalogTab from "./JobCatalogTab";
import JobSubmissionsTab from "./JobSubmissionsTab";
import ReviewsTab from "./ReviewsTab";

const TABS = ["Users", "Payments", "AI Status", "Job Radar", "Job review", "Reviews", "Blogs", "Banned IPs"] as const;

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5fa", p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: TYPOGRAPHY.fontSerif, color: COLORS.textPrimary, flex: 1 }}
          >
            {t('Admin Dashboard')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Home size={16} />}
            onClick={() => navigate("/")}
            sx={{ color: COLORS.primary, borderColor: COLORS.primary }}
          >
            {t('Home')}
          </Button>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 3, "& .MuiTab-root": { fontWeight: 600, textTransform: "none" } }}
          TabIndicatorProps={{ sx: { bgcolor: COLORS.primary } }}
        >
          {TABS.map((name) => (
            <Tab key={name} label={t(name)} />
          ))}
        </Tabs>

        {tab === 0 && <UsersTab />}
        {tab === 1 && <PaymentsTab />}
        {tab === 2 && <AiStatusTab />}
        {tab === 3 && <JobCatalogTab />}
        {tab === 4 && <JobSubmissionsTab />}
        {tab === 5 && <ReviewsTab />}
        {tab === 6 && <BlogsTab />}
        {tab === 7 && <BannedIpsTab />}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
