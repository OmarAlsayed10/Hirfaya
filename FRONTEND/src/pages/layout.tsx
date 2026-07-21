import { useEffect } from 'react';
import Navbar from "../components/ui/navbar";
import Footer from "../components/ui/Footer";
import { Outlet, useLocation } from "react-router-dom";
import ChatBot from "../features/chatBot/ChatBot";
import { Box } from "@mui/material";
import SubscriptionExpiredBanner from "../components/ui/SubscriptionExpiredBanner";

const Layout = () => {
  const { pathname } = useLocation();
  const isBuilder = pathname.startsWith("/builder");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {!isBuilder && <Navbar />}
      {!isBuilder && <SubscriptionExpiredBanner />}
      <Box
        component="main"
        sx={isBuilder ? { height: '100dvh', overflow: 'hidden' } : { minHeight: '80vh' }}
      >
        <Outlet />
      </Box>
      {!isBuilder && <ChatBot />}
      {!isBuilder && <Footer />}
    </>
  );
};

export default Layout;
