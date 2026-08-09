export interface CropView {
  viewSize: number;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
}

export interface CropOffset {
  x: number;
  y: number;
}

export const coverScale = (view: CropView): number =>
  Math.max(view.viewSize / view.naturalWidth, view.viewSize / view.naturalHeight);

export const displayScale = (view: CropView): number => coverScale(view) * view.zoom;

export const centeredOffset = (view: CropView): CropOffset => {
  const scale = displayScale(view);
  return {
    x: (view.viewSize - view.naturalWidth * scale) / 2,
    y: (view.viewSize - view.naturalHeight * scale) / 2,
  };
};

export const clampOffset = (view: CropView, offset: CropOffset): CropOffset => {
  const scale = displayScale(view);
  const minX = view.viewSize - view.naturalWidth * scale;
  const minY = view.viewSize - view.naturalHeight * scale;
  return {
    x: Math.min(0, Math.max(minX, offset.x)),
    y: Math.min(0, Math.max(minY, offset.y)),
  };
};

export const zoomedOffset = (
  view: CropView,
  offset: CropOffset,
  nextZoom: number,
): CropOffset => {
  const ratio = displayScale({ ...view, zoom: nextZoom }) / displayScale(view);
  const center = view.viewSize / 2;
  return clampOffset({ ...view, zoom: nextZoom }, {
    x: center - (center - offset.x) * ratio,
    y: center - (center - offset.y) * ratio,
  });
};

export const sourceRect = (view: CropView, offset: CropOffset) => {
  const scale = displayScale(view);
  const clamped = clampOffset(view, offset);
  return {
    sx: -clamped.x / scale,
    sy: -clamped.y / scale,
    size: view.viewSize / scale,
  };
};
