import { createContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export const AuthContext = createContext<any>(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchingAndFrefreshUser = async () => {
    try {
      const res = await axios.get("http://localhost:3001/auth/verify-token", {
        withCredentials: true,
      });

      if (res.data && res.data.user) {
        setUser(res.data.user);
        setToken(res.data.token);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      Cookies.remove("token");
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    fetchingAndFrefreshUser().finally(() => {
      setLoading(false);
    });
  }, []);

  const isAuthenticated = !!token;

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    Cookies.set("token", authToken, {
      expires: 1,
      secure: true,
      sameSite: "strict",
    });
  };

  const logout = () => {
    Cookies.remove("token");
    setUser(null);
    setToken(null);
  };

  const updateUserFromPayment = (userData: any, newToken: string) => {
    setUser((prev: any) => ({ ...prev, ...userData }));
    if (newToken) setToken(newToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
