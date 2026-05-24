export interface PlanCardProps {
  variant: 'free' | 'pro';
  buttonLabel: string;
  onButtonClick: () => void;
  disabled?: boolean;
}
