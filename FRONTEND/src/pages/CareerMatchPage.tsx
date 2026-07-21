import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Box, Button, Chip, CircularProgress, Container, FormControlLabel,
  MenuItem, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { BriefcaseBusiness, Compass, FileText, Radar, UploadCloud } from "../components/icons/MuiIcons";
import { useTranslation } from "react-i18next";
import { AI_ENDPOINTS, CV_ENDPOINTS } from "../constants/endpoints";
import CareerMatchResults from "../features/CareerMatch/CareerMatchResults";
import type { CareerMatchResponse, LiveMarketStatus } from "../features/CareerMatch/CareerMatch.types";
import { cvToText } from "../utils/cvToText";
import { useFeedback } from "../context/FeedbackContext";

const palette = { primary: "#2a5c45", dark: "#193b2c", sand: "#f5f4ef", ink: "#18221d", muted: "#68736d", amber: "#bb6b25" };
type Mode = "discovery" | "vacancy";

export default function CareerMatchPage() {
  const { t } = useTranslation();
  const { notify, showEntitlement } = useFeedback();
  const [mode, setMode] = useState<Mode>("discovery");
  const [file, setFile] = useState<File | null>(null);
  const [primaryText, setPrimaryText] = useState("");
  const [targetTitle, setTargetTitle] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [useLiveMarket, setUseLiveMarket] = useState(false);
  const [status, setStatus] = useState<LiveMarketStatus | null>(null);
  const [result, setResult] = useState<CareerMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get(AI_ENDPOINTS.careerMatchLimits, { withCredentials: true })
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus(null));
  }, []);

  const selectFile = (selected: File | undefined) => {
    if (!selected) return;
    setFile(selected);
    setPrimaryText("");
  };

  const loadPrimaryCV = async () => {
    setLoadingPrimary(true);
    try {
      const { data } = await axios.get(CV_ENDPOINTS.primary, { withCredentials: true });
      if (!data?.cv) throw new Error("No primary CV");
      const text = cvToText(data.cv);
      if (text.trim().length < 100) throw new Error("CV is too short");
      setPrimaryText(text);
      setFile(null);
    } catch {
      notify(t("We couldn't load a usable primary CV. Build one or upload a PDF/DOCX."));
    } finally {
      setLoadingPrimary(false);
    }
  };

  const submit = async () => {
    setResult(null);
    if (!file && !primaryText) {
      notify(t("Choose a CV file or use your primary CV first."));
      return;
    }
    if (mode === "vacancy" && jobDescription.trim().length < 80) {
      notify(t("Paste the actual vacancy description so the match can be evidence-based."));
      return;
    }
    if (mode === "discovery" && useLiveMarket && (status?.remaining ?? 0) <= 0) {
      notify(t("Your plan has no live market searches remaining. Turn live search off or change plan."));
      return;
    }

    const form = new FormData();
    if (file) form.append("cv", file);
    if (primaryText) form.append("cvText", primaryText);
    if (targetTitle.trim()) form.append("targetJobTitle", targetTitle.trim());
    if (experienceLevel) form.append("experienceLevel", experienceLevel);
    if (mode === "vacancy") form.append("jobDescription", jobDescription.trim());
    form.append("useLiveMarket", String(mode === "discovery" && useLiveMarket));

    setLoading(true);
    try {
      const { data } = await axios.post<CareerMatchResponse>(AI_ENDPOINTS.careerMatch, form, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setStatus(data.liveMarketStatus);
      window.dispatchEvent(new Event("quota:refresh"));
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const data = requestError.response?.data as { code?: string; message?: string; liveMarketStatus?: LiveMarketStatus } | undefined;
        if (data?.liveMarketStatus) setStatus(data.liveMarketStatus);
        if (data?.code === "CREDITS_EXHAUSTED") {
          showEntitlement("CREDITS_EXHAUSTED");
        } else {
          notify(data?.message || t("Career Match failed. Please try again."));
        }
      } else {
        notify(t("Career Match failed. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const liveUnavailable = (status?.remaining ?? 0) <= 0;
  const selectedCv = file?.name || (primaryText ? t("Primary CV") : t("No CV selected"));

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: palette.sand, pb: 10 }}>
      <Box sx={{ bgcolor: palette.dark, color: "white", pt: { xs: 7, md: 10 }, pb: { xs: 13, md: 16 }, position: "relative", overflow: "hidden" }}>
        <Container maxWidth="lg">
          <Chip icon={<Radar size={15} />} label={t("Separate from CV Quality")} sx={{ color: "white", bgcolor: "rgba(255,255,255,.12)", fontWeight: 800, mb: 3 }} />
          <Typography component="h1" sx={{ fontSize: { xs: 40, md: 66 }, lineHeight: .98, letterSpacing: "-.045em", fontWeight: 850, maxWidth: 800 }}>{t("Find the work your experience can grow into.")}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,.72)", fontSize: { xs: 17, md: 20 }, mt: 3, maxWidth: 720 }}>{t("Discover roles from your real evidence, or compare your CV with a vacancy you paste. The target job title is always optional.")}</Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -8, md: -10 }, position: "relative" }}>
        <Paper elevation={0} sx={{ borderRadius: 5, overflow: "hidden", border: "1px solid rgba(24,34,29,.08)", boxShadow: "0 24px 70px rgba(25,59,44,.12)" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, p: 1, bgcolor: "#e9eee9" }}>
            {([
              { id: "discovery" as const, title: t("Discover my roles"), text: t("No job title required"), icon: <Compass size={22} /> },
              { id: "vacancy" as const, title: t("Match a vacancy"), text: t("Paste the job description"), icon: <BriefcaseBusiness size={22} /> },
            ]).map((item) => (
              <Button key={item.id} onClick={() => { setMode(item.id); setResult(null); }} startIcon={item.icon} sx={{ justifyContent: "flex-start", textAlign: "left", px: 2.5, py: 2, borderRadius: 3.5, color: mode === item.id ? palette.primary : palette.muted, bgcolor: mode === item.id ? "white" : "transparent", textTransform: "none", boxShadow: mode === item.id ? "0 5px 18px rgba(25,59,44,.08)" : "none", "&:hover": { bgcolor: mode === item.id ? "white" : "rgba(255,255,255,.45)" } }}>
                <Box><Typography sx={{ fontWeight: 850 }}>{item.title}</Typography><Typography sx={{ fontSize: 12, opacity: .75 }}>{item.text}</Typography></Box>
              </Button>
            ))}
          </Box>

          <Box sx={{ p: { xs: 2.5, md: 5 }, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.3fr) minmax(280px, .7fr)" }, gap: 4 }}>
            <Stack spacing={2.5}>
              <Box><Typography variant="h5" sx={{ fontWeight: 850, color: palette.ink }}>{mode === "discovery" ? t("What roles fit this CV?") : t("How closely does this CV fit?")}</Typography><Typography sx={{ color: palette.muted, mt: .5 }}>{mode === "discovery" ? t("We look beyond the headline—for example, Full Stack experience can also reveal DevOps or AI engineering directions.") : t("The pasted description is the source of truth. We do not use the older Jobs route.")}</Typography></Box>
              <TextField label={t("Target job title (optional)")} value={targetTitle} onChange={(event) => setTargetTitle(event.target.value.slice(0, 100))} placeholder={t("Leave blank to let AI infer your directions")} helperText={t("A hint, never a requirement.")} fullWidth />
              <TextField select label={t("Experience level (optional)")} value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} fullWidth>
                <MenuItem value="">{t("Infer from my CV")}</MenuItem>
                {['Fresh', 'Junior', 'Mid', 'Senior', 'Lead'].map((level) => <MenuItem key={level} value={level}>{t(level)}</MenuItem>)}
              </TextField>
              {mode === "vacancy" && <TextField label={t("Actual job description")} value={jobDescription} onChange={(event) => setJobDescription(event.target.value.slice(0, 20000))} placeholder={t("Paste responsibilities, requirements, and preferred skills…")} multiline minRows={8} required helperText={`${jobDescription.length.toLocaleString()} / 20,000 characters`} />}
              {mode === "discovery" && <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#f1f5f2", borderRadius: 3, border: "1px solid #dce5df" }}><FormControlLabel control={<Switch checked={useLiveMarket} onChange={(event) => setUseLiveMarket(event.target.checked)} disabled={liveUnavailable} />} label={<Box><Typography sx={{ fontWeight: 800 }}>{t("Search the live job market")}</Typography><Typography sx={{ color: palette.muted, fontSize: 13 }}>{t("Uses AI web search for current evidence. Your CV is not sent to web search—only the inferred role titles.")}</Typography></Box>} /><Stack direction="row" gap={1} mt={1.5} flexWrap="wrap"><Chip size="small" label={`${status?.remaining ?? "—"} ${t("remaining")}`} color={liveUnavailable ? "default" : "primary"} /><Chip size="small" variant="outlined" label={t("Identical repeats are free for 7 days")} /></Stack></Paper>}
            </Stack>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: "1.5px dashed #aec3b6", bgcolor: "#fbfcfb", alignSelf: "start" }}>
              <Box sx={{ width: 52, height: 52, display: "grid", placeItems: "center", borderRadius: 3, bgcolor: "#e5efe9", color: palette.primary }}><FileText size={25} /></Box>
              <Typography sx={{ fontWeight: 850, mt: 2 }}>{t("Your CV")}</Typography><Typography sx={{ color: selectedCv === t("No CV selected") ? palette.muted : palette.primary, fontSize: 14, mt: .5, wordBreak: "break-word" }}>{selectedCv}</Typography>
              <Button fullWidth variant="outlined" startIcon={<UploadCloud size={18} />} onClick={() => fileInput.current?.click()} sx={{ mt: 2.5, py: 1.2, textTransform: "none", borderRadius: 2.5, fontWeight: 800 }}>{t("Upload PDF or DOCX")}</Button>
              <input ref={fileInput} hidden type="file" accept=".pdf,.doc,.docx" onChange={(event) => selectFile(event.target.files?.[0])} />
              <Button fullWidth onClick={loadPrimaryCV} disabled={loadingPrimary} sx={{ mt: 1, textTransform: "none", fontWeight: 800 }}>{loadingPrimary ? t("Loading…") : t("Use my primary CV")}</Button>
              <Button fullWidth variant="contained" onClick={submit} disabled={loading} sx={{ mt: 3, py: 1.4, borderRadius: 2.5, bgcolor: palette.primary, textTransform: "none", fontWeight: 850, "&:hover": { bgcolor: palette.dark } }}>{loading ? <><CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />{t("Analyzing…")}</> : mode === "discovery" ? t("Discover my roles") : t("Calculate job match")}</Button>
              <Typography sx={{ color: palette.muted, fontSize: 11.5, mt: 1.5, textAlign: "center" }}>{t("AI estimates—not an ATS decision or hiring guarantee.")}</Typography>
            </Paper>
          </Box>
        </Paper>

        {result && <Box sx={{ mt: 4 }}><CareerMatchResults result={result} /></Box>}
      </Container>
    </Box>
  );
}