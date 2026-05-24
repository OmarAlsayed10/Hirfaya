import { NavPage, NavUser } from '../../Navbar.types';

export interface MobileMenuProps {
  anchorEl: null | HTMLElement;
  onClose: () => void;
  pages: NavPage[];
  isAuthenticated: boolean;
  user: NavUser | null;
  onLogout: () => void;
}
