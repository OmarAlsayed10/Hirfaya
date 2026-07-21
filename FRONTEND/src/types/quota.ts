export interface GuestQuotaStatus {
  identity: "guest";
  freeAnalysesLimit: number;
  freeAnalysesRemaining: number;
}

export interface UserQuotaStatus {
  identity: "user";
  planTier: string;
  unlimited: boolean;
  baseCredits: number | null;
  bonusCredits: number | null;
  totalCredits: number | null;
  resetsAt: string | null;
  expiresAt: string | null;
}

export type QuotaStatus = GuestQuotaStatus | UserQuotaStatus;
