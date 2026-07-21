import prisma from "../lib/prisma";
import { approvePaymentRequestAtomically } from "./creditPurchaseService";

jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: { $transaction: jest.fn() },
}));

const mockedPrisma = prisma as unknown as {
  $transaction: jest.Mock;
};

describe("approvePaymentRequestAtomically", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("claims PENDING before granting exactly the snapshotted credits", async () => {
    const payment = {
      id: "payment-1",
      userId: "user-1",
      status: "PENDING",
      purchaseKind: "CUSTOM_TOPUP",
      grantCreditsSnapshot: 321,
      plan: null,
      user: { id: "user-1" },
    };
    const approved = { ...payment, status: "APPROVED" };
    const tx = {
      paymentRequest: {
        findUnique: jest.fn()
          .mockResolvedValueOnce(payment)
          .mockResolvedValueOnce(approved),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      user: {
        update: jest.fn().mockResolvedValue({
          id: "user-1",
          email: "buyer@example.com",
          firstName: "Buyer",
          proExpiresAt: null,
        }),
      },
    };
    mockedPrisma.$transaction.mockImplementation((callback) => callback(tx));

    const result = await approvePaymentRequestAtomically("payment-1");

    expect(tx.paymentRequest.updateMany).toHaveBeenCalledWith({
      where: { id: "payment-1", status: "PENDING" },
      data: { status: "APPROVED", reviewedAt: expect.any(Date) },
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { bonusCredits: { increment: 321 } },
    });
    expect(result.displayName).toBe("+321 Credits");
  });

  it("does not grant when another approval already claimed the request", async () => {
    const tx = {
      paymentRequest: {
        findUnique: jest.fn().mockResolvedValue({
          id: "payment-1",
          userId: "user-1",
          status: "PENDING",
          purchaseKind: "CUSTOM_TOPUP",
          grantCreditsSnapshot: 321,
          plan: null,
          user: { id: "user-1" },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      user: { update: jest.fn() },
    };
    mockedPrisma.$transaction.mockImplementation((callback) => callback(tx));

    await expect(approvePaymentRequestAtomically("payment-1")).rejects.toThrow("NOT_PENDING");
    expect(tx.user.update).not.toHaveBeenCalled();
  });
});
