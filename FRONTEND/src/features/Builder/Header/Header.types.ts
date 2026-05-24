export interface HeaderProps {}

export interface PdfExperienceEntry {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  years: string;
  location: string;
  description: string;
}

export interface PdfEducationEntry {
  institution: string;
  degree: string;
  startYear: string;
  endYear: string;
  location: string;
  description: string;
}

export interface PdfProps {
  name: string;
  email: string;
  phone: string;
  location: string;
  professionalTitle: string;
  summary: string;
  skills: string;
  experience: PdfExperienceEntry[];
  education: PdfEducationEntry[];
}
