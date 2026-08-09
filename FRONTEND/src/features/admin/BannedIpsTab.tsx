import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Trash2 } from "../../components/icons/MuiIcons";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, TYPOGRAPHY } from "../../theme/tokens";
import { ADMIN_ENDPOINTS } from "../../constants/endpoints";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import IconAction from "../../components/ui/IconAction";

interface BannedIp {
  ip: string;
  reason: string | null;
  createdAt: string;
}

const BannedIpsTab = () => {
  const { t } = useTranslation();
  const [ips, setIps] = useState<BannedIp[]>([]);
  const [loading, setLoading] = useState(false);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [unbanTarget, setUnbanTarget] = useState<string | null>(null);

  const fetchIps = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(ADMIN_ENDPOINTS.bannedIps, { withCredentials: true });
      setIps(data.ips);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIps();
  }, [fetchIps]);

  const add = async () => {
    if (!ip.trim()) return;
    setBusy(true);
    try {
      await axios.post(
        ADMIN_ENDPOINTS.bannedIps,
        { ip: ip.trim(), reason: reason.trim() || null },
        { withCredentials: true }
      );
      setIp("");
      setReason("");
      await fetchIps();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!unbanTarget) return;
    setBusy(true);
    try {
      await axios.delete(ADMIN_ENDPOINTS.unbanIp(unbanTarget), { withCredentials: true });
      await fetchIps();
      setUnbanTarget(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: RADIUS.xl, border: `1px solid ${COLORS.borderLight}` }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <TextField size="small" placeholder={t('IP address')} value={ip} onChange={(e) => setIp(e.target.value)} sx={{ flex: "1 1 180px" }} />
          <TextField size="small" placeholder={t('Reason (optional)')} value={reason} onChange={(e) => setReason(e.target.value)} sx={{ flex: "1 1 220px" }} />
          <Button variant="contained" onClick={add} disabled={busy || !ip.trim()} sx={{ bgcolor: COLORS.primarySurface }}>
            {t('Ban IP')}
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: RADIUS.xl, border: `1px solid ${COLORS.borderLight}` }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: COLORS.bgLight }}>
                {["IP", "Reason", "Banned on", ""].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: TYPOGRAPHY.sizeSm }}>
                    {h && t(h)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {ips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, py: 2 }}>
                      {t('No banned IPs.')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                ips.map((b) => (
                  <TableRow key={b.ip} sx={{ "&:last-child td": { border: 0 } }}>
                    <TableCell sx={{ fontFamily: "monospace" }}>{b.ip}</TableCell>
                    <TableCell>{b.reason ?? "—"}</TableCell>
                    <TableCell sx={{ color: COLORS.textSecondary }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconAction label={t('Unban')} tone="danger" onClick={() => setUnbanTarget(b.ip)} disabled={busy}>
                        <Trash2 size={16} />
                      </IconAction>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={Boolean(unbanTarget)}
        title={t('Unban IP')}
        message={t('This removes the ban on {{ip}}. They will be able to reach the site again.', {
          ip: unbanTarget || '',
        })}
        confirmLabel={t('Unban')}
        loading={busy}
        onConfirm={remove}
        onClose={() => setUnbanTarget(null)}
      />
    </Box>
  );
};

export default BannedIpsTab;
