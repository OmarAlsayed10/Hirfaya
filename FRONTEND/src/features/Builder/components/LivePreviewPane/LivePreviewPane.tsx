import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { DragEvent, MouseEvent as ReactMouseEvent } from 'react';
import { Box, IconButton, InputAdornment, Paper, Popover, TextField, Tooltip, ButtonGroup, Typography } from '@mui/material';
import { ZoomIn, ZoomOut, Maximize, Minimize, ArrowLeft, ArrowRight } from "../../../../components/icons/MuiIcons";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Preview from '../../Preview';
import type { RootState } from '../../../../redux/store/store';
import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  moveCvSection,
  setFontScale,
  setPageCount,
} from '../../../../redux/store/slices/cvBuilderSlice';
import type { CvSection } from '../../../../redux/store/slices/cvBuilderSlice';
import { useTemplate } from '../../../../hooks/useTemplate';
import livePreviewPane from './livePreviewPane.tokens';
import { cvSectionFrom, pageCountFrom, shouldApplyPageCount } from './previewEditing';
import { applyPageBreaks } from './pageBreaks';
import { COLORS } from "../../../../theme/tokens";

const DESIGN_WIDTH = 794;
const DESIGN_HEIGHT = 1123;
const PAGE_PADDING = 48;
const FONT_SIZE_STEP = 0.5;
// Long enough that crossing an edge on the way elsewhere does not turn the page.
const PAGE_TURN_DELAY = 700;
const PAGE_TURN_EDGE = 56;

const primaryFontFamily = (fontFamily: string) =>
  fontFamily.split(',')[0].replace(/["']/g, '').trim();

export const LivePreviewPane = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sectionOrder = useSelector((state: RootState) => state.cvBuilder.sectionOrder);
  const formData = useSelector((state: RootState) => state.cvBuilder.formData);
  const pageCount = useSelector((state: RootState) => state.cvBuilder.pageCount);
  const fontScale = useSelector((state: RootState) => state.cvBuilder.fontScale);
  const { choosenTemp } = useTemplate();
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.7);
  const [zoomMode, setZoomMode] = useState<'width' | 'page' | 'custom'>('custom');
  const [customZoom, setCustomZoom] = useState(0.7);
  const [draggedSection, setDraggedSection] = useState<CvSection | null>(null);
  const [dropTarget, setDropTarget] = useState<CvSection | null>(null);
  const [fontProbe, setFontProbe] = useState<{ anchor: HTMLElement; family: string; size: number } | null>(null);
  const [sizeDraft, setSizeDraft] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [pageTurnHint, setPageTurnHint] = useState<-1 | 0 | 1>(0);
  const pageTurnRef = useRef<{ timer: number | null; direction: number }>({ timer: null, direction: 0 });
  const latchedPageCountRef = useRef(1);
  const contentChangedRef = useRef(true);

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

  // Shrinking the CV can delete the page you were looking at.
  useEffect(() => {
    setActivePage((page) => Math.min(page, pageCount));
  }, [pageCount]);

  useEffect(() => () => {
    if (pageTurnRef.current.timer !== null) window.clearTimeout(pageTurnRef.current.timer);
  }, []);

  // Recount from scratch whenever the CV content, template or font size changes.
  useEffect(() => {
    contentChangedRef.current = true;
    latchedPageCountRef.current = 1;
  }, [formData, choosenTemp, sectionOrder, fontScale]);

  // The real page count is what the chosen template actually renders, not the page
  // count of whatever file the CV was imported from.
  useEffect(() => {
    const page = outerRef.current?.querySelector<HTMLElement>('[data-cv-page]');
    const content = page?.firstElementChild as HTMLElement | null;
    if (!content) return;

    const measure = (allowShrink = false) => {
      // Zero height means the pane is hidden (mobile form view) — nothing to measure.
      if (!content.scrollHeight) return;
      applyPageBreaks(page, content, DESIGN_HEIGHT, PAGE_PADDING, fontScale);
      const next = pageCountFrom(content.scrollHeight, DESIGN_HEIGHT);
      if (!shouldApplyPageCount(next, latchedPageCountRef.current, allowShrink)) return;
      latchedPageCountRef.current = next;
      dispatch(setPageCount(next));
    };

    // Shrinking is only safe on the run that follows a content change. Allowing it on the
    // reruns that a page-count change itself triggers is what would ping-pong 1 ↔ 2 forever.
    const allowShrink = contentChangedRef.current;
    contentChangedRef.current = false;

    const observer = new ResizeObserver(() => measure());
    observer.observe(content);
    measure(allowShrink);
    void document.fonts?.ready.then(() => measure(allowShrink));
    return () => observer.disconnect();
  }, [formData, choosenTemp, sectionOrder, fontScale, pageCount, dispatch]);

  const handleZoomIn = () => {
    setZoomMode('custom');
    setCustomZoom((z) => Math.min(2.0, z + 0.1));
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    setCustomZoom((z) => Math.max(0.3, z - 0.1));
  };

  // The probed size is stored unscaled, so the popover keeps showing the size of the very
  // paragraph that was clicked while the user steps the scale up and down.
  const probeFontStyle = (event: ReactMouseEvent<HTMLDivElement>) => {
    const clicked = event.target instanceof HTMLElement
      ? event.target.closest<HTMLElement>('[data-cv-section] p, [data-cv-section] li, [data-cv-section] span')
      : null;
    if (!clicked) return;
    const style = window.getComputedStyle(clicked);
    setFontProbe({
      anchor: clicked,
      family: primaryFontFamily(style.fontFamily),
      size: parseFloat(style.fontSize) / fontScale,
    });
  };

  const probeSize = fontProbe ? fontProbe.size * fontScale : 0;

  // The user edits the size of the paragraph they clicked; the scale that produces it is
  // what actually gets stored, so every other size in the CV moves with it.
  const applyProbeSize = (px: number) => {
    if (!fontProbe || !Number.isFinite(px) || px <= 0) return;
    dispatch(setFontScale(px / fontProbe.size));
  };

  // A rejected or clamped edit has to snap the field back to what the CV actually renders.
  const commitSizeDraft = () => {
    applyProbeSize(parseFloat(sizeDraft));
    setSizeDraft(probeSize.toFixed(1));
  };

  useEffect(() => {
    if (fontProbe) setSizeDraft(probeSize.toFixed(1));
  }, [fontProbe, probeSize]);

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

  // A section on page 2 could never be dropped onto page 1: the other page is clipped out of
  // view, so there was nothing to aim at. Holding the drag over an edge turns the page, and the
  // dwell means brushing past an edge on the way somewhere else does not flip it.
  const cancelPageTurn = () => {
    if (pageTurnRef.current.timer !== null) window.clearTimeout(pageTurnRef.current.timer);
    pageTurnRef.current = { timer: null, direction: 0 };
    setPageTurnHint(0);
  };

  const schedulePageTurn = (direction: -1 | 1) => {
    const target = activePage + direction;
    if (target < 1 || target > pageCount) return;
    if (pageTurnRef.current.direction === direction) return;

    cancelPageTurn();
    setPageTurnHint(direction);
    pageTurnRef.current = {
      direction,
      timer: window.setTimeout(() => {
        setActivePage((page) => Math.min(pageCount, Math.max(1, page + direction)));
        pageTurnRef.current = { timer: null, direction: 0 };
        setPageTurnHint(0);
      }, PAGE_TURN_DELAY),
    };
  };

  const trackPageTurnEdge = (event: DragEvent<HTMLDivElement>) => {
    const page = outerRef.current?.querySelector<HTMLElement>('[data-cv-page]');
    if (!page || pageCount < 2) return;
    const bounds = page.getBoundingClientRect();
    if (event.clientY < bounds.top + PAGE_TURN_EDGE) schedulePageTurn(-1);
    else if (event.clientY > bounds.bottom - PAGE_TURN_EDGE) schedulePageTurn(1);
    else cancelPageTurn();
  };

  const previewSectionDrag = (event: DragEvent<HTMLDivElement>) => {
    if (draggedSection) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      trackPageTurnEdge(event);
    }

    const sectionElement = closestPreviewElement(event.target, '[data-cv-section]');
    const section = cvSectionFrom(sectionElement?.dataset.cvSection, sectionOrder);
    if (!section) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const nextTarget = section === draggedSection ? null : section;
    setDropTarget((currentTarget) => currentTarget === nextTarget ? currentTarget : nextTarget);
  };

  const finishSectionDrag = () => {
    cancelPageTurn();
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
      <Paper elevation={0} sx={{ position: 'absolute', left: 16, bottom: 20, zIndex: 10, px: 1.25, py: 0.75, borderRadius: 2, bgcolor: COLORS.bgWhite, border: `1px solid ${COLORS.borderLight}` }}>
        <Typography sx={{ fontSize: 11, color: COLORS.textSecondary, fontWeight: 600 }}>
          {pageCount > 1 && draggedSection
            ? t('Hold at the top or bottom edge to change page.')
            : t('Drag section headings to reorder.')}
        </Typography>
      </Paper>

      {pageTurnHint !== 0 && (
        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            ...(pageTurnHint === -1 ? { top: 12 } : { bottom: 70 }),
            zIndex: 12,
            px: 1.5,
            py: 0.5,
            borderRadius: 20,
            bgcolor: COLORS.primarySurface,
            color: COLORS.onAccent,
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{ fontSize: 11, fontWeight: 700 }}>
            {t('Page')} {activePage + pageTurnHint}…
          </Typography>
        </Paper>
      )}
      <Box sx={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10,
        backgroundColor: COLORS.bgWhite,
        backdropFilter: 'blur(8px)',
        borderRadius: '30px',
        border: `1px solid ${COLORS.borderLight}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        p: '4px'
      }}>
        <ButtonGroup variant="text" size="small">
          {pageCount > 1 && (
            <>
              <Tooltip title={t('Previous Page')}>
                <span>
                  <IconButton
                    onClick={() => setActivePage((page) => Math.max(1, page - 1))}
                    disabled={activePage === 1}
                    size="small"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    <ArrowLeft size={16} />
                  </IconButton>
                </span>
              </Tooltip>

              <Box sx={{ px: 1, fontSize: '0.75rem', fontWeight: 'bold', color: COLORS.textPrimary, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                {t('Page')} {activePage}/{pageCount}
              </Box>

              <Tooltip title={t('Next Page')}>
                <span>
                  <IconButton
                    onClick={() => setActivePage((page) => Math.min(pageCount, page + 1))}
                    disabled={activePage === pageCount}
                    size="small"
                    sx={{ color: COLORS.textSecondary, borderRight: `1px solid ${COLORS.borderLight}` }}
                  >
                    <ArrowRight size={16} />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}

          <Tooltip title={t('Zoom Out')}>
            <IconButton onClick={handleZoomOut} size="small" sx={{ color: COLORS.textSecondary }}>
              <ZoomOut size={16} />
            </IconButton>
          </Tooltip>

          <Box sx={{ px: 1, fontSize: '0.75rem', fontWeight: 'bold', color: COLORS.textPrimary, minWidth: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Math.round(scale * 100)}%
          </Box>

          <Tooltip title={t('Zoom In')}>
            <IconButton onClick={handleZoomIn} size="small" sx={{ color: COLORS.textSecondary }}>
              <ZoomIn size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title={zoomMode === 'width' ? t('Fit Entire Page') : t('Fit Width')}>
            <IconButton
              onClick={() => setZoomMode(zoomMode === 'width' ? 'page' : 'width')}
              size="small"
              sx={{ color: COLORS.textSecondary, borderLeft: `1px solid ${COLORS.borderLight}` }}
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
          onClick={probeFontStyle}
          sx={{
            '& [data-cv-page] > * > *': { zoom: fontScale },
            '& [data-cv-section] p, & [data-cv-section] li': { cursor: 'text' },
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
                  bgcolor: COLORS.primarySurface,
                  color: COLORS.onAccent,
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
          <Preview activePage={activePage} />
        </Box>
      </Box>

      <Popover
        open={Boolean(fontProbe)}
        anchorEl={fontProbe?.anchor ?? null}
        onClose={() => setFontProbe(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 1.5, borderRadius: 2, border: `1px solid ${COLORS.borderLight}` } } }}
      >
        {fontProbe && (
          <Box sx={{ minWidth: 230 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              {fontProbe.family}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => applyProbeSize(probeSize - FONT_SIZE_STEP)}
                disabled={fontScale <= FONT_SCALE_MIN}
                aria-label={t('Smaller text')}
              >
                <ZoomOut size={16} />
              </IconButton>
              <TextField
                size="small"
                value={sizeDraft}
                onChange={(event) => setSizeDraft(event.target.value)}
                onBlur={commitSizeDraft}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') commitSizeDraft();
                }}
                inputProps={{
                  inputMode: 'decimal',
                  'aria-label': t('Font size'),
                  style: { textAlign: 'center', fontWeight: 700, padding: '6px 4px' },
                }}
                InputProps={{ endAdornment: <InputAdornment position="end" sx={{ ml: 0 }}>px</InputAdornment> }}
                sx={{ flex: 1 }}
              />
              <IconButton
                size="small"
                onClick={() => applyProbeSize(probeSize + FONT_SIZE_STEP)}
                disabled={fontScale >= FONT_SCALE_MAX}
                aria-label={t('Larger text')}
              >
                <ZoomIn size={16} />
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: 11, color: COLORS.textSecondary, mt: 1 }}>
              {(fontProbe.size * FONT_SCALE_MIN).toFixed(1)}–{(fontProbe.size * FONT_SCALE_MAX).toFixed(1)} px · {t('Pages')}: {pageCount}
            </Typography>
            <Typography sx={{ fontSize: 11, color: COLORS.textSecondary }}>
              {t('Applies to the whole CV')} — {Math.round(fontScale * 100)}%
            </Typography>
          </Box>
        )}
      </Popover>
    </Box>
  );
};
