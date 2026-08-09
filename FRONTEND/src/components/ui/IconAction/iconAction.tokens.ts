import { COLORS } from '../../../theme/tokens';

const toneColors = {
  neutral: { idle: COLORS.iconIdle, active: COLORS.textPrimary },
  primary: { idle: COLORS.iconIdle, active: COLORS.primary },
  danger: { idle: COLORS.iconIdle, active: COLORS.danger },
  favorite: { idle: COLORS.iconIdle, active: COLORS.warning },
} as const;

export type IconActionTone = keyof typeof toneColors;

const iconAction = {
  button: (tone: IconActionTone, active: boolean) => ({
    color: active ? toneColors[tone].active : toneColors[tone].idle,
    transition: 'color .15s, background-color .15s',
    '&:hover': {
      color: toneColors[tone].active,
      bgcolor: COLORS.bgHover,
    },
  }),
} as const;

export default iconAction;
