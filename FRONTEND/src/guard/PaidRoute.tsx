import { Box, CircularProgress } from "@mui/material";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useFeedback } from "../context/FeedbackContext";
import { hasPaidAccess } from "../utils/proAccess";

const PaidRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { showEntitlement } = useFeedback();
  const allowed = hasPaidAccess(user);

  useEffect(() => {
    if (!loading && !allowed) showEntitlement("PRO_REQUIRED");
  }, [allowed, loading, showEntitlement]);

  if (loading) {
    return (
      <Box minHeight="40vh" display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return allowed ? <>{children}</> : null;
};

export default PaidRoute;
