import { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Plus } from "../../../../components/icons/MuiIcons";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { USER_ENDPOINTS } from '../../../../constants/endpoints';
import { SKILL_DICTIONARY } from '../../../Builder/skillDictionary';
import CountrySelect from '../../../../components/ui/CountrySelect';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import { suggestSkills } from './skillSuggestions';
import profileTab from './profileTab.tokens';
import { AppDispatch, resetStore } from '../../../../redux/store/store';

const ProfileTab = () => {
  const { t } = useTranslation();
  const { user, fetchingAndFrefreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [details, setDetails] = useState({
    title: '', location: '', phone: '', linkedin: '', github: '', portfolio: '', summary: '',
    salaryExpectation: '', salaryCurrency: 'USD', visaStatus: '', noticePeriod: '', workPreference: '', relocationOpen: false,
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const u = user as Record<string, any> | null;
    if (!u) return;
    setDetails({
      title: u.title ?? '', location: u.location ?? '', phone: u.phone ?? '',
      linkedin: u.linkedin ?? '', github: u.github ?? '', portfolio: u.portfolio ?? '',
      summary: u.summary ?? '',
      salaryExpectation: u.salaryExpectation ?? '',
      salaryCurrency: u.salaryCurrency ?? 'USD',
      visaStatus: u.visaStatus ?? '',
      noticePeriod: u.noticePeriod ?? '',
      workPreference: u.workPreference ?? '',
      relocationOpen: Boolean(u.relocationOpen),
    });
    const su = user as { skills?: string[] } | null;
    setSkills(Array.isArray(su?.skills) ? su!.skills : []);
  }, [user]);

  const addSkill = (s: string) => {
    const v = s.trim();
    if (v && !skills.some((x) => x.toLowerCase() === v.toLowerCase())) setSkills((p) => [...p, v]);
  };

  const suggestions = suggestSkills(details.title, skills);

  const setDetail = (k: keyof typeof details) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

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
    try {
      await axios.patch(
        USER_ENDPOINTS.updateProfile,
        {
          ...(firstName || lastName
            ? { firstName: firstName || user?.firstName, lastName: lastName || user?.lastName }
            : {}),
          ...details,
          skills,
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

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(USER_ENDPOINTS.deleteAccount, { withCredentials: true });
      dispatch(resetStore());
      if (logout) logout();
      navigate('/');
    } catch (e) {
      feedback(e);
    }
  };

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

      <Typography sx={{ ...profileTab.sectionTitle, fontSize: 15, mb: 1.5 }}>
        {t('Professional details')}
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" label={t('Professional title')} value={details.title} onChange={setDetail('title')} inputProps={{ maxLength: 100 }} sx={profileTab.textField} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <CountrySelect
            value={details.location}
            onChange={(v) => setDetails((d) => ({ ...d, location: v }))}
            label={t('Location')}
            placeholder={t('Country')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" label={t('Phone')} value={details.phone} onChange={setDetail('phone')} inputProps={{ maxLength: 30 }} sx={profileTab.textField} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" label="LinkedIn" value={details.linkedin} onChange={setDetail('linkedin')} inputProps={{ maxLength: 200 }} sx={profileTab.textField} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" label="GitHub" value={details.github} onChange={setDetail('github')} inputProps={{ maxLength: 200 }} sx={profileTab.textField} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField fullWidth size="small" label={t('Portfolio')} value={details.portfolio} onChange={setDetail('portfolio')} inputProps={{ maxLength: 200 }} sx={profileTab.textField} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField fullWidth size="small" multiline minRows={3} label={t('Professional summary')} value={details.summary} onChange={setDetail('summary')} inputProps={{ maxLength: 2000 }} sx={profileTab.textField} />
        </Grid>
      </Grid>

      <Typography sx={{ ...profileTab.sectionTitle, fontSize: 15, mb: 1.5 }}>
        {t('Application Defaults')}
      </Typography>
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            size="small"
            label={t('Salary expectation')}
            placeholder="e.g. 80,000 - 100,000"
            value={details.salaryExpectation}
            onChange={setDetail('salaryExpectation')}
            sx={profileTab.textField}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t('Currency')}
            value={details.salaryCurrency}
            onChange={(e) => setDetails((d) => ({ ...d, salaryCurrency: e.target.value }))}
            sx={profileTab.textField}
          >
            {['USD', 'EGP', 'EUR', 'GBP', 'AED', 'SAR'].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t('Visa / Work status')}
            value={details.visaStatus}
            onChange={(e) => setDetails((d) => ({ ...d, visaStatus: e.target.value }))}
            sx={profileTab.textField}
          >
            <MenuItem value="">{t('Not specified')}</MenuItem>
            <MenuItem value="citizen">{t('Citizen / PR')}</MenuItem>
            <MenuItem value="work_permit">{t('Work Permit / Valid Visa')}</MenuItem>
            <MenuItem value="requires_sponsorship">{t('Requires Visa Sponsorship')}</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t('Notice period')}
            value={details.noticePeriod}
            onChange={(e) => setDetails((d) => ({ ...d, noticePeriod: e.target.value }))}
            sx={profileTab.textField}
          >
            <MenuItem value="">{t('Not specified')}</MenuItem>
            <MenuItem value="immediate">{t('Immediate')}</MenuItem>
            <MenuItem value="2_weeks">{t('2 Weeks')}</MenuItem>
            <MenuItem value="1_month">{t('1 Month')}</MenuItem>
            <MenuItem value="2_months">{t('2 Months')}</MenuItem>
            <MenuItem value="3_months">{t('3 Months')}</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t('Work preference')}
            value={details.workPreference}
            onChange={(e) => setDetails((d) => ({ ...d, workPreference: e.target.value }))}
            sx={profileTab.textField}
          >
            <MenuItem value="">{t('Any')}</MenuItem>
            <MenuItem value="remote">{t('Remote')}</MenuItem>
            <MenuItem value="hybrid">{t('Hybrid')}</MenuItem>
            <MenuItem value="onsite">{t('On-site')}</MenuItem>
            <MenuItem value="flexible">{t('Flexible')}</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={details.relocationOpen}
                onChange={(e) => setDetails((d) => ({ ...d, relocationOpen: e.target.checked }))}
              />
            }
            label={t('Open to relocation')}
          />
        </Grid>
      </Grid>

      <Typography sx={{ ...profileTab.sectionTitle, fontSize: 15, mb: 0.5 }}>
        {t('Skills')}
      </Typography>
      <Typography fontSize={12.5} color="text.secondary" sx={{ mb: 1.5 }}>
        {t('Saved to your profile and reused across your CVs and cover letters.')}
      </Typography>
      <Autocomplete
        multiple
        freeSolo
        options={SKILL_DICTIONARY}
        value={skills}
        onChange={(_, v) => setSkills(v as string[])}
        renderInput={(params) => (
          <TextField {...params} size="small" placeholder={t('Add a skill and press Enter')} sx={profileTab.textField} />
        )}
      />

      {suggestions.length > 0 && (
        <Box sx={{ mt: 1.5, mb: 4 }}>
          <Typography fontSize={12.5} color="text.secondary" sx={{ mb: 1 }}>
            {t('Suggested for')} “{details.title}”
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestions.map((s) => (
              <Chip
                key={s}
                label={s}
                size="small"
                variant="outlined"
                icon={<Plus size={14} />}
                onClick={() => addSkill(s)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 4, mb: 4 }}>
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

      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('Delete User Account')}
        message={t(
          'Are you absolutely sure you want to delete your account? This action involves wiping all records, personal details, and CVs. This cannot be undone.'
        )}
        onConfirm={handleDeleteAccount}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default ProfileTab;
