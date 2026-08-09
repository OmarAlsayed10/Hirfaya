import { Box, Button } from '@mui/material';
import { ArrowLeft, ArrowRight } from "../../../../components/icons/MuiIcons";
import { useTranslation } from 'react-i18next';
import Personal from '../../Edit/Personal';
import Projects from '../../Edit/Projects/Projects';
import Experience from '../../Edit/Experience';
import Education from '../../Edit/Education';
import Skills from '../../Edit/Skills';
import Certifications from '../../Edit/Certifications';
import { LanguagesSection } from '../../Edit/Skills/TextListSection';
import CustomSection from '../../Edit/CustomSection/CustomSection';
import formWorkspace from './formWorkspace.tokens';
import type { FormWorkspaceProps } from './FormWorkspace.types';
import { customSectionId } from '../../../../redux/store/slices/cvBuilderSlice';
import type { BuiltInSection } from '../../../../redux/store/slices/cvBuilderSlice';

const sectionViews: Record<BuiltInSection, typeof Personal> = {
  personal: Personal,
  projects: Projects,
  experience: Experience,
  education: Education,
  skills: Skills,
  languages: LanguagesSection,
  certifications: Certifications,
};

export const FormWorkspace = ({ activeStep, stepCount, sectionOrder, onBack, onNext, onFinish }: FormWorkspaceProps) => {
  const { t } = useTranslation();
  const section = sectionOrder[activeStep];
  const customId = section ? customSectionId(section) : null;
  const StepView = sectionViews[section as BuiltInSection] ?? Personal;
  const isLast = activeStep === stepCount - 1;
  const isFirst = activeStep === 0;

  return (
    <>
      <Box sx={formWorkspace.stepContent}>
        <Box sx={{ maxWidth: 480 }}>
          {customId ? <CustomSection sectionId={customId} /> : <StepView />}
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
