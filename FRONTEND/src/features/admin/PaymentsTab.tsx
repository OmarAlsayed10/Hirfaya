import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Link,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { displayName } from "../../utils/displayName";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, TYPOGRAPHY } from "../../theme/tokens";
import { ADMIN_ENDPOINTS, PAYMENT_ENDPOINTS } from "../../constants/endpoints";

interface PaymentRow {
  id: string;
  status: string;
  amountSnapshot: string;
  currency: string;
  referenceNumber: string | null;
  screenshotUrl: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  purchaseKind: "SUBSCRIPTION" | "FIXED_TOPUP" | "CUSTOM_TOPUP";
  grantCreditsSnapshot: number;
  plan: { displayName: string } | null;
  reviewedByEmail: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

const statusColor = (s: string) =>
  s === "APPROVED"
    ? { bgcolor: COLORS.successSoft, color: COLORS.success }
    : s === "REJECTED"
    ? { bgcolor: COLORS.dangerSoft, color: COLORS.danger }
    : { bgcolor: COLORS.bgLight, color: COLORS.textPrimary };

const PaymentsTab = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(ADMIN_ENDPOINTS.payments, {
        withCredentials: true,
      });
      setRows(data.requests);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const approve = async (id: string) => {
    setBusyId(id);
    try {
      await axios.patch(PAYMENT_ENDPOINTS.adminApprove(id), {}, { withCredentials: true });
      await fetchRows();
    } finally {
      setBusyId(null);
    }
  };

  const reject = async () => {
    if (!rejectId || !reason.trim()) return;
    setBusyId(rejectId);
    try {
      await axios.patch(
        PAYMENT_ENDPOINTS.adminReject(rejectId),
        { reason: reason.trim() },
        { withCredentials: true }
      );
      setRejectId(null);
      setReason("");
      await fetchRows();
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: RADIUS.xl, border: `1px solid ${COLORS.borderLight}` }}
      >
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: COLORS.bgLight }}>
              {["User", "Plan", "Amount", "Ref #", "Receipt", "Date", "Status", "Reviewed by", "Actions"].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: TYPOGRAPHY.sizeSm }}>
                  {t(h)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover sx={{ "&:last-child td": { border: 0 } }}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {displayName(r.user.firstName, r.user.lastName)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {r.user.email}
                  </Typography>
                </TableCell>
                <TableCell>{r.plan?.displayName ?? `+${r.grantCreditsSnapshot} Credits`}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: COLORS.primary }}>
                  {r.amountSnapshot} {r.currency}
                </TableCell>
                <TableCell sx={{ fontFamily: "monospace", fontSize: TYPOGRAPHY.sizeSm }}>
                  {r.referenceNumber ?? "—"}
                </TableCell>
                <TableCell>
                  {r.screenshotUrl ? (
                    <Link href={r.screenshotUrl} target="_blank" rel="noopener" sx={{ fontSize: TYPOGRAPHY.sizeSm }}>
                      {t('View')}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell sx={{ fontSize: TYPOGRAPHY.sizeSm, color: COLORS.textSecondary }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip label={r.status} size="small" sx={{ ...statusColor(r.status), fontWeight: 600 }} />
                  {r.rejectionReason && (
                    <Typography variant="caption" sx={{ display: "block", color: COLORS.textSecondary }}>
                      {r.rejectionReason}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ fontSize: TYPOGRAPHY.sizeSm, color: COLORS.textSecondary }}>
                  {r.reviewedByEmail ? (
                    <>
                      {r.reviewedByEmail}
                      {r.reviewedAt && (
                        <Typography variant="caption" sx={{ display: "block" }}>
                          {new Date(r.reviewedAt).toLocaleString()}
                        </Typography>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {r.status === "PENDING" && (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={busyId === r.id}
                        onClick={() => approve(r.id)}
                        sx={{ bgcolor: COLORS.primarySurface, "&:hover": { bgcolor: COLORS.primarySurfaceDark } }}
                      >
                        {t('Approve')}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={busyId === r.id}
                        onClick={() => setRejectId(r.id)}
                        sx={{ color: COLORS.danger, borderColor: COLORS.danger }}
                      >
                        {t('Reject')}
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!rejectId} onClose={() => setRejectId(null)} PaperProps={{ sx: { borderRadius: RADIUS.xl } }}>
        <DialogTitle sx={{ fontFamily: TYPOGRAPHY.fontSerif }}>{t('Reject Payment')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            autoFocus
            placeholder={t('Reason (shown to the user)')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setRejectId(null)}>{t('Cancel')}</Button>
          <Button
            variant="contained"
            disabled={!reason.trim() || !!busyId}
            onClick={reject}
            sx={{ bgcolor: COLORS.danger, "&:hover": { bgcolor: COLORS.dangerDark } }}
          >
            {t('Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsTab;
