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
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";
import { displayName } from "../../utils/displayName";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, TYPOGRAPHY } from "../../theme/tokens";
import { ADMIN_ENDPOINTS } from "../../constants/endpoints";
import UserDetailDialog from "./UserDetailDialog";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  planTier: string;
  banned: boolean;
  credits: number;
  bonusCredits: number;
  proExpiresAt: string | null;
  createdAt: string;
  _count: { cvs: number; paymentRequests: number };
}

const UsersTab = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(ADMIN_ENDPOINTS.users, {
        withCredentials: true,
      });
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      displayName(u.firstName, u.lastName).toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder={t('Search by name or email')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: RADIUS.xl, border: `1px solid ${COLORS.borderLight}` }}
      >
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: COLORS.bgLight }}>
              {["User", "Role", "Tier", "Credits", "CVs", "Payments", "Status"].map(
                (h) => (
                  <TableCell
                    key={h}
                    sx={{ fontWeight: 700, fontSize: TYPOGRAPHY.sizeSm }}
                  >
                    {t(h)}
                  </TableCell>
                )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((u) => (
              <TableRow
                key={u.id}
                hover
                onClick={() => setSelectedId(u.id)}
                sx={{ cursor: "pointer", "&:last-child td": { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {displayName(u.firstName, u.lastName)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: COLORS.textSecondary }}>
                    {u.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.role}
                    size="small"
                    sx={{
                      bgcolor:
                        u.role === "admin"
                          ? COLORS.warningSoft
                          : u.role === "pro user"
                          ? COLORS.primaryAlpha12
                          : COLORS.bgLight,
                      color: u.role === "pro user" ? COLORS.primary : COLORS.textPrimary,
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>{u.planTier}</TableCell>
                <TableCell>
                  {u.credits}
                  {u.bonusCredits ? ` (+${u.bonusCredits})` : ""}
                </TableCell>
                <TableCell>{u._count.cvs}</TableCell>
                <TableCell>{u._count.paymentRequests}</TableCell>
                <TableCell>
                  {u.banned ? (
                    <Chip label={t('Banned')} size="small" sx={{ bgcolor: COLORS.dangerSoft, color: COLORS.danger, fontWeight: 600 }} />
                  ) : (
                    <Chip label={t('Active')} size="small" sx={{ bgcolor: COLORS.successSoft, color: COLORS.success, fontWeight: 600 }} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedId && (
        <UserDetailDialog
          userId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={fetchUsers}
        />
      )}
    </Box>
  );
};

export default UsersTab;
