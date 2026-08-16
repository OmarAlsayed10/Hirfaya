import { useState } from 'react';
import { Alert, Button, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../hooks/useAuth';

const SubscriptionExpiredBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  // An expiry date the user no longer has access under is exactly a lapsed subscription;
  // revoking clears the date, so a downgraded account never sees this.
  const isExpired =
    !user?.isPro &&
    !!user?.proExpiresAt &&
    new Date(user.proExpiresAt) < new Date();

  if (!isExpired || dismissed) return null;

  return (
    <Collapse in={!dismissed}>
      <Alert
        severity="warning"
        sx={{ borderRadius: 0, py: 0.5 }}
        action={
          <>
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={() => navigate('/payment-check')}
              sx={{ mr: 1, fontWeight: 600 }}
            >
              {t('Renew')}
            </Button>
            <IconButton size="small" onClick={() => setDismissed(true)} color="inherit">
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        }
      >
        {t('subscription.expired')}
      </Alert>
    </Collapse>
  );
};

export default SubscriptionExpiredBanner;
