export interface ChooseTemplateDialogProps {
  onClose: () => void;
  open: boolean;
}

export interface TemplateItem {
  title: string;
  img: string;
  disc: string;
  pro: boolean;
}
