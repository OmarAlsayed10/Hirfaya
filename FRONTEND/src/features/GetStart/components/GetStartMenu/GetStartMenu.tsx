import { Box, ButtonBase, Typography } from '@mui/material';
import getStartMenu from './getStartMenu.tokens';
import type { GetStartMenuProps } from './GetStartMenu.types';

export const GetStartMenu = ({ steps, activeStep, onStepChange }: GetStartMenuProps) => {
  return (
    <Box sx={getStartMenu.root}>
      {steps.map((step, index) => {
        const isActive = activeStep === index;
        return (
          <ButtonBase
            key={index}
            onClick={() => onStepChange(index)}
            aria-pressed={isActive}
            sx={getStartMenu.item(isActive)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
              <Box sx={getStartMenu.dot(isActive)} />
            </Box>
            <Box>
              <Typography variant="h5" sx={getStartMenu.title(isActive)}>
                {step.title}
              </Typography>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
};
