import { useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { USER_ENDPOINTS } from '../../../../constants/endpoints';
import profileTab from './profileTab.tokens';

const ProfileTab = () => {
  const { t } = useTranslation();
  const { user, fetchingAndFrefreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const feedback = (err?: unknown, msg?: string) => {
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
    setError('');
    setSuccess('');

    if (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? t('Something went wrong'));
    } else if (msg) {
      setSuccess(t(msg));
    }

    feedbackTimeout.current = setTimeout(() => {
      setError('');
      setSuccess('');
    }, 5000);
  };

  const handleProfileSave = async () => {
    if (!firstName && !lastName) return;
    try {
      await axios.patch(
        USER_ENDPOINTS.updateProfile,
        {
          firstName: firstName || user?.firstName,
          lastName: lastName || user?.lastName,
        },
        { withCredentials: true }
      );
      setFirstName('');
      setLastName('');
      if (fetchingAndFrefreshUser) fetchingAndFrefreshUser();
      feedback(undefined, 'Profile updated successfully');
    } catch (e) {
      feedback(e);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = '';

    const formData = new FormData();
    formData.append('photo', file);

    setIsUploading(true);
    try {
      await axios.post(USER_ENDPOINTS.updateProfile + '/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      if (fetchingAndFrefreshUser) fetchingAndFrefreshUser();
      feedback(undefined, 'Photo updated successfully');
    } catch (e) {
      feedback(e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      await axios.delete(USER_ENDPOINTS.updateProfile + '/photo', {
        withCredentials: true,
      });
      if (fetchingAndFrefreshUser) fetchingAndFrefreshUser();
      feedback(undefined, 'Photo removed successfully');
    } catch (e) {
      feedback(e);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(USER_ENDPOINTS.deleteAccount, { withCredentials: true });
      if (logout) logout();
      navigate('/');
    } catch (e) {
      feedback(e);
    }
  };

  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Typography sx={profileTab.sectionTitle}>{t('Profile')}</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={profileTab.avatarWrapper}>
          <Avatar src={user?.photo || ''} sx={{ width: 56, height: 56, bgcolor: 'primary.light' }}>
            {initials}
          </Avatar>
          <Box component="label" sx={profileTab.cameraButton}>
            {isUploading ? (
              <CircularProgress size={12} />
            ) : (
              <PhotoCameraIcon color="action" sx={{ fontSize: 14 }} />
            )}
            <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
          </Box>
        </Box>
        <Box>
          <Typography fontWeight={500} fontSize={15}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {user?.email}
          </Typography>
          {user?.photo && (
            <Button
              size="small"
              startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />}
              onClick={handleDeletePhoto}
              sx={profileTab.removePhotoButton}
            >
              {t('Remove photo')}
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label={t('First name')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder={user?.firstName}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={profileTab.textField}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            label={t('Last name')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder={user?.lastName}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={profileTab.textField}
          />
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Button variant="contained" onClick={handleProfileSave} sx={profileTab.saveButton}>
          {t('Save changes')}
        </Button>
      </Box>

      <Box sx={profileTab.dangerSection}>
        <Typography fontSize={13} color="text.secondary" sx={{ mb: 1 }}>
          {t('Once you delete your account, there is no going back. Please be certain.')}
        </Typography>
        <Button
          variant="text"
          onClick={() => setDeleteDialogOpen(true)}
          sx={profileTab.deleteButton}
        >
          {t('Delete account')}
        </Button>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('Delete User Account')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              'Are you absolutely sure you want to delete your account? This action involves wiping all records, personal details, and CVs. This cannot be undone.'
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            {t('Cancel')}
          </Button>
          <Button onClick={handleDeleteAccount} variant="contained" sx={profileTab.confirmDeleteButton}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileTab;
