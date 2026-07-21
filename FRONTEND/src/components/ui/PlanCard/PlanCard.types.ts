import { PlanTier } from '../../../constants/pricingData';

export interface PlanCardProps {
  variant: PlanTier;
  buttonLabel: string;
  onButtonClick: () => void;
  disabled?: boolean;
}
