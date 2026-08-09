export type SettingsTab = 'profile' | 'plan' | 'cv' | 'documents' | 'connections';

export interface NavItem {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}
