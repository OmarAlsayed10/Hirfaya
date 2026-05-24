import { Box, Grid } from '@mui/material';
import FooterBrand from './components/FooterBrand';
import FooterLinks from './components/FooterLinks';
import FooterNewsletter from './components/FooterNewsletter';
import FooterBottom from './components/FooterBottom';
import { FOOTER_LINKS_DATA } from '../../../constants/footerData';
import footer from './footer.tokens';

const Footer = () => {
  return (
    <Box sx={footer.root}>
      <Box sx={footer.bgGlow} />

      <Box sx={footer.inner}>
        <Box sx={footer.grid}>
          <Grid container spacing={{ xs: 4, md: 5 }}>
            <Grid sx={{ xs: 12, md: 5 }}>
              <FooterBrand />
            </Grid>

            {Object.entries(FOOTER_LINKS_DATA).map(([title, links]) => (
              <Grid sx={{ xs: 6, sm: 4, md: 2 }} key={title}>
                <FooterLinks title={title} links={links} />
              </Grid>
            ))}

            <Grid sx={{ xs: 12, md: 12 }}>
              <FooterNewsletter />
            </Grid>
          </Grid>
        </Box>

        <FooterBottom />
      </Box>
    </Box>
  );
};

export default Footer;
