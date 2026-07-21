import type { CvSection } from '../../../../redux/store/slices/cvBuilderSlice';

export interface FormWorkspaceProps {
  activeStep: number;
  stepCount: number;
  sectionOrder: CvSection[];
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}
