import { Typography, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FooterLinksProps } from './FooterLinks.types';
import footerLinks from './footerLinks.tokens';

const FooterLinks = ({ title, links }: FooterLinksProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Typography variant="overline" sx={footerLinks.title}>
        {t(title)}
      </Typography>
      <Box sx={footerLinks.linkList}>
        {links.map((link) => (
          <Link
            key={link.label}
            component={RouterLink}
            to={link.to}
            underline="none"
            sx={footerLinks.link}
          >
            {t(link.label)}
          </Link>
        ))}
      </Box>
    </>
  );
};

export default FooterLinks;
