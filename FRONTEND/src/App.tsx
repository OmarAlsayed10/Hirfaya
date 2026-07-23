import { Box, CircularProgress, ThemeProvider } from "@mui/material";
import { Provider } from "react-redux";
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
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
import JobRadarPage from "./pages/JobRadarPage";
import CareerMatchPage from "./pages/CareerMatchPage";
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
import OnboardingWizard from "./features/Onboarding/OnboardingWizard";
import BuildTypeChooser from "./features/Create/BuildTypeChooser";
import ProseDocumentEditor from "./features/Create/ProseDocumentEditor";
import TemplatesPage from "./pages/Templates";
import HelpCenter from "./pages/HelpCenter";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import { PricingSection } from "./features/Home/index.ts";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminRoute from "./guard/AdminRoute";
import PaidRoute from "./guard/PaidRoute";
import { FeedbackProvider } from "./context/FeedbackContext";

const FeedbackRouterRoot = () => (
  <FeedbackProvider>
    <Outlet />
  </FeedbackProvider>
);

const appRoutes = [
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
      {
        path: "onboarding",
        element: (
          <ProtectedRoute>
            <OnboardingWizard />
          </ProtectedRoute>
        ),
      },
      {
        path: "create",
        element: (
          <ProtectedRoute>
            <BuildTypeChooser />
          </ProtectedRoute>
        ),
      },
      {
        path: "documents/new",
        element: (
          <ProtectedRoute>
            <ProseDocumentEditor />
          </ProtectedRoute>
        ),
      },
      { path: "auth/success", element: <GoogleAuthSuccess /> },
      { path: "grammarCheck", element: <GrammarCheck /> },
      { path: "cv-analysis", element: <CVAnalysisPage /> },
      {
        path: "career-match",
        element: (
          <ProtectedRoute>
            <CareerMatchPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "job-radar",
        element: (
          <ProtectedRoute>
            <JobRadarPage />
          </ProtectedRoute>
        ),
      },
      { path: "jobs", element: <Navigate to="/job-radar" replace /> },
      {
        path: "payment-check",
        element: (
          <ProtectedRoute>
            <ProPaymentForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "buy-credits",
        element: (
          <ProtectedRoute>
            <ProPaymentForm purchaseMode="credits" />
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
      { path: "settings", element: <Settings /> },
      { path: "templates", element: <TemplatesPage /> },
      { path: "help", element: <HelpCenter /> },
      { path: "terms", element: <TermsPage /> },
      { path: "privacy", element: <PrivacyPage /> },
    ],
  },
  { path: "register", element: <RegisterPage /> },
  { path: "login", element: <LoginPage /> },
  {
    path: "admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
];

const router = createBrowserRouter([
  {
    element: <FeedbackRouterRoot />,
    children: appRoutes,
  },
]);

function App() {
  const { i18n } = useTranslation();
  const { loading } = useAuth();

  useEffect(() => {
    const direction = i18n.language === "ar" ? "rtl" : "ltr";

    document.documentElement.lang = i18n.language;
    document.documentElement.dir = direction;
    document.body.dir = direction;
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
