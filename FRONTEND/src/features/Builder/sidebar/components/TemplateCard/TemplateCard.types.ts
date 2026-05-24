export interface TemplateCardProps {
  title: string;
  img: string;
  disc: string;
  pro: boolean;
  onCloseDialog: () => void;
  sx?: Record<string, unknown>;
}
