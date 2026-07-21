import { COLORS, TYPOGRAPHY, RADIUS } from '../../../theme/tokens';

const cvAnalysisDashboard = {
  root: {
    animation: 'fadeIn 0.6s',
    display: 'flex',
    flexDirection: 'column',
  },
  scoreCard: {
    p: 4,
    mb: 4,
    borderRadius: '24px',
    border: `1px solid ${COLORS.borderLight}`,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: { xs: 'center', md: 'flex-start' },
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    py: 12,
  },
  loadingTitle: {
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    mb: 1,
  },
  loadingSubtitle: {
    color: COLORS.textSecondary,
  },
  feedbackCard: {
    p: 4,
    borderRadius: '24px',
    border: `1px solid ${COLORS.borderLight}`,
    height: '100%',
  },
  feedbackTitle: {
    fontWeight: 'bold',
    mb: 3,
    fontFamily: TYPOGRAPHY.fontSerif,
  },
  positiveFeedbackLabel: {
    fontWeight: 'bold',
    color: COLORS.primary,
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  negativeFeedbackLabel: {
    fontWeight: 'bold',
    color: '#b71c1c',
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  neutralFeedbackLabel: {
    fontWeight: 'bold',
    color: '#c25b1a',
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  positiveFeedbackItem: {
    p: 2,
    mb: 1.5,
    bgcolor: `${COLORS.primaryAlpha12}`,
    borderLeft: `4px solid ${COLORS.primary}`,
    borderRadius: '4px 8px 8px 4px',
  },
  interviewCard: {
    p: 4,
    borderRadius: '24px',
    border: `1px solid ${COLORS.borderLight}`,
    backgroundColor: COLORS.primary,
    color: 'white',
  },
  interviewTitle: {
    fontWeight: 'bold',
    mb: 3,
    fontFamily: TYPOGRAPHY.fontSerif,
    color: 'white',
  },
} as const;

export default cvAnalysisDashboard;
