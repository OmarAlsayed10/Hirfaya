import { useEffect } from 'react';
import Navbar from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import { Outlet, useLocation } from "react-router-dom";
import ChatBot from "../features/chatBot/ChatBot";
import { Box } from "@mui/material";
import SubscriptionExpiredBanner from "../components/ui/SubscriptionExpiredBanner";

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <SubscriptionExpiredBanner />
      <Box component="main" sx={{ minHeight: "80vh" }}>
        <Outlet />
      </Box>
      <ChatBot />
      <Footer />
    </>
  );
};

export default Layout;
