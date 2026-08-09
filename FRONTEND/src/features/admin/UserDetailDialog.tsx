import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  TextField,
  Link,
  Stack,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, TYPOGRAPHY } from "../../theme/tokens";
import { ADMIN_ENDPOINTS } from "../../constants/endpoints";
import { displayName } from "../../utils/displayName";
import { useFeedback } from "../../context/FeedbackContext";

const TIER_LIMITS: Record<string, number> = { basic: 20, pass: 150, pro: 500, ultra: 1500 };

interface Props {
  userId: string;
  onClose: () => void;
  onChanged: () => void;
}

interface CvItem {
  id: string;
  isPrimary: boolean;
  cloudinaryUrl: string | null;
  personalInfo: any;
  updatedAt: string;
}
interface PaymentItem {
  id: string;
  status: string;
  amountSnapshot: string;
  currency: string;
  referenceNumber: string | null;
  screenshotUrl: string | null;
  createdAt: string;
  plan: { displayName: string };
}
interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  planTier: string;
  banned: boolean;
  bannedReason: string | null;
  lastIp: string | null;
  credits: number;
  bonusCredits: number;
  proExpiresAt: string | null;
  createdAt: string;
  cvs: CvItem[];
  paymentRequests: PaymentItem[];
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-all" }}>
      {value}
    </Typography>
  </Box>
);

const UserDetailDialog = ({ userId, onClose, onChanged }: Props) => {
  const { t } = useTranslation();
  const { notify } = useFeedback();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [planTier, setPlanTier] = useState("basic");
  const [grant, setGrant] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(ADMIN_ENDPOINTS.user(userId), {
        withCredentials: true,
      });
      setUser(data.user);
      setPlanTier(data.user.planTier);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const act = async (fn: () => Promise<any>) => {
    setBusy(true);
    try {
      await fn();
      await fetchUser();
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const banUser = () =>
    act(() =>
      axios.patch(
        ADMIN_ENDPOINTS.banUser(userId),
        { reason: "Banned by admin" },
        { withCredentials: true }
      )
    );
  const unbanUser = () =>
    act(() => axios.patch(ADMIN_ENDPOINTS.unbanUser(userId), {}, { withCredentials: true }));
  const revokePro = () =>
    act(() => axios.patch(ADMIN_ENDPOINTS.revokePro(userId), {}, { withCredentials: true }));
  const banIp = () => {
    if (!user?.lastIp) return;
    act(() =>
      axios.post(
        ADMIN_ENDPOINTS.bannedIps,
        { ip: user.lastIp, reason: `Linked to ${user.email}` },
        { withCredentials: true }
      )
    );
  };
  const applyPlan = () =>
    act(() =>
      axios.patch(ADMIN_ENDPOINTS.setPlan(userId), { planTier }, { withCredentials: true })
    );
  const applyGrant = () => {
    const amount = parseInt(grant, 10);
    if (!amount) return;
    act(async () => {
      await axios.patch(
        ADMIN_ENDPOINTS.grantAnalyses(userId),
        { amount },
        { withCredentials: true }
      );
      setGrant("");
    });
  };

  const deleteUser = async () => {
    setBusy(true);
    try {
      await axios.delete(ADMIN_ENDPOINTS.user(userId), { withCredentials: true });
      notify(t("User account deleted."), "success");
      onChanged();
      onClose();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;
      notify(message || t("Could not delete the user account."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
    <Dialog open onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: RADIUS.xl } }}>
      <DialogTitle sx={{ fontFamily: TYPOGRAPHY.fontSerif }}>
        {user ? displayName(user.firstName, user.lastName) : t('User')}
      </DialogTitle>
      <DialogContent dividers>
        {loading || !user ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {user.banned && (
              <Chip
                label={`${t('Banned')} — ${user.bannedReason ?? t('no reason')}`}
                sx={{ bgcolor: COLORS.dangerSoft, color: COLORS.danger, fontWeight: 600, alignSelf: "flex-start" }}
              />
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 2 }}>
              <Field label={t('Email')} value={user.email} />
              <Field label={t('Role')} value={user.role} />
              <Field label={t('Plan tier')} value={user.planTier} />
              <Field
                label={t('Pro expires')}
                value={user.proExpiresAt ? new Date(user.proExpiresAt).toLocaleDateString() : "—"}
              />
              <Field label={t('Credits')} value={user.credits} />
              <Field label={t('Bonus credits')} value={user.bonusCredits} />
              <Field label={t('Joined')} value={new Date(user.createdAt).toLocaleDateString()} />
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                {t('Uploaded CVs')} ({user.cvs.length})
              </Typography>
              {user.cvs.length === 0 ? (
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  {t('No CVs.')}
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {user.cvs.map((cv) => (
                    <Box key={cv.id} sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Typography variant="body2">
                        {cv.personalInfo?.firstName || "CV"} {cv.personalInfo?.lastName || ""}
                        {cv.isPrimary ? " (primary)" : ""} —{" "}
                        {new Date(cv.updatedAt).toLocaleDateString()}
                      </Typography>
                      {cv.cloudinaryUrl && (
                        <Link href={cv.cloudinaryUrl} target="_blank" rel="noopener" sx={{ fontSize: TYPOGRAPHY.sizeSm }}>
                          {t('file')}
                        </Link>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                {t('Payment requests')} ({user.paymentRequests.length})
              </Typography>
              {user.paymentRequests.length === 0 ? (
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  {t('No payments.')}
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {user.paymentRequests.map((p) => (
                    <Box key={p.id} sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                      <Chip
                        label={p.status}
                        size="small"
                        sx={{
                          bgcolor:
                            p.status === "APPROVED" ? COLORS.successSoft : p.status === "REJECTED" ? COLORS.dangerSoft : COLORS.bgLight,
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="body2">
                        {p.plan.displayName} — {p.amountSnapshot} {p.currency} —{" "}
                        {new Date(p.createdAt).toLocaleDateString()}
                      </Typography>
                      {p.screenshotUrl && (
                        <Link href={p.screenshotUrl} target="_blank" rel="noopener" sx={{ fontSize: TYPOGRAPHY.sizeSm }}>
                          {t('receipt')}
                        </Link>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Divider />

            {user.role !== "admin" && (
              <>
                <Box>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('Plan & limits')}</Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {t('Tier limit:')} {TIER_LIMITS[user.planTier] ?? "?"} {t('credits/month')}
                    {user.bonusCredits ? ` + ${user.bonusCredits} ${t('bonus')}` : ""}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1, flexWrap: "wrap" }}>
                    <Select size="small" value={planTier} onChange={(e) => setPlanTier(e.target.value)} sx={{ minWidth: 120 }}>
                      <MenuItem value="basic">basic ({TIER_LIMITS.basic})</MenuItem>
                      <MenuItem value="pro">pro ({TIER_LIMITS.pro})</MenuItem>
                      <MenuItem value="ultra">ultra ({TIER_LIMITS.ultra})</MenuItem>
                    </Select>
                    <Button variant="outlined" onClick={applyPlan} disabled={busy || planTier === user.planTier}>
                      {t('Set plan')}
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      placeholder={t('+ credits (e.g. 500)')}
                      value={grant}
                      onChange={(e) => setGrant(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <Button variant="outlined" onClick={applyGrant} disabled={busy || !parseInt(grant, 10)}>
                      {t('Grant')}
                    </Button>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>{t('IP address')}</Typography>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", flex: 1 }}>
                      {user.lastIp ?? t('Unknown — not seen since IP tracking was added')}
                    </Typography>
                    <Button variant="outlined" onClick={banIp} disabled={busy || !user.lastIp} sx={{ color: COLORS.danger, borderColor: COLORS.danger }}>
                      {t('Ban this IP')}
                    </Button>
                  </Box>
                </Box>
              </>
            )}

            {user.role === "admin" && (
              <Chip
                label={t('Admin account — unrestricted, no plan or usage limit')}
                sx={{ bgcolor: COLORS.warningSoft, color: COLORS.accentOrange, fontWeight: 600, alignSelf: "flex-start" }}
              />
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1, flexWrap: "wrap" }}>
        {user?.role === "pro user" && (
          <Button onClick={revokePro} disabled={busy} sx={{ color: COLORS.textSecondary }}>
            {t('Revoke Pro')}
          </Button>
        )}
        {user && user.role !== "admin" && (
          <Button
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
            startIcon={<DeleteForeverRoundedIcon />}
            sx={{ color: COLORS.danger, mr: "auto" }}
          >
            {t("Delete account")}
          </Button>
        )}
        {user && user.role !== "admin" && (
          user.banned ? (
            <Button variant="contained" onClick={unbanUser} disabled={busy} sx={{ bgcolor: COLORS.primarySurface }}>
              {t('Unban User')}
            </Button>
          ) : (
            <Button variant="contained" onClick={banUser} disabled={busy} sx={{ bgcolor: COLORS.danger, "&:hover": { bgcolor: COLORS.dangerDark } }}>
              {t('Ban User')}
            </Button>
          )
        )}
        <Button onClick={onClose} disabled={busy}>
          {t('Close')}
        </Button>
      </DialogActions>
    </Dialog>
    <Dialog
      open={confirmDelete}
      onClose={() => !busy && setConfirmDelete(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{t("Delete user account?")}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary">
          {t("This permanently deletes the account and its data. The user must create a new account to return.")}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setConfirmDelete(false)} disabled={busy}>
          {t("Cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={deleteUser}
          disabled={busy}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverRoundedIcon />}
        >
          {t("Delete permanently")}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default UserDetailDialog;
