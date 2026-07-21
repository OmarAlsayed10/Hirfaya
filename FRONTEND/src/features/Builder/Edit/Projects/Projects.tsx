import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { updateSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormInput from '../../../../components/ui/FormInput';
import AIEditInput from '../../components/AIEditInput/AIEditInput';
import { useEffect, useState } from 'react';
import type { RootState } from '../../../../redux/store/store';
import { COLORS, RADIUS } from '../../../../theme/tokens';

const projectsSchema = z.object({
  projects: z.array(
    z.object({
      name: z.string().min(1, 'Project name is required'),
      technologies: z.string().optional(),
      demoUrl: z.string().optional(),
      githubUrl: z.string().optional(),
      description: z.string().optional(),
    }),
  ),
});

type ProjectsFormData = z.infer<typeof projectsSchema>;

const tokens = {
  root: {
    width: '100%',
    margin: '0 auto',
    padding: '12px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: COLORS.textDark,
    fontSize: '1.1rem',
    textAlign: 'start' as const,
  },
  addButton: {
    border: '1px dashed rgba(26,26,24,0.3)',
    borderColor: 'rgba(26,26,24,0.3)',
    color: COLORS.textPrimary,
    '&:hover': {
      borderColor: COLORS.primary,
      color: COLORS.primary,
      backgroundColor: COLORS.primaryAlpha12,
    },
    padding: '6px 12px',
    boxShadow: 'none',
  },
  entriesBox: {
    border: `1px solid ${COLORS.disabled}`,
    borderRadius: RADIUS.md,
    p: 2,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: '1rem',
    textAlign: 'start' as const,
  },
  deleteButton: { color: '#ff4444' },
  row: { display: 'flex', gap: '12px' },
  halfWidth: { flex: 1, minWidth: 0 },
  fullWidth: { flex: 1, minWidth: 0 },
  emptyText: { color: '#666', fontStyle: 'italic', textAlign: 'start' as const },
};

import { Sparkles } from '../../../../components/icons/MuiIcons';
import ProjectImportModal, { ImportedProjectData } from './ProjectImportModal';

const Projects = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const projectsData = useSelector(
    (state: RootState) => state.cvBuilder?.formData?.projects || [],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const { control, watch, setValue } = useForm<ProjectsFormData>({
    resolver: zodResolver(projectsSchema),
    defaultValues: { projects: JSON.parse(JSON.stringify(projectsData)) },
    mode: 'onChange',
  });

  const { fields, append, remove, move } = useFieldArray({ control, name: 'projects' });

  useEffect(() => {
    const subscription = watch((value) => {
      const cloned = value.projects ? JSON.parse(JSON.stringify(value.projects)) : [];
      dispatch(updateSection({ section: 'projects', data: cloned }));
    });
    return () => subscription.unsubscribe();
  }, [watch, dispatch]);

  const addProject = () => {
    append({ name: '', technologies: '', demoUrl: '', githubUrl: '', description: '' });
    setActiveIndex(fields.length);
  };

  const handleImportSuccess = (project: ImportedProjectData) => {
    append({
      name: project.name || '',
      technologies: project.technologies || '',
      demoUrl: project.demoUrl || '',
      githubUrl: project.githubUrl || '',
      description: project.description || '',
    });
    setActiveIndex(fields.length);
  };

  const removeProject = (index: number) => {
    remove(index);
    setActiveIndex((prev) => Math.max(0, Math.min(prev, fields.length - 2)));
  };

  const moveProject = (offset: number) => {
    const destination = activeIndex + offset;
    if (destination < 0 || destination >= fields.length) return;
    move(activeIndex, destination);
    setActiveIndex(destination);
  };

  return (
    <Box sx={{ ...tokens.root, maxWidth: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={tokens.sectionTitle}>
            {t('Projects')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('Add work that proves your skills.')}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<Sparkles size={18} />}
            onClick={() => setIsImportModalOpen(true)}
            sx={{
              bgcolor: COLORS.primary,
              color: '#fff',
              textTransform: 'none',
              px: 2,
              '&:hover': { bgcolor: COLORS.primaryDark },
            }}
          >
            {t('Import with AI')}
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={addProject} sx={tokens.addButton}>
            {t('Add Project')}
          </Button>
        </Stack>
      </Stack>

      <ProjectImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />

      <Box sx={tokens.entriesBox}>
        {fields.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, overflowX: 'auto', pb: 1, pt: 0.5, '::-webkit-scrollbar': { height: 6 } }}>
            {fields.map((field, index) => {
              const label = `${t('Project')} ${index + 1}`;
              return (
                <Button
                  key={field.id}
                  onClick={() => setActiveIndex(index)}
                  variant={activeIndex === index ? 'contained' : 'outlined'}
                  size="small"
                  sx={{
                    borderRadius: 20,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    px: 2,
                    py: 0.5,
                    bgcolor: activeIndex === index ? COLORS.primary : 'transparent',
                    color: activeIndex === index ? '#fff' : COLORS.textSecondary,
                    borderColor: activeIndex === index ? COLORS.primary : COLORS.borderMedium,
                    '&:hover': {
                      bgcolor: activeIndex === index ? COLORS.primaryDark : COLORS.primaryAlpha12,
                      borderColor: COLORS.primary,
                    }
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Stack>
        )}

        {fields.map((field, index) => {
          if (index !== activeIndex) return null;
          return (
            <Box key={field.id}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={tokens.itemTitle}>
                  {t('Project')} {index + 1}
                </Typography>
                <Stack direction="row" spacing={0.25}>
                  <Tooltip title={t('Move up')}>
                    <span>
                      <IconButton onClick={() => moveProject(-1)} disabled={index === 0} size="small">
                        <KeyboardArrowUpIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={t('Move down')}>
                    <span>
                      <IconButton onClick={() => moveProject(1)} disabled={index === fields.length - 1} size="small">
                        <KeyboardArrowDownIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <IconButton onClick={() => removeProject(index)} sx={tokens.deleteButton} aria-label={t('Delete project')}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Box>

              {/* Row 1: Project Name + Technologies */}
              <Box sx={tokens.row}>
                <Box sx={tokens.halfWidth}>
                  <Controller
                    name={`projects.${index}.name`}
                    control={control}
                    render={({ field: f, fieldState: { error } }) => (
                      <FormInput
                        {...f}
                        label={t('Project Name')}
                        placeholder={t('My Awesome App')}
                        error={!!error}
                        helperText={error ? t(error.message ?? '') : ''}
                        required
                      />
                    )}
                  />
                </Box>
                <Box sx={tokens.halfWidth}>
                  <Controller
                    name={`projects.${index}.technologies`}
                    control={control}
                    render={({ field: f }) => (
                      <FormInput
                        {...f}
                        label={t('Technologies Used')}
                        placeholder={t('React, Node.js, PostgreSQL')}
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Row 2: Live Demo + GitHub Repo */}
              <Box sx={tokens.row}>
                <Box sx={tokens.halfWidth}>
                  <Controller
                    name={`projects.${index}.demoUrl`}
                    control={control}
                    render={({ field: f }) => (
                      <FormInput
                        {...f}
                        label={t('Live Demo URL')}
                        placeholder="https://myapp.com"
                      />
                    )}
                  />
                </Box>
                <Box sx={tokens.halfWidth}>
                  <Controller
                    name={`projects.${index}.githubUrl`}
                    control={control}
                    render={({ field: f }) => (
                      <FormInput
                        {...f}
                        label={t('GitHub Repository')}
                        placeholder="https://github.com/..."
                      />
                    )}
                  />
                </Box>
              </Box>

              {/* Description with AI */}
              <Controller
                name={`projects.${index}.description`}
                control={control}
                render={({ field: f }) => (
                  <FormInput
                    {...f}
                    label={t('Description')}
                    labelAction={
                      <AIEditInput
                        section="projects"
                        currentContent={f.value || ''}
                        context={{
                          projectName: watch(`projects.${index}.name`),
                          technologies: watch(`projects.${index}.technologies`),
                        }}
                        onResult={(text) =>
                          setValue(`projects.${index}.description`, text, { shouldDirty: true })
                        }
                      />
                    }
                    placeholder={t(
                      'Describe the problem you solved, your role, and the impact — then hit the AI icon to polish it',
                    )}
                    multiline
                    minRows={3}
                    formatting={{
                      onValueChange: (text) => setValue(`projects.${index}.description`, text, { shouldDirty: true }),
                    }}
                  />
                )}
              />
            </Box>
          );
        })}

        {fields.length === 0 && (
          <Typography sx={tokens.emptyText}>{t('No projects added yet')}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Projects;
