import type { CvSection } from '../../../../redux/store/slices/cvBuilderSlice';

export const cvSectionFrom = (sectionName: string | undefined, sectionOrder: CvSection[]): CvSection | null => {
  const section = sectionName as CvSection | undefined;
  return section && sectionOrder.includes(section) ? section : null;
};
