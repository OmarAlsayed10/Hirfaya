import { useEffect } from "react";
import { useFeedback } from "../../../context/FeedbackContext";
import type { ProWarningProps } from "./ProWarning.types";

const ProWarning = ({ openPaymentDialog, setOpenPaymentDialog }: ProWarningProps) => {
  const { showEntitlement } = useFeedback();

  useEffect(() => {
    if (!openPaymentDialog) return;
    showEntitlement("PRO_REQUIRED");
    setOpenPaymentDialog(false);
  }, [openPaymentDialog, setOpenPaymentDialog, showEntitlement]);

  return null;
};

export default ProWarning;