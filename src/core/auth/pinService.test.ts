import { describe, expect, it } from "vitest";
import { hashPin, isValidPin, verifyPin } from "./pinService";

describe("pinService", () => {
  it("hashes and verifies a PIN without storing it in clear text", async () => {
    const hash = await hashPin("1234");

    expect(hash).not.toContain("1234");
    expect(await verifyPin("1234", hash)).toBe(true);
    expect(await verifyPin("9999", hash)).toBe(false);
  });

  it("accepts exactly four numeric digits", () => {
    expect(isValidPin("1234")).toBe(true);
    expect(isValidPin("123")).toBe(false);
    expect(isValidPin("abcd")).toBe(false);
    expect(isValidPin("12345")).toBe(false);
  });
});
