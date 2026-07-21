import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Button,
  IconButton,
  CircularProgress,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
} from "@mui/material";
import { Plus, Pencil, Trash2 } from "../../components/icons/MuiIcons";
import { useTranslation } from "react-i18next";
import { COLORS, RADIUS, TYPOGRAPHY } from "../../theme/tokens";
import { ADMIN_ENDPOINTS } from "../../constants/endpoints";

interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  published: boolean;
  createdAt: string;
}

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "General",
  published: true,
};

const BlogsTab = () => {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(ADMIN_ENDPOINTS.blogs, { withCredentials: true });
      setBlogs(data.blogs);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (b: Blog) => {
    setEditing(b);
    setForm({
      title: b.title,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: b.coverImage ?? "",
      category: b.category,
      published: b.published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setBusy(true);
    try {
      const payload = { ...form, coverImage: form.coverImage.trim() || null };
      if (editing) {
        await axios.patch(ADMIN_ENDPOINTS.blog(editing.id), payload, { withCredentials: true });
      } else {
        await axios.post(ADMIN_ENDPOINTS.blogs, payload, { withCredentials: true });
      }
      setOpen(false);
      await fetchBlogs();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setBusy(true);
    try {
      await axios.delete(ADMIN_ENDPOINTS.blog(id), { withCredentials: true });
      await fetchBlogs();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={openNew} sx={{ bgcolor: COLORS.primary }}>
          {t('New Blog')}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      ) : blogs.length === 0 ? (
        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
          {t('No blogs yet.')}
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {blogs.map((b) => (
            <Paper
              key={b.id}
              elevation={0}
              sx={{ p: 2, borderRadius: RADIUS.xl, border: `1px solid ${COLORS.borderLight}`, display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700 }}>{b.title}</Typography>
                  <Chip
                    label={b.published ? t('Published') : t('Draft')}
                    size="small"
                    sx={{ bgcolor: b.published ? "#dcfce7" : COLORS.bgLight, color: b.published ? "#16a34a" : COLORS.textSecondary, fontWeight: 600 }}
                  />
                  <Chip label={b.category} size="small" variant="outlined" />
                </Box>
                <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                  {b.excerpt || "—"}
                </Typography>
              </Box>
              <IconButton onClick={() => openEdit(b)} disabled={busy}>
                <Pencil size={16} color={COLORS.primary} />
              </IconButton>
              <IconButton onClick={() => remove(b.id)} disabled={busy}>
                <Trash2 size={16} color="#dc2626" />
              </IconButton>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: RADIUS.xl } }}>
        <DialogTitle sx={{ fontFamily: TYPOGRAPHY.fontSerif }}>
          {editing ? t('Edit Blog') : t('New Blog')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('Title')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} fullWidth />
            <TextField label={t('Category')} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} fullWidth />
            <TextField label={t('Cover image URL')} value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} fullWidth />
            <TextField label={t('Excerpt')} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} fullWidth multiline rows={2} />
            <TextField label={t('Content')} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} fullWidth multiline rows={10} />
            <FormControlLabel
              control={<Switch checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />}
              label={t('Published')}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)}>{t('Cancel')}</Button>
          <Button variant="contained" onClick={save} disabled={busy || !form.title.trim() || !form.content.trim()} sx={{ bgcolor: COLORS.primary }}>
            {busy ? <CircularProgress size={18} color="inherit" /> : t('Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BlogsTab;
