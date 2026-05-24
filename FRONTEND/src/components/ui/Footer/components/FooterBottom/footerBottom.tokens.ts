import { COLORS } from '../../../../../theme/tokens';

const footerBottom = {
  divider: { mt: 8, mb: 3, borderColor: COLORS.primaryAlpha20 },
  row: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' } as const,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },
  copyright: { mx: 'auto', color: '#4d7a62', fontSize: '0.82rem' },
} as const;

export default footerBottom;
