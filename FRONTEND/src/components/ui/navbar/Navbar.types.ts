export interface NavPage {
  label: string;
  href: string;
}

export interface NavUser {
  photo?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  proExpiresAt?: number | string | Date;
}
