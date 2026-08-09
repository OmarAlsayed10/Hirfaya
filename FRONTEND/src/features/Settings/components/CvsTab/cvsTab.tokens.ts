import { TYPOGRAPHY, RADIUS } from '../../../../theme/tokens';

const cvsTab = {
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontSerif,
    fontSize: '22px',
    mb: 3,
  },
  card: {
    borderRadius: RADIUS.md,
    transition: '0.2s',
    '&:hover': { borderColor: 'primary.main' },
  },
  cardActions: {
    position: 'absolute',
    top: 4,
    insetInlineEnd: 4,
    zIndex: 3,
    display: 'flex',
    gap: 0.25,
  },
  cardPreview: {
    height: 60,
    bgcolor: 'primary.50',
    borderRadius: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 1.5,
  },
  newCvCard: {
    borderRadius: RADIUS.md,
    borderStyle: 'dashed',
    height: '100%',
    transition: '0.2s',
    '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
  },
  newCvContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    p: 2,
  },
} as const;

export default cvsTab;
