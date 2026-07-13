export interface WalletTransaction {
  id: string;
  profileId: string;
  amount: number;
  reason: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface WalletSummary {
  balance: number;
  transactions: WalletTransaction[];
}
