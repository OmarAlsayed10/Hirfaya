export type SettingsTab = 'profile' | 'plan' | 'cv';

export interface NavItem {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  danger?: boolean;
}
