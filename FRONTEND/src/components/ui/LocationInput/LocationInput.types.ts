import { Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';

export interface LocationInputProps {
  control: Control;
  watch: UseFormWatch<Record<string, unknown>>;
  setValue: UseFormSetValue<Record<string, unknown>>;
}
