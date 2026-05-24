import { Box } from '@mui/material';
import { ReactNode } from 'react';

const SCREENSHOTS = [
  '/Screenshot 2026-04-16 012433.png',
  '/Screenshot 2026-04-16 012457.png',
  '/Screenshot 2026-04-16 012517.png',
];

export const STEP_ILLUSTRATIONS: ReactNode[] = SCREENSHOTS.map((src, i) => (
  <Box key={i} sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
    <Box
      component="img"
      src={src}
      alt={`Step ${i + 1}`}
      sx={{ width: '100%', display: 'block', objectFit: 'cover', objectPosition: 'top' }}
    />
  </Box>
));
