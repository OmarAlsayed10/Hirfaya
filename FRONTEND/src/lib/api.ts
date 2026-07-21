import axios from "axios";

// One shared axios instance: sends the httpOnly session cookie on every request
// (no per-call withCredentials to forget) and centralizes error handling.
export const api = axios.create({ withCredentials: true });

// On an expired/invalid session, bounce to login once instead of each caller
// re-implementing 401 handling. Skip when already on an auth page.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const path = window.location.pathname;
    if (
      status === 401 &&
      !path.startsWith("/login") &&
      !path.startsWith("/auth")
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
