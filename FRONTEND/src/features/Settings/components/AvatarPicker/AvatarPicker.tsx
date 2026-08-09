import { useState, useRef } from 'react';
import { Avatar, Box, Popover, Typography, Button, CircularProgress, Tooltip } from '@mui/material';
import { Camera, Trash2, Check, Pencil } from "../../../../components/icons/MuiIcons";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../hooks/useAuth';
import { USER_ENDPOINTS } from '../../../../constants/endpoints';
import { AVATAR_COLORS } from '../../../../theme/tokens';
import { COLORS } from "../../../../theme/tokens";

interface Props {
  size?: number;
  onFeedback?: (err?: unknown, msg?: string) => void;
}

const AvatarPicker = ({ size = 96, onFeedback }: Props) => {
  const { t } = useTranslation();
  const { user, fetchingAndFrefreshUser } = useAuth();
  const u = user as Record<string, string | null> | null;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = `${u?.firstName?.[0] ?? ''}${u?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
  const color = u?.avatarColor || AVATAR_COLORS[0];
  const refresh = () => fetchingAndFrefreshUser && fetchingAndFrefreshUser();

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    setUploading(true);
    try {
      await axios.post(USER_ENDPOINTS.updateProfile + '/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      refresh();
      onFeedback?.(undefined, 'Photo updated successfully');
    } catch (err) {
      onFeedback?.(err);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    try {
      await axios.delete(USER_ENDPOINTS.updateProfile + '/photo', { withCredentials: true });
      refresh();
      onFeedback?.(undefined, 'Photo removed successfully');
    } catch (err) {
      onFeedback?.(err);
    }
  };

  const pickColor = async (c: string) => {
    try {
      await axios.patch(USER_ENDPOINTS.updateProfile, { avatarColor: c }, { withCredentials: true });
      refresh();
    } catch (err) {
      onFeedback?.(err);
    }
  };

  return (
    <>
      <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <Avatar
          src={u?.photo || ''}
          sx={{ width: size, height: size, bgcolor: color, fontSize: size * 0.36, fontWeight: 600 }}
        >
          {initials}
        </Avatar>
        <Tooltip title={t('Change avatar')}>
          <Box
            component="button"
            onClick={(e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
            sx={{
              position: 'absolute', bottom: 0, right: 0, width: size * 0.3, height: size * 0.3,
              minWidth: 26, minHeight: 26, borderRadius: '50%', border: '2px solid #fff',
              bgcolor: 'primary.main', color: COLORS.onAccent, cursor: 'pointer', p: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 1, '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {uploading ? <CircularProgress size={14} sx={{ color: COLORS.onAccent }} /> : <Pencil size={16} />}
          </Box>
        </Tooltip>
      </Box>

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2.5, borderRadius: 3, width: 280 } } }}
      >
        <Typography fontSize={13} fontWeight={600} sx={{ mb: 1.5 }}>{t('Upload a photo')}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
          <Button
            fullWidth variant="outlined" size="small" startIcon={<Camera size={16} />}
            onClick={() => fileRef.current?.click()}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {t('Upload')}
          </Button>
          {u?.photo && (
            <Button
              variant="text" size="small" color="error" startIcon={<Trash2 size={16} />}
              onClick={removePhoto}
              sx={{ textTransform: 'none', borderRadius: 2, whiteSpace: 'nowrap' }}
            >
              {t('Remove')}
            </Button>
          )}
        </Box>
        <input type="file" hidden accept="image/*" ref={fileRef} onChange={uploadPhoto} />

        <Typography fontSize={13} fontWeight={600} sx={{ mb: 1.5 }}>{t('Or pick a colour')}</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.25 }}>
          {AVATAR_COLORS.map((c) => (
            <Box
              key={c}
              onClick={() => pickColor(c)}
              sx={{
                width: 46, height: 46, borderRadius: '50%', bgcolor: c, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.onAccent,
                border: color === c && !u?.photo ? '3px solid #1a1a18' : '3px solid transparent',
                transition: 'transform .12s', '&:hover': { transform: 'scale(1.08)' },
              }}
            >
              {color === c && !u?.photo && <Check size={20} />}
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default AvatarPicker;
