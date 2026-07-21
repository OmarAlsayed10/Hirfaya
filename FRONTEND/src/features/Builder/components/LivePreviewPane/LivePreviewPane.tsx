import { useLayoutEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { Box, IconButton, Paper, Tooltip, ButtonGroup, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, Maximize, Minimize } from "../../../../components/icons/MuiIcons";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Preview from '../../Preview';
import type { RootState } from '../../../../redux/store/store';
import { moveCvSection } from '../../../../redux/store/slices/cvBuilderSlice';
import type { CvSection } from '../../../../redux/store/slices/cvBuilderSlice';
import livePreviewPane from './livePreviewPane.tokens';
import { cvSectionFrom } from './previewEditing';

const DESIGN_WIDTH = 794;
const DESIGN_HEIGHT = 1123;

export const LivePreviewPane = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sectionOrder = useSelector((state: RootState) => state.cvBuilder.sectionOrder);
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [zoomMode, setZoomMode] = useState<'width' | 'page' | 'custom'>('custom');
  const [customZoom, setCustomZoom] = useState(0.7);
  const [draggedSection, setDraggedSection] = useState<CvSection | null>(null);
  const [dropTarget, setDropTarget] = useState<CvSection | null>(null);

  useLayoutEffect(() => {
    if (zoomMode === 'custom') {
      setScale(customZoom);
      return;
    }

    const outer = outerRef.current;
    if (!outer) return;

    const fit = () => {
      let nextScale = 0.85;
      if (zoomMode === 'width') {
        nextScale = (outer.clientWidth - 32) / DESIGN_WIDTH;
      } else if (zoomMode === 'page') {
        nextScale = Math.min(
          (outer.clientWidth - 32) / DESIGN_WIDTH,
          (outer.clientHeight - 64) / DESIGN_HEIGHT
        );
      }
      nextScale = Math.max(0.4, Math.min(nextScale, 1.5));
      if (nextScale > 0 && Number.isFinite(nextScale)) {
        setScale(nextScale);
        setCustomZoom(nextScale);
      }
    };

    const observer = new ResizeObserver(fit);
    observer.observe(outer);
    fit();
    return () => observer.disconnect();
  }, [zoomMode, customZoom]);

  const handleZoomIn = () => {
    setZoomMode('custom');
    setCustomZoom((z) => Math.min(2.0, z + 0.1));
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    setCustomZoom((z) => Math.max(0.3, z - 0.1));
  };

  const closestPreviewElement = (target: EventTarget | null, selector: string) =>
    target instanceof Element ? target.closest<HTMLElement>(selector) : null;

  const startSectionDrag = (event: DragEvent<HTMLDivElement>) => {
    if (!closestPreviewElement(event.target, '[data-cv-drag-handle]')) return;
    const sectionElement = closestPreviewElement(event.target, '[data-cv-section]');
    const section = cvSectionFrom(sectionElement?.dataset.cvSection, sectionOrder);
    if (!section) return;
    setDraggedSection(section);
    setDropTarget(null);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', section);
  };

  const previewSectionDrag = (event: DragEvent<HTMLDivElement>) => {
    const sectionElement = closestPreviewElement(event.target, '[data-cv-section]');
    const section = cvSectionFrom(sectionElement?.dataset.cvSection, sectionOrder);
    if (!section) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const nextTarget = section === draggedSection ? null : section;
    setDropTarget((currentTarget) => currentTarget === nextTarget ? currentTarget : nextTarget);
  };

  const finishSectionDrag = () => {
    setDraggedSection(null);
    setDropTarget(null);
  };

  const dropSection = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const targetElement = closestPreviewElement(event.target, '[data-cv-section]');
    const transferredSection = event.dataTransfer.getData('text/plain');
    const source = cvSectionFrom(transferredSection || draggedSection || undefined, sectionOrder);
    const target = cvSectionFrom(targetElement?.dataset.cvSection, sectionOrder);
    finishSectionDrag();
    if (!source || !target || source === target) return;
    dispatch(moveCvSection({ from: sectionOrder.indexOf(source), to: sectionOrder.indexOf(target) }));
  };

  return (
    <Box ref={outerRef} sx={{ ...livePreviewPane.root, position: 'relative', overflow: 'hidden' }}>
      <Paper elevation={0} sx={{ position: 'absolute', left: 16, bottom: 20, zIndex: 10, px: 1.25, py: 0.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,.94)', border: '1px solid rgba(0,0,0,.08)' }}>
        <Typography sx={{ fontSize: 11, color: '#59635e', fontWeight: 600 }}>
          {t('Drag section headings to reorder.')}
        </Typography>
      </Paper>
      <Box sx={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: '30px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        p: '4px'
      }}>
        <ButtonGroup variant="text" size="small">
          <Tooltip title={t('Zoom Out')}>
            <IconButton onClick={handleZoomOut} size="small" sx={{ color: '#555' }}>
              <ZoomOut size={16} />
            </IconButton>
          </Tooltip>

          <Box sx={{ px: 1, fontSize: '0.75rem', fontWeight: 'bold', color: '#333', minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Math.round(scale * 100)}%
          </Box>

          <Tooltip title={t('Zoom In')}>
            <IconButton onClick={handleZoomIn} size="small" sx={{ color: '#555' }}>
              <ZoomIn size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title={zoomMode === 'width' ? t('Fit Entire Page') : t('Fit Width')}>
            <IconButton
              onClick={() => setZoomMode(zoomMode === 'width' ? 'page' : 'width')}
              size="small"
              sx={{ color: '#555', borderLeft: '1px solid rgba(0,0,0,0.06)' }}
            >
              {zoomMode === 'width' ? <Minimize size={16} /> : <Maximize size={16} />}
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Box>

      <Box sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        py: 4,
        boxSizing: 'border-box',
      }}>
        <Box
          onDragStart={startSectionDrag}
          onDragOver={previewSectionDrag}
          onDrop={dropSection}
          onDragEnd={finishSectionDrag}
          sx={{
            '& [data-cv-drag-handle]': { cursor: 'grab', userSelect: 'none' },
            '& [data-cv-drag-handle]:active': { cursor: 'grabbing' },
            '& [data-cv-section]': {
              position: 'relative',
              transition: 'opacity 160ms ease, transform 160ms ease, box-shadow 160ms ease',
            },
            ...(draggedSection ? {
              [`& [data-cv-section="${draggedSection}"]`]: {
                opacity: 0.35,
                transform: 'scale(.985)',
              },
            } : {}),
            ...(dropTarget ? {
              [`& [data-cv-section="${dropTarget}"]`]: {
                boxShadow: '0 -4px 0 #2a5c45',
                '&::before': {
                  content: `"${t('Drop section here')}"`,
                  position: 'absolute',
                  top: '-24px',
                  left: 0,
                  zIndex: 4,
                  px: 1,
                  py: '2px',
                  borderRadius: '5px',
                  bgcolor: '#2a5c45',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '.02em',
                  pointerEvents: 'none',
                },
              },
            } : {}),
            width: DESIGN_WIDTH,
            height: DESIGN_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            mb: `${(scale - 1) * DESIGN_HEIGHT}px`
          }}
        >
          <Preview />
        </Box>
      </Box>
    </Box>
  );
};
