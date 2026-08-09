import { COLORS, TYPOGRAPHY, RADIUS } from '../../../../theme/tokens';

const chatWindow = {
  paper: {
    position: 'fixed',
    bottom: 10,
    right: 30,
    width: 380,
    height: 500,
    borderRadius: RADIUS.lg,
    border: `1px solid ${COLORS.borderLight}`,
    backgroundColor: COLORS.bgWhite,
    zIndex: 998,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    height: 50,
    backgroundColor: COLORS.bgWhite,
    borderBottom: `1px solid ${COLORS.borderLight}`,
    color: COLORS.textPrimary,
    px: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontSerif,
  },
  closeButton: {
    minWidth: 'auto',
    color: COLORS.textSecondary,
    p: 0,
  },
  messagesArea: {
    flexGrow: 1,
    overflowY: 'auto',
    p: 2,
    backgroundColor: COLORS.bgWhite,
  },
  userBubble: {
    p: 1.5,
    maxWidth: '75%',
    borderRadius: RADIUS.lg,
    background: COLORS.bgIconTinted,
    color: COLORS.textPrimary,
  },
  botBubble: {
    p: 1.5,
    maxWidth: '75%',
    borderRadius: RADIUS.lg,
    background: COLORS.bgLight,
    color: COLORS.textPrimary,
  },
  inputArea: {
    display: 'flex',
    flexDirection: 'column',
    px: 2,
    py: 1.5,
    backgroundColor: COLORS.bgWhite,
    borderTop: `1px solid ${COLORS.borderLight}`,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: RADIUS.sm,
      backgroundColor: COLORS.bgWhite,
    },
  },
  sendButton: {
    ml: 1,
    minWidth: 40,
    height: 40,
    backgroundColor: COLORS.primarySurface,
    color: COLORS.onAccent,
    boxShadow: 'none',
    borderRadius: RADIUS.sm,
  },
} as const;

export default chatWindow;
