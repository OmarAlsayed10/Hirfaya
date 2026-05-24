const templateCard = {
  card: (isSelected: boolean) => ({
    maxWidth: 200,
    border: isSelected ? 'solid #6a11cb 3px' : undefined,
  }),
  badgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    color: 'white',
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
    height: 350,
    width: 210,
  },
  title: {
    fontWeight: 'bold',
  },
} as const;

export default templateCard;
