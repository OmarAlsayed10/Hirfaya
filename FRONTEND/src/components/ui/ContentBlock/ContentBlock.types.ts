import { ReactNode } from 'react';

export interface ContentBlockProps {
  headline: string;
  text: string;
  icon?: ReactNode;
  iconBg?: 'tinted' | 'white';
  stepNumber?: number;
  size?: 'card' | 'section';
  textMaxWidth?: string;
}
