import { Box, CircularProgress, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Error from "./pages/error";
import store from "./redux/store/store";
import Layout from "./pages/layout";
import GetStarted from "./features/GetStart/GetStart";
import Builder from "./features/Builder/Builder";
import { theme } from "./utils/theme";
import Home from "./features/Home/Home";
import LoginPage from "./features/Auth/LoginPage";
import RegisterPage from "./features/Auth/RegisterPage";
import GoogleAuthSuccess from "./features/Auth/GoogleAuthSuccess";
import GrammarCheck from "./features/GrammarCheck/GrammarCheck";
import CVAnalysisPage from "./pages/CVAnalysisPage";
import { FileProvider } from "./context/fileContext.jsx";
import { TemplateProvider } from "./context/choosenTempContext.jsx";
import ProtectedRoute from "./guard/ProtectedRoute.jsx";
import { useAuth } from "./hooks/useAuth.js";
import "./i18n";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { PreviewProvider } from "./context/previewContext.jsx";
import ChatBot from "./features/chatBot/ChatBot";
import ProPaymentForm from "./features/payment/Payment";
import Blog from "./pages/blogs.jsx";
import BlogDetail from "./pages/blogDetails.jsx";

import PricingPage from "./pages/PricingPage.tsx";
import Settings from "./features/Settings/Settings";
import TemplatesPage from "./pages/Templates";
import HelpCenter from "./pages/HelpCenter";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import { PricingSection } from "./features/Home/index.ts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Home /> },
      {
        path: "builder",
        element: (
          <ProtectedRoute>
            <Builder />
          </ProtectedRoute>
        ),
      },
      {
        path: "getStart",
        element: (
          <ProtectedRoute>
            <GetStarted />
          </ProtectedRoute>
        ),
      },
      { path: "auth/success", element: <GoogleAuthSuccess /> },
      { path: "grammarCheck", element: <GrammarCheck /> },
      {
        path: "cv-analysis",
        element: (
          <ProtectedRoute>
            <CVAnalysisPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "payment-check",
        element: (
          <ProtectedRoute>
            <ProPaymentForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "chatbot",
        element: (
          <ProtectedRoute>
            <ChatBot />
          </ProtectedRoute>
        ),
      },
      { path: "Blogs", element: <Blog /> },
      { path: "pricing", element: <PricingPage /> },

      { path: "Blogs/:id", element: <BlogDetail /> },
      { path: "*", element: <Error /> },
      { path: "Pro-Features", element: <PricingSection /> },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      { path: "templates", element: <TemplatesPage /> },
      { path: "help", element: <HelpCenter /> },
      { path: "terms", element: <TermsPage /> },
      { path: "privacy", element: <PrivacyPage /> },
    ],
  },
  { path: "register", element: <RegisterPage /> },
  { path: "login", element: <LoginPage /> },
]);

function App() {
  const { i18n } = useTranslation();
  const { loading } = useAuth();

  useEffect(() => {
    document.body.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress sx={{ color: "#2a5c45" }} />
      </Box>
    );
  }
  return (
    <Provider store={store}>
      <PreviewProvider>
        <TemplateProvider>
          <FileProvider>
            <ThemeProvider theme={theme}>
              <RouterProvider router={router} />
            </ThemeProvider>
          </FileProvider>
        </TemplateProvider>
      </PreviewProvider>
    </Provider>
  );
}

export default App;
