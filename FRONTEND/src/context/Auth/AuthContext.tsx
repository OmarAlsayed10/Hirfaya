import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { AUTH_ENDPOINTS } from "../../constants/endpoints";

export const AuthContext = createContext<any>(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchingAndFrefreshUser = async () => {
    try {
      const res = await axios.get(AUTH_ENDPOINTS.verifyToken, {
        withCredentials: true,
      });

      if (res.data && res.data.user) {
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    fetchingAndFrefreshUser()
      .catch(() => undefined)
      .finally(() => {
      setLoading(false);
      });
  }, []);

  const isAuthenticated = !!user;

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserFromPayment = (userData: any) => {
    setUser((prev: any) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        loading,
        fetchingAndFrefreshUser,
        updateUserFromPayment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
