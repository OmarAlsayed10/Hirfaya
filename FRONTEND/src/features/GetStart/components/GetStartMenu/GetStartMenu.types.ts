import type { StepData } from '../../hooks/useGetStartSteps';

export interface GetStartMenuProps {
  steps: StepData[];
  activeStep: number;
  onStepChange: (index: number) => void;
}
