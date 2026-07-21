export interface NavPage {
  label: string;
  href: string;
  requiresPaid?: boolean;
}

export interface NavUser {
  photo?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  proExpiresAt?: number | string | Date;
  planTier?: string;
}
