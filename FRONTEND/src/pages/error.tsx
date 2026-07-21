import {Avatar, Button, Container, Link, Typography, Box } from "@mui/material"
import DescriptionIcon from '@mui/icons-material/Description';
import { useTranslation } from 'react-i18next';
const Error = () => {
    const { t } = useTranslation();
    return (
        <Container  maxWidth="lg" sx={{display:'flex', flexDirection:'column',alignItems:'center', justifyContent:'center',minHeight:'80vh',gap:'30px'}}>
          <Avatar
        sx={{
          width: 100,
          height: 100,
          bgcolor: 'white',
          boxShadow: '0 0 20px rgba(42,92,69,0.3)'}}
      >
        <DescriptionIcon sx={{ color: '#2a5c45', fontSize: 60 }} />
      </Avatar>
        <Typography align="center" variant="h3" color="warning" sx={{fontWeight:"bold"}}><Box component="i" className="bi bi-exclamation-diamond"></Box>404</Typography>
        <Typography color="black" align="center" width="50%">{t("Oops! The page you're looking for doesn't exist.")}</Typography>
        <Link underline="none" color="black" href="/">
        <Button fullWidth sx={{ mt: 1, background: '#2a5c45', color: 'white', '&:hover': { background: '#1e4332' } }}>
            {t('Return to home')}
            </Button>
        </Link>
       
       
        </Container>
    );
}

export default Error;
