import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { AUTH_ENDPOINTS } from "../../constants/endpoints";
import { identifyUser, resetAnalytics } from "../../lib/analytics";
import syncDraftOwner from "../../redux/store/syncDraftOwner";

// Mirrors the payload of GET /auth/verify-token. `id` only comes back from the login
// and OTP responses, which is why both identifiers are optional.
export interface AuthUser {
  userId?: string;
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  planTier?: string;
  // Server-computed paid access (tier + expiry, admins always true). Never re-derive it
  // on the client — the rules live in one place, on the backend.
  isPro?: boolean;
  proExpiresAt?: string | number | null;
  photo?: string | null;
  isGoogleUser?: boolean;
  sessionStart?: number;
  phone?: string | null;
  location?: string | null;
  title?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  summary?: string | null;
  avatarColor?: string | null;
  skills?: string[];
  onboarded?: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // A `null` user means "signed out" only when the server actually answered. An
  // unreachable backend also clears it, and acting on that would look like a
  // sign-out to anything watching identity.
  const [identityKnown, setIdentityKnown] = useState(false);

  const refreshUser = async (): Promise<AuthUser | null> => {
    try {
      const res = await axios.get(AUTH_ENDPOINTS.verifyToken, {
        withCredentials: true,
      });

      if (res.data && res.data.user) {
        setUser(res.data.user);
        setIdentityKnown(true);
        if (res.data.user.userId) identifyUser(res.data.user.userId);
        return res.data.user;
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      setUser(null);
      setIdentityKnown(axios.isAxiosError(error) && !!error.response);
      return null;
    }
  };

  useEffect(() => {
    refreshUser()
      .catch(() => undefined)
      .finally(() => {
      setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && identityKnown) {
      syncDraftOwner(user?.userId ?? null);
    }
  }, [loading, identityKnown, user]);

  const isAuthenticated = !!user;

  const login = (userData: AuthUser) => {
    setUser(userData);
    setIdentityKnown(true);
  };

  const logout = () => {
    setUser(null);
    resetAnalytics();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
