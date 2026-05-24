import { NavUser } from '../../Navbar.types';

export interface UserMenuProps {
  user: NavUser | null;
  onLogout: () => void;
}
