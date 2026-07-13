import { beforeEach, describe, expect, it, vi } from "vitest";
import { walletService } from "./walletService";

const state = vi.hoisted(() => ({ transactions: [] as any[] }));

vi.mock("../storage/db", () => ({
  dbGet: vi.fn(async (_store: string, id: string) => state.transactions.find((transaction) => transaction.id === id)),
  dbSet: vi.fn(async (_store: string, value: any) => {
    state.transactions.push(value);
  }),
  dbListByIndex: vi.fn(async (_store: string, _index: string, profileId: string) =>
    state.transactions.filter((transaction) => transaction.profileId === profileId),
  ),
}));

describe("walletService", () => {
  beforeEach(() => {
    state.transactions = [];
  });

  it("adds stars idempotently", async () => {
    await walletService.addStars("profile-1", 20, "Bienvenida", "welcome");
    await walletService.addStars("profile-1", 20, "Bienvenida", "welcome");

    expect(await walletService.getBalance("profile-1")).toBe(20);
  });

  it("prevents negative balances", async () => {
    await expect(walletService.spendStars("profile-1", 60, "Compra", "buy")).rejects.toThrow(
      "No tienes estrellas suficientes.",
    );
  });

  it("spends stars when balance is enough", async () => {
    await walletService.addStars("profile-1", 80, "Premio", "reward");
    await walletService.spendStars("profile-1", 60, "Compra", "buy");

    expect(await walletService.getBalance("profile-1")).toBe(20);
  });
});
