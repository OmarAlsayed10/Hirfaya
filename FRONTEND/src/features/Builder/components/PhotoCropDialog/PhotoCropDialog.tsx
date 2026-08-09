import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../../../theme/tokens';
import {
  centeredOffset,
  clampOffset,
  displayScale,
  sourceRect,
  zoomedOffset,
  type CropOffset,
  type CropView,
} from './cropGeometry';

const VIEW_SIZE = 320;
const OUTPUT_SIZE = 512;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

interface PhotoCropDialogProps {
  src: string | null;
  saving?: boolean;
  onCancel: () => void;
  onSave: (blob: Blob) => void;
}

const PhotoCropDialog = ({ src, saving = false, onCancel, onSave }: PhotoCropDialogProps) => {
  const { t } = useTranslation();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [error, setError] = useState('');
  const dragOrigin = useRef<CropOffset | null>(null);

  useEffect(() => {
    if (!src) return;
    setImage(null);
    setError('');
    setZoom(MIN_ZOOM);

    const loaded = new Image();
    loaded.crossOrigin = 'anonymous';
    loaded.onload = () => setImage(loaded);
    loaded.onerror = () => setError(t('Could not open that image.'));
    loaded.src = src;

    return () => {
      loaded.onload = null;
      loaded.onerror = null;
    };
  }, [src, t]);

  const viewFor = (level: number): CropView => ({
    viewSize: VIEW_SIZE,
    naturalWidth: image?.naturalWidth || 1,
    naturalHeight: image?.naturalHeight || 1,
    zoom: level,
  });

  useEffect(() => {
    if (!image) return;
    setOffset(centeredOffset({
      viewSize: VIEW_SIZE,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      zoom: MIN_ZOOM,
    }));
  }, [image]);

  const changeZoom = (next: number) => {
    const level = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    if (image) setOffset((current) => zoomedOffset(viewFor(zoom), current, level));
    setZoom(level);
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    dragOrigin.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current || !image) return;
    setOffset(clampOffset(viewFor(zoom), {
      x: event.clientX - dragOrigin.current.x,
      y: event.clientY - dragOrigin.current.y,
    }));
  };

  const endDrag = () => {
    dragOrigin.current = null;
  };

  const save = () => {
    if (!image) return;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext('2d');
    if (!context) {
      setError(t('Could not save that crop.'));
      return;
    }
    const { sx, sy, size } = sourceRect(viewFor(zoom), offset);
    try {
      context.drawImage(image, sx, sy, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      canvas.toBlob(
        (blob) => (blob ? onSave(blob) : setError(t('Could not save that crop.'))),
        'image/jpeg',
        0.9,
      );
    } catch {
      setError(t('Could not save that crop.'));
    }
  };

  const scale = image ? displayScale(viewFor(zoom)) : 1;

  return (
    <Dialog open={!!src} onClose={saving ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>{t('Adjust your photo')}</DialogTitle>
      <DialogContent>
        <Box
          onPointerDown={startDrag}
          onPointerMove={moveDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={(event) => changeZoom(zoom - event.deltaY * 0.002)}
          sx={{
            width: VIEW_SIZE,
            height: VIEW_SIZE,
            maxWidth: '100%',
            mx: 'auto',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '50%',
            bgcolor: '#1a1a18',
            touchAction: 'none',
            cursor: image ? 'grab' : 'default',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          {image ? (
            <Box
              component="img"
              src={image.src}
              alt=""
              draggable={false}
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: image.naturalWidth * scale,
                height: image.naturalHeight * scale,
                transform: `translate(${offset.x}px, ${offset.y}px)`,
                userSelect: 'none',
                maxWidth: 'none',
              }}
            />
          ) : (
            !error && <CircularProgress size={24} sx={{ color: '#fff' }} />
          )}
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2.5 }}>
          <ZoomOutIcon fontSize="small" sx={{ color: COLORS.textSecondary }} />
          <Slider
            value={zoom}
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            disabled={!image}
            onChange={(_, value) => changeZoom(value as number)}
          />
          <ZoomInIcon fontSize="small" sx={{ color: COLORS.textSecondary }} />
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: error ? 'error.main' : COLORS.textSecondary, display: 'block', mt: 0.5 }}
        >
          {error || t('Drag to reposition, scroll or use the slider to zoom.')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button color="inherit" onClick={onCancel} disabled={saving}>
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={save}
          disabled={!image || saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {t('Save photo')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoCropDialog;
