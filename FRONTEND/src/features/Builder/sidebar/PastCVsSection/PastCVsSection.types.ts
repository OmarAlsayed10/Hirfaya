export interface PastCVsSectionProps {}

export interface CvItem {
  id?: string;
  _id?: string;
  personalInfo: {
    professionalTitle: string;
    [key: string]: string;
  };
  [key: string]: unknown;
}
