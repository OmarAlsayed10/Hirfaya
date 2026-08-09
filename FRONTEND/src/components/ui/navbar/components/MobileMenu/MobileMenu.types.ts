import { NavPage, NavUser } from '../../Navbar.types';

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pages: NavPage[];
  productPages: NavPage[];
  isAuthenticated: boolean;
  user: NavUser | null;
  onLogout: () => void;
}
