import { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Sparkles } from "../../../../components/icons/MuiIcons";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useAuth } from '../../../../hooks/useAuth';
import { AI_ENDPOINTS } from '../../../../constants/endpoints';
import type { RootState } from '../../../../redux/store/store';
import { isProUser } from '../../../../utils/proAccess';

type Section = 'summary' | 'experience' | 'skills' | 'education';

const GENERATE_LABEL: Record<Section, string> = {
  summary: 'Professional Summary',
  experience: 'Work Experience',
  skills: 'Skills',
  education: 'Education',
};

interface AIFieldButtonProps {
  section: Section;
  raw?: string;
  jobTitle?: string;
  onResult: (text: string) => void;
}

const AIFieldButton = ({ section, raw = '', jobTitle = '', onResult }: AIFieldButtonProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPro = isProUser(user);
  const formData = useSelector((state: RootState) => state.cvBuilder.formData);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!isPro) {
      navigate('/pricing');
      return;
    }
    setLoading(true);
    try {
      const hasNotes = raw.trim().length > 3;
      if (hasNotes) {
        const { data } = await axios.post(
          AI_ENDPOINTS.polishEntry,
          { sectionName: section, raw, jobTitle, formData },
          { withCredentials: true },
        );
        if (data?.polished) onResult(data.polished);
      } else {
        const role = jobTitle || (user?.title ?? 'Professional');
        const { data } = await axios.post(
          AI_ENDPOINTS.aiWritingAssist,
          { jobTitle: role, sectionName: GENERATE_LABEL[section], industry: role, experience: 'Mid Level', formData },
          { withCredentials: true },
        );
        if (data?.generatedContent) onResult(data.generatedContent);
      }
    } catch {
      // keep the user's text on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={raw.trim() ? t('Polish with AI') : t('Generate with AI')}>
      <span>
        <IconButton onClick={run} disabled={loading} size="small" sx={{ color: '#2a5c45' }}>
          {loading ? <CircularProgress size={16} sx={{ color: '#2a5c45' }} /> : <Sparkles size={18} />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default AIFieldButton;
