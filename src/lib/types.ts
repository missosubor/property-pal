export type Currency = "GBP" | "USD" | "EUR";

export interface Property {
  id: string;
  address: string;
  createdAt: string;
}

export interface Tenancy {
  id: string;
  propertyId: string;
  tenantName: string;
  tenantPhone?: string;
  tenantEmail?: string;
  annualRent: number;
  dueDay: number; // 1-31
  dueMonth: number; // 1-12
  startDate: string; // ISO
  endDate?: string; // ISO if ended
}

export interface Payment {
  id: string;
  tenancyId: string;
  propertyId: string;
  year: number; // rental year (calendar year of due date period)
  amount: number;
  dateReceived: string; // ISO
  notes?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  firstFollowUpDays: number;
  repeatIntervalDays: number;
}

export interface AppSettings {
  currency: Currency;
  reminders: ReminderSettings;
}

export type TenancyStatus = "PAID" | "PARTIAL" | "LATE" | "UPCOMING";