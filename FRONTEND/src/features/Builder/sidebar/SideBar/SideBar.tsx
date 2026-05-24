import { Box } from '@mui/material';
import TemplatesSection from '../TemplatesSection';
import PastCVsSection from '../PastCVsSection';
import sideBar from './sideBar.tokens';

function SideBar() {
  return (
    <Box sx={sideBar.root}>
      <Box>
        <TemplatesSection />
      </Box>
      <Box>
        <PastCVsSection />
      </Box>
    </Box>
  );
}

export default SideBar;
