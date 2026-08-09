import { useState } from 'react';
import { Box, Card, Button, CircularProgress, Collapse, Divider, Typography } from '@mui/material';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY } from '../../../../theme/tokens';
import type { InterviewQA } from '../CVAnalysisDashboard.types';

interface InterviewQuestionsCardProps {
  visibleQuestions: string[];
  hiddenCount: number;
  isPro: boolean;
  answers: InterviewQA[];
  answersLoading: boolean;
  answersVisible: boolean;
  onGetAnswers: () => void;
  onWantMore: () => void;
}

const InterviewQuestionsCard = ({
  visibleQuestions, hiddenCount, isPro,
  answers, answersLoading, answersVisible,
  onGetAnswers, onWantMore,
}: InterviewQuestionsCardProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (i: number) => {
    if (!isPro) { onWantMore(); return; }
    if (!answersVisible) onGetAnswers();
    setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <Card elevation={0} sx={{ p: 4, borderRadius: '24px', border: `1px solid ${COLORS.borderLight}`, bgcolor: COLORS.primarySurface, color: COLORS.onAccent }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, fontFamily: TYPOGRAPHY.fontSerif, color: COLORS.onAccent }}>
        {t('Prepare for the Interview')}
      </Typography>
      <Typography sx={{ mb: 3, opacity: 0.85, fontSize: '0.95rem' }}>
        {isPro
          ? t('Tap a question to reveal a model answer based on your resume.')
          : t('Based on your resume, employers might ask you these questions:')}
      </Typography>

      {visibleQuestions.length > 0 ? (
        visibleQuestions.map((question, i) => (
          <Box key={i}>
            <Box
              onClick={() => toggle(i)}
              sx={{ display: 'flex', gap: 2, py: 1.25, alignItems: 'flex-start', cursor: 'pointer', '&:hover': { opacity: 0.92 } }}
            >
              <QuestionAnswerOutlinedIcon sx={{ opacity: 0.7, mt: 0.3, flexShrink: 0 }} />
              <Typography sx={{ fontWeight: 'bold', fontSize: '1rem', flex: 1 }}>{question}</Typography>
              {isPro && (expanded[i] ? <ExpandLessIcon sx={{ opacity: 0.8 }} /> : <ExpandMoreIcon sx={{ opacity: 0.8 }} />)}
            </Box>

            {isPro && (
              <Collapse in={!!expanded[i]}>
                <Box sx={{ ml: 5, mb: 1.5 }}>
                  {answersLoading && !answers[i] ? (
                    <CircularProgress size={16} sx={{ color: COLORS.onAccent }} />
                  ) : answers[i] ? (
                    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: '10px', borderLeft: '3px solid rgba(255,255,255,0.5)' }}>
                      <Typography sx={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'rgba(255,255,255,0.95)' }}>
                        {answers[i].answer}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.85rem', opacity: 0.75 }}>{t('No answer available.')}</Typography>
                  )}
                </Box>
              </Collapse>
            )}

            {i < visibleQuestions.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />}
          </Box>
        ))
      ) : (
        <Typography sx={{ opacity: 0.8 }}>{t('Not enough data to generate questions.')}</Typography>
      )}

      {!isPro && hiddenCount > 0 && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<WorkspacePremiumIcon />}
            onClick={onWantMore}
            sx={{ borderColor: 'rgba(255,255,255,0.6)', color: COLORS.onAccent, borderRadius: '10px', textTransform: 'none', fontWeight: 'bold', '&:hover': { borderColor: COLORS.borderLight, bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            {t('Want more?')} (+{hiddenCount} {t('questions')})
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default InterviewQuestionsCard;
