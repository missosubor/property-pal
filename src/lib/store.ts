import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppSettings,
  Payment,
  Property,
  Tenancy,
} from "./types";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

interface State {
  properties: Property[];
  tenancies: Tenancy[];
  payments: Payment[];
  settings: AppSettings;
  dismissedReminders: string[]; // reminder ids dismissed

  addProperty: (address: string) => Property;
  updateProperty: (id: string, address: string) => void;
  deleteProperty: (id: string) => void;

  addTenancy: (t: Omit<Tenancy, "id">) => Tenancy;
  updateTenancy: (id: string, patch: Partial<Tenancy>) => void;
  endTenancy: (id: string, endDate: string) => void;

  addPayment: (p: Omit<Payment, "id">) => Payment;
  deletePayment: (id: string) => void;

  setCurrency: (c: AppSettings["currency"]) => void;
  setReminders: (r: Partial<AppSettings["reminders"]>) => void;
  dismissReminder: (id: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      properties: [],
      tenancies: [],
      payments: [],
      dismissedReminders: [],
      settings: {
        currency: "GBP",
        reminders: {
          enabled: true,
          firstFollowUpDays: 7,
          repeatIntervalDays: 14,
        },
      },

      addProperty: (address) => {
        const p: Property = {
          id: uid(),
          address: address.trim(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ properties: [p, ...s.properties] }));
        return p;
      },
      updateProperty: (id, address) =>
        set((s) => ({
          properties: s.properties.map((p) =>
            p.id === id ? { ...p, address: address.trim() } : p,
          ),
        })),
      deleteProperty: (id) =>
        set((s) => ({
          properties: s.properties.filter((p) => p.id !== id),
          tenancies: s.tenancies.filter((t) => t.propertyId !== id),
          payments: s.payments.filter((p) => p.propertyId !== id),
        })),

      addTenancy: (t) => {
        const tenancy: Tenancy = { ...t, id: uid() };
        set((s) => ({ tenancies: [tenancy, ...s.tenancies] }));
        return tenancy;
      },
      updateTenancy: (id, patch) =>
        set((s) => ({
          tenancies: s.tenancies.map((t) =>
            t.id === id ? { ...t, ...patch } : t,
          ),
        })),
      endTenancy: (id, endDate) =>
        set((s) => ({
          tenancies: s.tenancies.map((t) =>
            t.id === id ? { ...t, endDate } : t,
          ),
        })),

      addPayment: (p) => {
        const payment: Payment = { ...p, id: uid() };
        set((s) => ({ payments: [payment, ...s.payments] }));
        return payment;
      },
      deletePayment: (id) =>
        set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),

      setCurrency: (currency) =>
        set((s) => ({ settings: { ...s.settings, currency } })),
      setReminders: (r) =>
        set((s) => ({
          settings: {
            ...s.settings,
            reminders: { ...s.settings.reminders, ...r },
          },
        })),
      dismissReminder: (id) =>
        set((s) => ({ dismissedReminders: [...s.dismissedReminders, id] })),
    }),
    { name: "rentle-store-v1" },
  ),
);