import { dbGet, dbListByIndex, dbSet } from "../storage/db";
import type { WalletSummary, WalletTransaction } from "./types";

function transactionId(profileId: string, idempotencyKey: string) {
  return `${profileId}:${idempotencyKey}`;
}

function now() {
  return new Date().toISOString();
}

function sortNewestFirst(transactions: WalletTransaction[]) {
  return [...transactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const walletService = {
  async getTransactions(profileId: string) {
    return sortNewestFirst(await dbListByIndex("walletTransactions", "by-profile", profileId));
  },

  async getBalance(profileId: string) {
    const transactions = await dbListByIndex("walletTransactions", "by-profile", profileId);
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  },

  async getSummary(profileId: string): Promise<WalletSummary> {
    const transactions = await this.getTransactions(profileId);
    return {
      balance: transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
      transactions,
    };
  },

  async addStars(profileId: string, amount: number, reason: string, idempotencyKey: string, metadata?: Record<string, unknown>) {
    if (amount <= 0) throw new Error("La cantidad debe ser positiva.");
    const id = transactionId(profileId, idempotencyKey);
    const existing = await dbGet("walletTransactions", id);
    if (existing) return existing;

    const transaction: WalletTransaction = {
      id,
      profileId,
      amount,
      reason,
      metadata,
      createdAt: now(),
    };
    await dbSet("walletTransactions", transaction);
    return transaction;
  },

  async spendStars(profileId: string, amount: number, reason: string, idempotencyKey: string, metadata?: Record<string, unknown>) {
    if (amount <= 0) throw new Error("La cantidad debe ser positiva.");
    const id = transactionId(profileId, idempotencyKey);
    const existing = await dbGet("walletTransactions", id);
    if (existing) return existing;

    const balance = await this.getBalance(profileId);
    if (balance < amount) throw new Error("No tienes estrellas suficientes.");

    const transaction: WalletTransaction = {
      id,
      profileId,
      amount: -amount,
      reason,
      metadata,
      createdAt: now(),
    };
    await dbSet("walletTransactions", transaction);
    return transaction;
  },
};
