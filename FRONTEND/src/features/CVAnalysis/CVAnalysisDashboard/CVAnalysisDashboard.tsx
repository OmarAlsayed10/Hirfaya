import { useContext, useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Grid, Typography } from '@mui/material';
import { pdf } from '@react-pdf/renderer';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AnalysisReportPdf from './AnalysisReportPdf';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../context/Auth/AuthContext';
import { useFeedback } from '../../../context/FeedbackContext';
import { useCVAnalysis } from './hooks/useCVAnalysis';
import { useCVAdjust } from './hooks/useCVAdjust';
import { useCVChat } from './hooks/useCVChat';
import { useInterviewAnswers } from './hooks/useInterviewAnswers';
import ScoreCard from './components/ScoreCard';
import LevelContextCard from './components/LevelContextCard';
import DimensionsPanel from './components/DimensionsPanel';
import FeedbackPanel from './components/FeedbackPanel';
import SuggestionsPanel from './components/SuggestionsPanel';
import AdjustCVPanel from './components/AdjustCVPanel';
import InterviewQuestionsCard from './components/InterviewQuestionsCard';
import CVChatPanel from './components/CVChatPanel';
import cvAnalysisDashboard from './cvAnalysisDashboard.tokens';
import { COLORS } from '../../../theme/tokens';
import type { CVAnalysisDashboardProps } from './CVAnalysisDashboard.types';
import { isProUser } from '../../../utils/proAccess';

const FREE_QUESTION_LIMIT = 3;

const CVAnalysisDashboard = ({ uploadedFile, cvText, level }: CVAnalysisDashboardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isPro = isProUser(user);
  const { notify, showEntitlement } = useFeedback();
  const [chatOpen, setChatOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { cvAnalyze, loading, error, errorCode } = useCVAnalysis(uploadedFile, cvText, level);
  const adjustProps = useCVAdjust(cvAnalyze);
  const chatProps = useCVChat(cvAnalyze?.extractedText);

  const visibleQuestions = isPro
    ? (cvAnalyze?.interviewQuestions || [])
    : (cvAnalyze?.interviewQuestions || []).slice(0, FREE_QUESTION_LIMIT);

  const interviewAnswerProps = useInterviewAnswers(cvAnalyze?.extractedText, visibleQuestions);

  const hiddenCount = (cvAnalyze?.interviewQuestions?.length || 0) - visibleQuestions.length;

  useEffect(() => {
    if (!error || cvAnalyze) return;
    if (errorCode === 'ANON_ANALYSIS_LIMIT') {
      showEntitlement('ANON_ANALYSIS_LIMIT');
    } else if (errorCode === 'CREDITS_EXHAUSTED') {
      showEntitlement('CREDITS_EXHAUSTED');
    } else {
      notify(error);
    }
  }, [cvAnalyze, error, errorCode, notify, showEntitlement]);

  if (loading) {
    return (
      <Box sx={cvAnalysisDashboard.loadingContainer}>
        <CircularProgress size={64} sx={{ color: COLORS.primary, mb: 3 }} />
        <Typography variant="h5" sx={cvAnalysisDashboard.loadingTitle}>{t('Analyzing your resume...')}</Typography>
        <Typography sx={cvAnalysisDashboard.loadingSubtitle}>{t('Our AI is cross-referencing your CV against industry standards.')}</Typography>
      </Box>
    );
  }

  if (error && !cvAnalyze) return null;

  if (!cvAnalyze) return null;

  const isPerfect = cvAnalyze.qualityScore === 100;

  const interviewSection = (
    <InterviewQuestionsCard
      visibleQuestions={visibleQuestions}
      hiddenCount={hiddenCount}
      isPro={isPro}
      answers={interviewAnswerProps.answers}
      answersLoading={interviewAnswerProps.loading}
      answersVisible={interviewAnswerProps.visible}
      onGetAnswers={interviewAnswerProps.fetchAnswers}
      onWantMore={() => navigate('/pricing')}
    />
  );

  const askAiButton = isPro && (
    <Button
      variant="outlined"
      startIcon={<ChatBubbleOutlineIcon />}
      onClick={() => setChatOpen(true)}
      sx={{ borderColor: COLORS.primary, color: COLORS.primary, borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', py: 1.25, '&:hover': { borderColor: COLORS.primaryDark, bgcolor: COLORS.primaryAlpha12 } }}
    >
      {t('Ask AI About Your CV')}
    </Button>
  );

  const chatModal = isPro && <CVChatPanel open={chatOpen} onClose={() => setChatOpen(false)} {...chatProps} />;

  const downloadPdf = async () => {
    if (!cvAnalyze) return;
    setDownloading(true);
    try {
      const qa = interviewAnswerProps.answers.length
        ? interviewAnswerProps.answers
        : await interviewAnswerProps.fetchAnswers();
      const blob = await pdf(<AnalysisReportPdf result={cvAnalyze} answers={qa} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cv-analysis-report.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const downloadButton = isPro && (
    <Button
      variant="contained"
      startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadRoundedIcon sx={{ fontSize: 18 }} />}
      onClick={downloadPdf}
      disabled={downloading}
      sx={{ bgcolor: COLORS.primary, borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', py: 1.25, '&:hover': { bgcolor: COLORS.primaryDark } }}
    >
      {downloading ? t('Preparing PDF...') : t('Download Report (PDF)')}
    </Button>
  );

  if (isPerfect) {
    return (
      <Box sx={cvAnalysisDashboard.root}>
        <ScoreCard score={cvAnalyze.qualityScore} matchJobTitle={cvAnalyze.matchJobTitle} />
        {(askAiButton || downloadButton) && (
          <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {downloadButton}
            {askAiButton}
          </Box>
        )}
        {interviewSection}
        {chatModal}
      </Box>
    );
  }

  return (
    <Box sx={cvAnalysisDashboard.root}>
      <ScoreCard score={cvAnalyze.qualityScore} matchJobTitle={cvAnalyze.matchJobTitle} />

      {downloadButton && <Box sx={{ mb: 4 }}>{downloadButton}</Box>}

      {cvAnalyze.levelContext && (
        <LevelContextCard levelContext={cvAnalyze.levelContext} />
      )}

      {cvAnalyze.dimensions?.length > 0 && (
        <DimensionsPanel dimensions={cvAnalyze.dimensions} detailsLocked={cvAnalyze.detailsLocked} />
      )}

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <FeedbackPanel
            positiveFeedback={cvAnalyze.positiveFeedback || []}
            negativeFeedback={cvAnalyze.negativeFeedback || []}
            neutralFeedback={cvAnalyze.neutralFeedback || []}
            atsCheckerNotes={cvAnalyze.atsCheckerNotes || []}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <SuggestionsPanel sectionsToImprove={cvAnalyze.sectionsToImprove || []} />
            {isPro && <AdjustCVPanel {...adjustProps} scoreBreakdown={cvAnalyze.scoreBreakdown} />}
            {askAiButton}
            {interviewSection}
          </Box>
        </Grid>
      </Grid>

      {chatModal}
    </Box>
  );
};

export default CVAnalysisDashboard;
