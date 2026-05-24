import { ChangeEvent, ElementType } from 'react';

export interface FormInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  icon?: ElementType;
  multiline?: boolean;
  minRows?: number;
}
