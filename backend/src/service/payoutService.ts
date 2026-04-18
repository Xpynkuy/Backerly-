import prisma from "../config/prisma";
import { ServiceError } from "../errors/ServiceError";

const COMMISSION_RATE = 0.03;
const MIN_WITHDRAWAL_CENTS = 10000;
const AUTO_COMPLETE_DELAY_MS = 10_000;

export interface PayoutInfo {
  lifetimeGrossCents: number;
  lifetimeNetCents: number;
  totalWithdrawnCents: number;
  availableBalanceCents: number;
  currentMonthGrossCents: number;
  commissionRate: number;
  minWithdrawalCents: number;
  incomePerMonth: { month: string; cents: number }[];
  subscribersPerMonth: { month: string; count: number }[];
  history: {
    id: string;
    grossCents: number;
    commissionCents: number;
    amountCents: number;
    status: string;
    createdAt: Date;
  }[];
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function lastTwelveMonths(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    out.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  }
  return out;
}

export const getPayoutInfo = async (authorId: string): Promise<PayoutInfo> => {
  const now = new Date();
  const twelveAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const allPayments = await prisma.payment.findMany({
    where: { authorId },
    select: { subscriberId: true, grossCents: true, createdAt: true },
  });

  const lifetimeGrossCents = allPayments.reduce((s, p) => s + p.grossCents, 0);
  const lifetimeNetCents = Math.floor(
    lifetimeGrossCents * (1 - COMMISSION_RATE),
  );

  const withdrawals = await prisma.withdrawal.findMany({
    where: {
      authorId,
      status: { in: ["pending", "processing", "completed"] },
    },
    select: { amountCents: true },
  });
  const totalWithdrawnCents = withdrawals.reduce(
    (s, w) => s + w.amountCents,
    0,
  );

  const availableBalanceCents = Math.max(
    lifetimeNetCents - totalWithdrawnCents,
    0,
  );

  const currentMonthGrossCents = allPayments
    .filter((p) => p.createdAt >= currentMonthStart)
    .reduce((s, p) => s + p.grossCents, 0);

  const months = lastTwelveMonths();
  const incomeMap = new Map<string, number>(months.map((m) => [m, 0]));
  const subsMap = new Map<string, Set<string>>(
    months.map((m) => [m, new Set()]),
  );

  for (const p of allPayments) {
    if (p.createdAt < twelveAgo) continue;
    const k = monthKey(p.createdAt);
    if (incomeMap.has(k)) {
      incomeMap.set(k, (incomeMap.get(k) ?? 0) + p.grossCents);
      subsMap.get(k)?.add(p.subscriberId);
    }
  }

  const incomePerMonth = months.map((m) => ({
    month: m,
    cents: incomeMap.get(m) ?? 0,
  }));
  const subscribersPerMonth = months.map((m) => ({
    month: m,
    count: subsMap.get(m)?.size ?? 0,
  }));

  const history = await prisma.withdrawal.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    lifetimeGrossCents,
    lifetimeNetCents,
    totalWithdrawnCents,
    availableBalanceCents,
    currentMonthGrossCents,
    commissionRate: COMMISSION_RATE,
    minWithdrawalCents: MIN_WITHDRAWAL_CENTS,
    incomePerMonth,
    subscribersPerMonth,
    history,
  };
};

function scheduleAutoComplete(withdrawalId: string): void {
  setTimeout(async () => {
    try {
      await prisma.withdrawal.updateMany({
        where: { id: withdrawalId, status: "pending" },
        data: { status: "completed" },
      });
    } catch (e) {
      console.error("Auto-complete withdrawal failed", withdrawalId, e);
    }
  }, AUTO_COMPLETE_DELAY_MS);
}

export const requestWithdrawal = async (
  authorId: string,
  amountCents: number,
) => {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    throw new ServiceError(400, "Invalid amount");
  }
  if (amountCents < MIN_WITHDRAWAL_CENTS) {
    throw new ServiceError(
      400,
      `Minimum withdrawal is ${MIN_WITHDRAWAL_CENTS / 100} RUB`,
    );
  }

  const info = await getPayoutInfo(authorId);

  if (amountCents > info.availableBalanceCents) {
    throw new ServiceError(400, "Amount exceeds available balance");
  }

  const grossCents = Math.ceil(amountCents / (1 - COMMISSION_RATE));
  const commissionCents = grossCents - amountCents;

  const withdrawal = await prisma.withdrawal.create({
    data: {
      authorId,
      grossCents,
      commissionCents,
      amountCents,
      status: "pending",
    },
  });

  scheduleAutoComplete(withdrawal.id);

  return withdrawal;
};
