import type { Payment, Tenancy, TenancyStatus } from "./types";

const CURRENCY_LOCALE: Record<string, string> = {
  GBP: "en-GB",
  USD: "en-US",
  EUR: "de-DE",
};

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? "en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)}`;
  }
}

export function activeTenancyFor(propertyId: string, tenancies: Tenancy[]) {
  return tenancies.find((t) => t.propertyId === propertyId && !t.endDate);
}

/** The "rental year" anchor for a tenancy: the year of the most recent due date <= today. */
export function currentRentYear(t: Tenancy, today = new Date()) {
  const y = today.getFullYear();
  const due = new Date(y, t.dueMonth - 1, t.dueDay);
  return today >= due ? y : y - 1;
}

export function dueDateFor(t: Tenancy, year: number) {
  return new Date(year, t.dueMonth - 1, t.dueDay);
}

export function paymentsFor(
  tenancyId: string,
  year: number,
  payments: Payment[],
) {
  return payments
    .filter((p) => p.tenancyId === tenancyId && p.year === year)
    .sort(
      (a, b) =>
        new Date(a.dateReceived).getTime() -
        new Date(b.dateReceived).getTime(),
    );
}

export function totalPaid(
  tenancyId: string,
  year: number,
  payments: Payment[],
) {
  return paymentsFor(tenancyId, year, payments).reduce(
    (s, p) => s + p.amount,
    0,
  );
}

export function statusFor(
  t: Tenancy,
  payments: Payment[],
  today = new Date(),
): TenancyStatus {
  const year = currentRentYear(t, today);
  const due = dueDateFor(t, year);
  const paid = totalPaid(t.id, year, payments);
  if (paid >= t.annualRent && t.annualRent > 0) return "PAID";
  if (today < due) return "UPCOMING";
  if (paid > 0) return "PARTIAL";
  return "LATE";
}

export function outstandingFor(
  t: Tenancy,
  payments: Payment[],
  today = new Date(),
) {
  const year = currentRentYear(t, today);
  const paid = totalPaid(t.id, year, payments);
  return Math.max(0, t.annualRent - paid);
}

export function tenancyYears(t: Tenancy, payments: Payment[]) {
  const start = new Date(t.startDate).getFullYear();
  const end = t.endDate ? new Date(t.endDate).getFullYear() : new Date().getFullYear();
  const years = new Set<number>();
  for (let y = start; y <= end; y++) years.add(y);
  payments.filter((p) => p.tenancyId === t.id).forEach((p) => years.add(p.year));
  return [...years].sort((a, b) => b - a);
}