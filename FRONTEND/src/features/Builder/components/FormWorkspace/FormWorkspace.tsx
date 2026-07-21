import { Box, Button } from '@mui/material';
import { ArrowLeft, ArrowRight } from "../../../../components/icons/MuiIcons";
import { useTranslation } from 'react-i18next';
import Personal from '../../Edit/Personal';
import Projects from '../../Edit/Projects/Projects';
import Experience from '../../Edit/Experience';
import Education from '../../Edit/Education';
import Skills from '../../Edit/Skills';
import { CertificationsSection, LanguagesSection } from '../../Edit/Skills/TextListSection';
import formWorkspace from './formWorkspace.tokens';
import type { FormWorkspaceProps } from './FormWorkspace.types';
import type { CvSection } from '../../../../redux/store/slices/cvBuilderSlice';

const sectionViews: Record<CvSection, typeof Personal> = {
  personal: Personal,
  projects: Projects,
  experience: Experience,
  education: Education,
  skills: Skills,
  languages: LanguagesSection,
  certifications: CertificationsSection,
};

export const FormWorkspace = ({ activeStep, stepCount, sectionOrder, onBack, onNext, onFinish }: FormWorkspaceProps) => {
  const { t } = useTranslation();
  const StepView = sectionViews[sectionOrder[activeStep]] ?? Personal;
  const isLast = activeStep === stepCount - 1;
  const isFirst = activeStep === 0;

  return (
    <>
      <Box sx={formWorkspace.stepContent}>
        <Box sx={{ maxWidth: 480 }}>
          <StepView />
        </Box>
      </Box>
      <Box sx={{ ...formWorkspace.navigationRow, justifyContent: isFirst ? 'flex-end' : 'space-between' }}>
        {!isFirst && (
          <Button
            onClick={onBack}
            startIcon={<ArrowLeft size={18} />}
            sx={formWorkspace.backButton}
          >
            {t('Back')}
          </Button>
        )}
        <Button
          variant="contained"
          onClick={isLast ? onFinish : onNext}
          endIcon={<ArrowRight size={18} />}
          sx={formWorkspace.nextButton}
        >
          {isLast ? t('Preview') : t('Next')}
        </Button>
      </Box>
    </>
  );
};
