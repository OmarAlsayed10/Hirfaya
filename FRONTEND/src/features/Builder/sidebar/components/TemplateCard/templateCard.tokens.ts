import { COLORS } from "../../../../../theme/tokens";

const templateCard = {
  card: (isSelected: boolean) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '14px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    transition: 'transform 0.15s, box-shadow 0.15s',
    border: isSelected ? 'solid #6a11cb 3px' : 'solid transparent 3px',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' },
  }),
  badgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    color: COLORS.onAccent,
    px: 1,
    py: 0.5,
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
  },
  proBadge: {
    background: '#6a11cb',
    px: '8px',
    py: '4px',
    mx: 2,
    mt: 0.5,
    borderRadius: '5px',
    fontWeight: 'bold',
  },
  media: {
    height: 300,
    width: '100%',
    objectFit: 'cover',
    objectPosition: 'top',
    bgcolor: COLORS.bgLight,
  },
  title: {
    fontWeight: 'bold',
  },
} as const;

export default templateCard;
