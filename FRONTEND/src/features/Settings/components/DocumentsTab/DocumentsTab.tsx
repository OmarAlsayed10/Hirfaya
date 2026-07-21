import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, IconButton, Tooltip, Button } from '@mui/material';
import { Star, Trash2, Plus } from "../../../../components/icons/MuiIcons";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DOCUMENT_ENDPOINTS } from '../../../../constants/endpoints';

interface DocItem {
  id: string;
  type: string;
  title: string;
  content: string;
  isPrimary: boolean;
  updatedAt: string;
}

const TYPE_LABEL: Record<string, string> = {
  'cover-letter': 'Cover Letters',
  'linkedin-bio': 'LinkedIn Bios',
};

const DocumentsTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocItem[]>([]);

  const load = () => {
    axios
      .get(DOCUMENT_ENDPOINTS.list, { withCredentials: true })
      .then((r) => setDocs(Array.isArray(r.data.documents) ? r.data.documents : []))
      .catch(() => {});
  };
  useEffect(load, []);

  const makePrimary = async (doc: DocItem) => {
    setDocs((prev) =>
      prev.map((d) => (d.type === doc.type ? { ...d, isPrimary: d.id === doc.id } : d)),
    );
    try {
      await axios.patch(DOCUMENT_ENDPOINTS.setPrimary(doc.id), {}, { withCredentials: true });
    } catch {
      load();
    }
  };

  const remove = async (doc: DocItem) => {
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    try {
      await axios.delete(DOCUMENT_ENDPOINTS.delete(doc.id), { withCredentials: true });
    } catch {
      load();
    }
  };

  const byType = (type: string) => docs.filter((d) => d.type === type);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 18 }}>{t('My Documents')}</Typography>
        <Button size="small" startIcon={<Plus size={16} />} onClick={() => navigate('/create')}>
          {t('New')}
        </Button>
      </Box>

      {docs.length === 0 && (
        <Typography color="text.secondary" fontSize={14}>
          {t('No documents yet. Generate a cover letter or LinkedIn bio from your CV.')}
        </Typography>
      )}

      {Object.keys(TYPE_LABEL).map((type) =>
        byType(type).length > 0 ? (
          <Box key={type} sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', mb: 1 }}>
              {t(TYPE_LABEL[type])}
            </Typography>
            {byType(type).map((doc) => (
              <Card key={doc.id} variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize={14} fontWeight={600} noWrap>{doc.title}</Typography>
                    <Typography fontSize={12} color="text.secondary" noWrap>
                      {doc.content.slice(0, 90)}…
                    </Typography>
                  </Box>
                  <Tooltip title={doc.isPrimary ? t('Primary') : t('Set as primary')}>
                    <IconButton size="small" onClick={() => makePrimary(doc)} sx={{ color: doc.isPrimary ? 'warning.main' : 'action.disabled' }}>
                      <Star size={18} fill={doc.isPrimary ? 'currentColor' : 'none'} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('Delete')}>
                    <IconButton size="small" onClick={() => remove(doc)} sx={{ color: 'action.disabled' }}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Tooltip>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : null,
      )}
    </Box>
  );
};

export default DocumentsTab;
