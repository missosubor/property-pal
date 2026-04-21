import type {
  Payment,
  Property,
  ReminderSettings,
  Tenancy,
} from "./types";
import {
  currentRentYear,
  dueDateFor,
  outstandingFor,
  totalPaid,
} from "./rent";

export interface Reminder {
  id: string;
  propertyId: string;
  tenancyId: string;
  title: string;
  body: string;
  amount: number;
  level: "due" | "followup";
  date: string;
}

const DAY_MS = 1000 * 60 * 60 * 24;

export function computeReminders(
  tenancies: Tenancy[],
  payments: Payment[],
  settings: ReminderSettings,
  dismissed: string[],
  properties: Property[],
  today = new Date(),
): Reminder[] {
  if (!settings.enabled) return [];
  const out: Reminder[] = [];
  const propMap = new Map(properties.map((p) => [p.id, p]));

  for (const t of tenancies) {
    if (t.endDate) continue;
    const year = currentRentYear(t, today);
    const due = dueDateFor(t, year);
    const paid = totalPaid(t.id, year, payments);
    if (paid >= t.annualRent && t.annualRent > 0) continue;

    const owed = outstandingFor(t, payments, today);
    const prop = propMap.get(t.propertyId);
    const addr = prop?.address ?? "Property";
    const daysSinceDue = Math.floor((today.getTime() - due.getTime()) / DAY_MS);

    // Due-day reminder
    if (daysSinceDue === 0) {
      out.push({
        id: `due-${t.id}-${year}`,
        propertyId: t.propertyId,
        tenancyId: t.id,
        title: `Rent due today — ${t.tenantName}`,
        body: `${addr} · ${owed.toFixed(2)} due`,
        amount: owed,
        level: "due",
        date: due.toISOString(),
      });
    }

    // Follow-ups
    if (daysSinceDue >= settings.firstFollowUpDays) {
      const extra = daysSinceDue - settings.firstFollowUpDays;
      const cycles =
        settings.repeatIntervalDays > 0
          ? Math.floor(extra / settings.repeatIntervalDays) + 1
          : 1;
      out.push({
        id: `fu-${t.id}-${year}-${cycles}`,
        propertyId: t.propertyId,
        tenancyId: t.id,
        title: `Follow up: ${t.tenantName} is ${daysSinceDue} days late`,
        body: `${addr} · outstanding ${owed.toFixed(2)}`,
        amount: owed,
        level: "followup",
        date: today.toISOString(),
      });
    }
  }
  return out.filter((r) => !dismissed.includes(r.id));
}