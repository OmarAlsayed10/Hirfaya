import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { PAYMENT_ENDPOINTS } from "../../../../constants/endpoints";

interface PaymentRecord {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  amountSnapshot: string;
  currency: string;
  purchaseKind: "SUBSCRIPTION" | "FIXED_TOPUP" | "CUSTOM_TOPUP";
  grantCreditsSnapshot: number;
  referenceNumber: string | null;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  plan: { displayName: string; durationDays: number } | null;
}

const statusColor = (status: PaymentRecord["status"]) =>
  status === "APPROVED" ? "success" : status === "REJECTED" ? "error" : "default";

const PaymentHistory = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<PaymentRecord[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    axios
      .get<{ payments: PaymentRecord[] }>(PAYMENT_ENDPOINTS.history, { withCredentials: true })
      .then((response) => setPayments(response.data.payments))
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <Typography color="text.secondary" fontSize={14}>
        {t("We couldn't load your payment history.")}
      </Typography>
    );
  }

  if (!payments) {
    return (
      <Box py={4} display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (payments.length === 0) {
    return (
      <Typography color="text.secondary" fontSize={14}>
        {t("No payments yet.")}
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {payments.map((payment) => (
        <Paper key={payment.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            gap={1}
            alignItems={{ sm: "center" }}
          >
            <Box minWidth={0}>
              <Typography fontWeight={700}>
                {payment.plan?.displayName ?? `+${payment.grantCreditsSnapshot} ${t("Credits")}`}
              </Typography>
              <Typography color="text.secondary" fontSize={13}>
                {new Date(payment.createdAt).toLocaleDateString()}
                {payment.referenceNumber ? ` · ${t("Ref")} ${payment.referenceNumber}` : ""}
              </Typography>
              {payment.status === "APPROVED" && payment.plan?.durationDays ? (
                <Typography color="text.secondary" fontSize={13}>
                  {t("Granted")} {payment.plan.durationDays} {t("days")}
                </Typography>
              ) : null}
              {payment.status === "APPROVED" && !payment.plan ? (
                <Typography color="text.secondary" fontSize={13}>
                  {t("Granted")} {payment.grantCreditsSnapshot} {t("credits")}
                </Typography>
              ) : null}
              {payment.rejectionReason && (
                <Typography color="error.main" fontSize={13}>
                  {payment.rejectionReason}
                </Typography>
              )}
            </Box>
            <Stack alignItems={{ sm: "flex-end" }} gap={0.5}>
              <Typography fontWeight={700} whiteSpace="nowrap">
                {payment.amountSnapshot} {payment.currency}
              </Typography>
              <Chip label={t(payment.status)} size="small" color={statusColor(payment.status)} />
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default PaymentHistory;
