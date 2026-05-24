export interface AIWritingAssistDialogProps {
  onClose: (value: string) => void;
  open: boolean;
  selectedValue: string;
}

export interface AIFormData {
  jobTitle: string;
  sectionName: string;
  industry: string;
  experience: string;
}
