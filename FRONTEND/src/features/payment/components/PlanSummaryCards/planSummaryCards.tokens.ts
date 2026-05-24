import { COLORS, TYPOGRAPHY } from '../../../../theme/tokens';

const planSummaryCards = {
  root: {
    flex: 1,
    p: 4,
    backgroundColor: COLORS.primary,
    color: COLORS.bgWhite,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fontSerif,
    fontSize: TYPOGRAPHY.size2xl,
    fontWeight: 'bold',
    mb: 1,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    mb: 4,
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
  },
  featureIcon: {
    color: COLORS.bgWhite,
    fontSize: '1.2rem',
  },
} as const;

export default planSummaryCards;
