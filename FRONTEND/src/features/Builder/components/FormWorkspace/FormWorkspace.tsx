import { useState } from 'react';
import { Box, Paper, Stepper, Step, StepLabel, Button, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Personal from '../../Edit/Personal';
import Experience from '../../Edit/Experience';
import Education from '../../Edit/Education';
import Skills from '../../Edit/Skills';
import TemplatesSection from '../../sidebar/TemplatesSection';
import formWorkspace from './formWorkspace.tokens';

const steps = ['Personal', 'Experience', 'Education', 'Skills'];

export const FormWorkspace = () => {
  const [activeStep, setActiveStep] = useState(0);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box sx={formWorkspace.root}>
      <TemplatesSection />

      <Paper sx={{ ...formWorkspace.stepperPaper, p: isMobile ? 2 : 4 }} elevation={0}>
        <Stepper activeStep={activeStep} alternativeLabel={!isMobile} orientation={isMobile ? 'vertical' : 'horizontal'}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{t(label)}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper elevation={0} sx={{ ...formWorkspace.contentPaper, p: isMobile ? 3 : 5 }}>
        <Box sx={formWorkspace.stepContent}>
          {activeStep === 0 && <Personal />}
          {activeStep === 1 && <Experience />}
          {activeStep === 2 && <Education />}
          {activeStep === 3 && <Skills />}
        </Box>

        <Box sx={formWorkspace.navigationRow}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            sx={formWorkspace.backButton}
          >
            {t('Back')}
          </Button>
          <Button
            disabled={activeStep === steps.length - 1}
            onClick={handleNext}
            variant="contained"
            sx={formWorkspace.nextButton}
          >
            {t('Next')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
