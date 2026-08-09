import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import {
  Box, Button, Chip, CircularProgress, Container,
  Link, Paper, Stack, Tab, Tabs, Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PsychologyIcon from "@mui/icons-material/Psychology";
import CodeIcon from "@mui/icons-material/Code";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LaunchIcon from "@mui/icons-material/Launch";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckIcon from "@mui/icons-material/Check";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TerminalIcon from "@mui/icons-material/Terminal";
import ExploreIcon from "@mui/icons-material/Explore";
import RadarIcon from "@mui/icons-material/Radar";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import { useTranslation } from "react-i18next";
import { ROADMAP_ENDPOINTS } from "../constants/endpoints";
import type { SkillRoadmapDetails } from "../features/CareerMatch/CareerRoadmap/CareerRoadmap.types";
import { COLORS } from "../theme/tokens";

const palette = { primary: COLORS.primary, dark: COLORS.bgDark, sand: COLORS.bgLight, ink: COLORS.textPrimary, muted: COLORS.textSecondary, amber: COLORS.accentOrange };

const categoryLabels: Record<string, string> = {
  skill: "Requirement category: skill",
  experience: "Requirement category: experience",
  education: "Requirement category: education",
  certification: "Requirement category: certification",
  eligibility: "Requirement category: eligibility",
  responsibility: "Requirement category: responsibility",
};

const SKILL_ALIASES: Record<string, string> = {
  postgres: "postgresql",
  postgresql: "postgresql",
  "postgre-sql": "postgresql",
  "postgres-database": "postgresql",
  "postgresql-database": "postgresql",
  "postgres-db": "postgresql",
  "postgres-sql": "postgresql",
  "relational-database-postgresql": "postgresql",
  "relational-database": "postgresql",
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  react: "react",
  reactjs: "react",
  "react-js": "react",
  node: "nodejs",
  nodejs: "nodejs",
  "node-js": "nodejs",
  next: "nextjs",
  nextjs: "nextjs",
  "next-js": "nextjs",
  docker: "docker",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
};

function normalizeSkillKey(skillName: string): string {
  if (!skillName || typeof skillName !== "string") return "";
  const baseKey = skillName
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  if (SKILL_ALIASES[baseKey]) return SKILL_ALIASES[baseKey];

  // Postgres always maps regardless of compound suffix (pgvector, pg-sql, etc.)
  if (/postgres|pg-sql|pg-vector|postgre/.test(baseKey)) return "postgresql";

  // For all other prefix-based aliases, only apply to single-token keys
  // (no hyphen) to avoid collapsing compound names like "react-next-js" → "react"
  const isSingleToken = !baseKey.includes("-");
  if (isSingleToken) {
    if (/^react/.test(baseKey)) return "react";
    if (/^node/.test(baseKey)) return "nodejs";
    if (/^next/.test(baseKey)) return "nextjs";
    if (/^vue/.test(baseKey)) return "vuejs";
    if (/^express/.test(baseKey)) return "expressjs";
    if (/^docker/.test(baseKey)) return "docker";
    if (/^kubernetes|^k8s/.test(baseKey)) return "kubernetes";
    if (/^ts$|^typescript/.test(baseKey)) return "typescript";
    if (/^js$|^javascript/.test(baseKey)) return "javascript";
    if (/^python/.test(baseKey)) return "python";
    if (/^mongo/.test(baseKey)) return "mongodb";
  }

  return baseKey;
}

interface UserProgressItem {
  id: string;
  skillKey: string;
  skill: string;
  category: string;
  status: "in_progress" | "learned";
  learnedAt: string | null;
  roadmap: SkillRoadmapDetails;
}

export default function RoadmapPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<UserProgressItem[]>([]);
  const [trends, setTrends] = useState<SkillRoadmapDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "in_progress" | "learned">("all");
  const [deletingSkill, setDeletingSkill] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [progressRes, trendsRes] = await Promise.all([
        axios.get<{ progress: UserProgressItem[] }>(ROADMAP_ENDPOINTS.getProgress, { withCredentials: true }),
        axios.get<{ trends: SkillRoadmapDetails[] }>(ROADMAP_ENDPOINTS.getTrends, { withCredentials: true }),
      ]);

      if (Array.isArray(progressRes.data?.progress)) {
        setItems(progressRes.data.progress);
      }
      if (Array.isArray(trendsRes.data?.trends)) {
        setTrends(trendsRes.data.trends);
      }
    } catch (err) {
      console.error("Failed to fetch roadmap data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleStatus = async (item: UserProgressItem | { skill: string; skillKey: string; status?: string }) => {
    const currentStatus = ("status" in item && item.status) ? item.status : "in_progress";
    const nextStatus = currentStatus === "learned" ? "in_progress" : "learned";
    const targetKey = normalizeSkillKey(item.skillKey || item.skill || "");

    setItems((prev) => {
      const exists = prev.some((x) => normalizeSkillKey(x.skillKey || x.skill || "") === targetKey);
      if (exists) {
        return prev.map((x) => (normalizeSkillKey(x.skillKey || x.skill || "") === targetKey ? { ...x, status: nextStatus } : x));
      }
      return prev;
    });

    try {
      await axios.post(
        ROADMAP_ENDPOINTS.updateProgress,
        { skill: item.skill, status: nextStatus },
        { withCredentials: true }
      );
      fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteSkill = async (item: UserProgressItem) => {
    const targetKey = normalizeSkillKey(item.skillKey || item.skill || "");
    setDeletingSkill(targetKey);
    // Optimistic removal
    setItems((prev) => prev.filter((x) => normalizeSkillKey(x.skillKey || x.skill || "") !== targetKey));
    try {
      await axios.delete(ROADMAP_ENDPOINTS.deleteProgress, {
        data: { skill: item.skill },
        withCredentials: true,
      });
    } catch (err) {
      console.error("Failed to delete skill:", err);
      // Revert on error
      fetchData();
    } finally {
      setDeletingSkill(null);
    }
  };

  const dedupedItems = items.reduce<UserProgressItem[]>((acc, item) => {
    const key = normalizeSkillKey(item.skillKey || item.skill || "");
    if (!acc.some((x) => normalizeSkillKey(x.skillKey || x.skill || "") === key)) {
      acc.push({ ...item, skillKey: key });
    }
    return acc;
  }, []);

  const filteredItems = dedupedItems.filter((item) => {
    if (filter === "in_progress") return item.status === "in_progress";
    if (filter === "learned") return item.status === "learned";
    return true;
  });

  const learnedCount = dedupedItems.filter((x) => x.status === "learned").length;
  const inProgressCount = dedupedItems.filter((x) => x.status === "in_progress").length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: palette.sand, pb: 10 }}>
      {/* Top Banner */}
      <Box sx={{ bgcolor: palette.dark, color: COLORS.onAccent, pt: { xs: 6, md: 9 }, pb: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Chip icon={<TrackChangesIcon sx={{ color: "white !important", fontSize: 16 }} />} label={t("Skill Readiness & Career Copilot")} sx={{ color: COLORS.onAccent, bgcolor: "rgba(255,255,255,.12)", fontWeight: 800, mb: 2.5 }} />
          <Typography component="h1" sx={{ fontSize: { xs: 36, md: 54 }, lineHeight: 1.05, fontWeight: 850 }}>
            {t("Your Automated Skill Roadmap")}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,.75)", fontSize: { xs: 16, md: 19 }, mt: 2, maxWidth: 720 }}>
            {t("Master missing job requirements step-by-step with verified official documentation, interactive browser sandboxes, and hands-on portfolio projects.")}
          </Typography>

          <Stack direction="row" gap={2} mt={3}>
            <Button
              component={RouterLink}
              to="/career-match"
              variant="contained"
              startIcon={<ExploreIcon />}
              sx={{ bgcolor: palette.primary, textTransform: "none", fontWeight: 850, borderRadius: 2.5, px: 3 }}
            >
              {t("Career Match")}
            </Button>
            <Button
              component={RouterLink}
              to="/job-radar"
              variant="outlined"
              startIcon={<RadarIcon />}
              sx={{ color: COLORS.onAccent, borderColor: "rgba(255,255,255,.4)", textTransform: "none", fontWeight: 850, borderRadius: 2.5, px: 3 }}
            >
              {t("Job Radar")}
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: -6, position: "relative" }}>
        {/* 2026 Market Trends Section */}
        {trends.length > 0 && (
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 5, mb: 4, bgcolor: COLORS.bgDark, color: COLORS.onAccent, border: "1px solid rgba(255,255,255,.1)" }}>
            <Stack direction="row" gap={1} alignItems="center" mb={1}>
              <TrendingUpIcon sx={{ color: COLORS.success, fontSize: 24 }} />
              <Typography variant="h5" sx={{ fontWeight: 850, color: COLORS.onAccent }}>
                {t("2026 Recommended Market Growth Skills")}
              </Typography>
            </Stack>
            <Typography sx={{ color: "rgba(255,255,255,.75)", fontSize: 14, mb: 3 }}>
              {t("Top high-demand technologies for 2026. Learning these ensures you stay ahead in the market, even beyond your current CV scope.")}
            </Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
              {trends.map((trend) => {
                const isLearned = dedupedItems.some((x) => normalizeSkillKey(x.skillKey) === normalizeSkillKey(trend.skillKey) && x.status === "learned");
                return (
                  <Paper key={trend.skillKey} elevation={0} sx={{ p: 2.5, borderRadius: 4, bgcolor: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: COLORS.onAccent, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" gap={1} mb={1}>
                        <Chip size="small" icon={<PsychologyIcon sx={{ fontSize: 14, color: "#fff !important" }} />} label={t("2026 Trend")} sx={{ bgcolor: palette.primary, color: COLORS.onAccent, fontWeight: 800 }} />
                        {isLearned && <Chip size="small" icon={<CheckIcon sx={{ fontSize: 14 }} />} label={t("Learned")} color="success" sx={{ fontWeight: 800 }} />}
                      </Stack>
                      <Typography sx={{ fontWeight: 850, fontSize: 16, mt: 1, color: COLORS.onAccent }}>
                        {trend.skill}
                      </Typography>

                      {trend.officialDocs && (
                        <Link href={trend.officialDocs.url} target="_blank" rel="noreferrer" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: 13, color: COLORS.success, mt: 1.5, textDecoration: "none", fontWeight: 700 }}>
                          <MenuBookIcon sx={{ fontSize: 15 }} /> {trend.officialDocs.title} <LaunchIcon sx={{ fontSize: 13 }} />
                        </Link>
                      )}

                      {trend.projectIdeas.length > 0 && (
                        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, bgcolor: COLORS.borderDark }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,.7)", display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CodeIcon sx={{ fontSize: 14, color: COLORS.success }} /> {t("Project Challenge:")}
                          </Typography>
                          <Typography sx={{ fontSize: 12.5, color: COLORS.onAccent, mt: 0.5 }}>
                            {trend.projectIdeas[0]}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <Button
                      size="small"
                      variant={isLearned ? "outlined" : "contained"}
                      onClick={() => toggleStatus({ skill: trend.skill, skillKey: trend.skillKey, status: isLearned ? "learned" : "in_progress" })}
                      startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                      sx={{ mt: 2.5, textTransform: "none", fontWeight: 800, borderRadius: 2, bgcolor: isLearned ? "transparent" : palette.primary, color: COLORS.onAccent, borderColor: "rgba(255,255,255,.4)" }}
                    >
                      {isLearned ? t("Mark In Progress") : t("Add to My Roadmap")}
                    </Button>
                  </Paper>
                );
              })}
            </Box>
          </Paper>
        )}

        {/* User Saved Skills Section */}
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 5, border: "1px solid rgba(24,34,29,.08)", boxShadow: "0 20px 60px rgba(25,59,44,.08)", bgcolor: COLORS.bgWhite }}>
          {/* Tabs Filter */}
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2} mb={3}>
            <Tabs value={filter} onChange={(_, val) => setFilter(val)} sx={{ "& .Mui-selected": { fontWeight: 850, color: palette.primary } }}>
              <Tab label={`${t("Your Matched Gaps")} (${dedupedItems.length})`} value="all" sx={{ textTransform: "none" }} />
              <Tab label={`${t("In Progress")} (${inProgressCount})`} value="in_progress" sx={{ textTransform: "none" }} />
              <Tab label={`${t("Learned & Ready")} (${learnedCount})`} value="learned" sx={{ textTransform: "none" }} />
            </Tabs>
          </Stack>

          {loading ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <CircularProgress sx={{ color: palette.primary }} />
              <Typography sx={{ color: palette.muted, mt: 2 }}>{t("Loading your saved skill roadmaps...")}</Typography>
            </Box>
          ) : filteredItems.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, borderRadius: 4, textAlign: "center", border: "1.5px dashed #cde0d4", bgcolor: COLORS.surfaceSubtle }}>
              <ExploreIcon sx={{ fontSize: 44, color: palette.primary }} />
              <Typography variant="h6" sx={{ fontWeight: 850, mt: 2, color: palette.ink }}>
                {dedupedItems.length === 0 ? t("No Custom Skill Gaps Added Yet") : t("No skills match this filter")}
              </Typography>
              <Typography sx={{ color: palette.muted, mt: 1, maxWidth: 500, mx: "auto", fontSize: 14 }}>
                {dedupedItems.length === 0
                  ? t("Run a Career Match on any job vacancy to automatically discover missing skill gaps, or explore the 2026 Market Trends above.")
                  : t("Try switching tabs to view all saved skills.")}
              </Typography>
              {dedupedItems.length === 0 && (
                <Button
                  component={RouterLink}
                  to="/career-match"
                  variant="contained"
                  sx={{ mt: 3, bgcolor: palette.primary, textTransform: "none", fontWeight: 850, borderRadius: 2.5 }}
                >
                  {t("Match a Job Vacancy Now")}
                </Button>
              )}
            </Paper>
          ) : (
            <Stack spacing={3}>
              {filteredItems.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: 4,
                    border: `1.5px solid ${item.status === "learned" ? COLORS.primary : COLORS.borderLight}`,
                    bgcolor: item.status === "learned" ? COLORS.bgIconTinted : COLORS.bgWhite,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap">
                    <Box>
                      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="h6" sx={{ fontWeight: 850, color: palette.ink }}>
                          {item.skill}
                        </Typography>
                        <Chip size="small" label={t(categoryLabels[item.category] || item.category)} variant="outlined" sx={{ textTransform: "capitalize" }} />
                        {item.status === "learned" ? (
                          <Chip icon={<CheckIcon sx={{ fontSize: 14 }} />} size="small" label={t("Learned & Ready")} color="success" sx={{ fontWeight: 800 }} />
                        ) : (
                          <Chip size="small" label={t("In Progress")} color="warning" sx={{ fontWeight: 800 }} />
                        )}
                      </Stack>
                    </Box>

                    <Stack direction="row" gap={1} flexWrap="wrap">
                      <Button
                        variant={item.status === "learned" ? "outlined" : "contained"}
                        color={item.status === "learned" ? "inherit" : "primary"}
                        onClick={() => toggleStatus(item)}
                        startIcon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 850,
                          borderRadius: 2.5,
                          bgcolor: item.status === "learned" ? "transparent" : palette.primary,
                        }}
                      >
                        {item.status === "learned" ? t("Mark In Progress") : t("Mark as Learned / Added to CV")}
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => deleteSkill(item)}
                        disabled={deletingSkill === normalizeSkillKey(item.skillKey || item.skill || "")}
                        startIcon={<DeleteOutlineIcon sx={{ fontSize: 18 }} />}
                        sx={{
                          textTransform: "none",
                          fontWeight: 850,
                          borderRadius: 2.5,
                          borderColor: COLORS.danger,
                          color: COLORS.danger,
                          "&:hover": { bgcolor: COLORS.dangerSoft, borderColor: COLORS.danger },
                        }}
                      >
                        {t("Remove from Roadmap")}
                      </Button>
                    </Stack>
                  </Stack>

                  {/* Resource Cards */}
                  <Stack spacing={2} mt={3}>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      {item.roadmap.officialDocs && (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: COLORS.bgIconTinted, border: "1px solid #cce2d4", flex: 1, minWidth: 220 }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 800, color: palette.primary, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 0.75 }}>
                            <MenuBookIcon sx={{ fontSize: 15 }} />
                            {t("Official Documentation")}
                          </Typography>
                          <Link href={item.roadmap.officialDocs.url} target="_blank" rel="noreferrer" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 800, color: palette.ink, mt: 0.5, textDecoration: "none" }}>
                            {item.roadmap.officialDocs.title} <LaunchIcon sx={{ fontSize: 14 }} />
                          </Link>
                        </Paper>
                      )}

                      {item.roadmap.playground && (
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: COLORS.warningSoft, border: "1px solid #f2dec0", flex: 1, minWidth: 220 }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 800, color: palette.amber, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 0.75 }}>
                            <TerminalIcon sx={{ fontSize: 15 }} />
                            {t("Interactive Playground / Testing")}
                          </Typography>
                          <Link href={item.roadmap.playground.url} target="_blank" rel="noreferrer" sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 800, color: palette.ink, mt: 0.5, textDecoration: "none" }}>
                            {item.roadmap.playground.title} <LaunchIcon sx={{ fontSize: 14 }} />
                          </Link>
                        </Paper>
                      )}
                    </Box>

                    {item.roadmap.projectIdeas && item.roadmap.projectIdeas.length > 0 && (
                      <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: COLORS.surfaceSubtle, border: "1px solid #e2ebe4" }}>
                        <Typography sx={{ fontWeight: 850, fontSize: 14, color: palette.ink, display: "flex", alignItems: "center", gap: 1 }}>
                          <AutoAwesomeIcon sx={{ fontSize: 16, color: palette.primary }} /> {t("Practical Project Ideas to Build")}
                        </Typography>
                        <Stack spacing={1} mt={1.5}>
                          {item.roadmap.projectIdeas.map((idea, idx) => (
                            <Stack key={idx} direction="row" gap={1} alignItems="flex-start">
                              <Box sx={{ minWidth: 20, height: 20, borderRadius: "50%", bgcolor: palette.primary, color: COLORS.onAccent, fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center", mt: 0.25 }}>
                                {idx + 1}
                              </Box>
                              <Typography sx={{ fontSize: 14, color: palette.ink, fontWeight: 600 }}>{idea}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {item.roadmap.courseLinks && item.roadmap.courseLinks.length > 0 && (
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 800, color: palette.muted, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 0.75 }}>
                          <SchoolIcon sx={{ fontSize: 15 }} />
                          {t("Free Tutorials & Guides")}
                        </Typography>
                        <Stack direction="row" gap={2} flexWrap="wrap" mt={1}>
                          {item.roadmap.courseLinks.map((course, idx) => (
                            <Link key={idx} href={course.url} target="_blank" rel="noreferrer" sx={{ fontSize: 13, fontWeight: 700, color: palette.primary, display: "flex", alignItems: "center", gap: 0.5 }}>
                              <SchoolIcon sx={{ fontSize: 15 }} /> {course.title} <LaunchIcon sx={{ fontSize: 13 }} />
                            </Link>
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
