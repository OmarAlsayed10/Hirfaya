export interface ExperienceProps {}

export interface ExperienceEntry {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface ExperienceFormData {
  experience: ExperienceEntry[];
}
