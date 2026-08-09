import { NavPage, NavUser } from '../../Navbar.types';

export interface DesktopNavProps {
  pages: NavPage[];
  productPages: NavPage[];
  isAuthenticated: boolean;
  user: NavUser | null;
  onLogout: () => void;
}
