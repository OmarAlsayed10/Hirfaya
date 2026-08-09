import type { CvSection } from '../../../../redux/store/slices/cvBuilderSlice';

export const cvSectionFrom = (sectionName: string | undefined, sectionOrder: CvSection[]): CvSection | null => {
  const section = sectionName as CvSection | undefined;
  return section && sectionOrder.includes(section) ? section : null;
};

export const pageCountFrom = (scrollHeight: number, pageHeight: number): number =>
  Math.max(1, Math.ceil((scrollHeight - 8) / pageHeight));

// Templates render a different tree once pageCount > 1 (page switcher, clipped pages), so
// the measured height depends on the count it produced. Growing only, until the CV content
// itself changes, is what stops that feedback flipping between 1 and 2 forever.
export const shouldApplyPageCount = (next: number, latched: number, allowShrink: boolean): boolean =>
  allowShrink ? next !== latched : next > latched;
