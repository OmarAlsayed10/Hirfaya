import type { MouseEvent, ReactNode } from 'react';
import type { IconActionTone } from './iconAction.tokens';

export interface IconActionProps {
  label: string;
  children: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  tone?: IconActionTone;
  active?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
}
