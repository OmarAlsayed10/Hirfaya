import {
  Box,
  Button,
  Typography,
  Container,
  Link,
  Paper,
  TextField,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import HomeIcon from "@mui/icons-material/Home";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";
import { useAuth } from "../../../hooks/useAuth";
import { AUTH_ENDPOINTS } from "../../../constants/endpoints";
import loginPage from "./loginPage.tokens";

const LoginPage = () => {
  const { t } = useTranslation();
  const currentLang = i18n.language;
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = () => {
    window.location.href = AUTH_ENDPOINTS.google;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(t("Email and password are required."));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        AUTH_ENDPOINTS.login,
        { email: email.trim(), password },
        { withCredentials: true }
      );
      login(data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message ?? t("Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={loginPage.root}>
      <Box sx={loginPage.homeLink}>
        <Link component={RouterLink} to="/" sx={loginPage.homeLinkColor}>
          <HomeIcon sx={{ fontSize: 32 }} />
        </Link>
      </Box>

      <Paper elevation={0} sx={loginPage.paper}>
        <Typography variant="h4" sx={loginPage.title}>
          {t("Login to Your Account")}
        </Typography>

        <Button
          variant="contained"
          onClick={handleGoogleLogin}
          startIcon={currentLang === "en" ? <GoogleIcon /> : <></>}
          endIcon={currentLang === "ar" ? <GoogleIcon sx={{ mx: 1 }} /> : <></>}
          sx={loginPage.button}
        >
          {t("Login with Google")}
        </Button>

        <Divider sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{t("or")}</Divider>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: "8px" }}>
              {error}
            </Alert>
          )}
          <TextField
            label={t("Email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            fullWidth
            size="small"
            autoComplete="email"
          />
          <TextField
            label={t("Password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            fullWidth
            size="small"
            autoComplete="current-password"
          />
          <Button
            type="submit"
            variant="outlined"
            disabled={loading}
            sx={{
              ...loginPage.button,
              backgroundColor: "transparent",
              color: loginPage.button.backgroundColor,
              border: `1px solid ${loginPage.button.backgroundColor}`,
              "&:hover": {
                backgroundColor: loginPage.button.backgroundColor,
                color: loginPage.button.color,
              },
            }}
          >
            {loading ? <CircularProgress size={20} /> : t("Login")}
          </Button>
        </Box>

        <Typography sx={loginPage.helperText}>
          {t("Don't have an account?")}{" "}
          <Link component={RouterLink} to="/register" sx={loginPage.link}>
            {t("Register")}
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoginPage;
