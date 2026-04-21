import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import type { Currency } from "@/lib/types";

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "GBP", label: "£ GBP — British Pound" },
  { value: "USD", label: "$ USD — US Dollar" },
  { value: "EUR", label: "€ EUR — Euro" },
];

export default function Settings() {
  const { settings, setCurrency, setReminders } = useStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <p className="text-sm font-medium text-primary">Settings</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Preferences
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Currency</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-sm">Display currency</Label>
          <Select
            value={settings.currency}
            onValueChange={(v) => setCurrency(v as Currency)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Reminders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable reminders</p>
              <p className="text-sm text-muted-foreground">
                Generate due-date and follow-up notifications.
              </p>
            </div>
            <Switch
              checked={settings.reminders.enabled}
              onCheckedChange={(b) => setReminders({ enabled: b })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>First follow-up after (days)</Label>
              <Input
                inputMode="numeric"
                value={settings.reminders.firstFollowUpDays}
                onChange={(e) =>
                  setReminders({
                    firstFollowUpDays: Math.max(1, parseInt(e.target.value || "0", 10)),
                  })
                }
                disabled={!settings.reminders.enabled}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Repeat every (days)</Label>
              <Input
                inputMode="numeric"
                value={settings.reminders.repeatIntervalDays}
                onChange={(e) =>
                  setReminders({
                    repeatIntervalDays: Math.max(1, parseInt(e.target.value || "0", 10)),
                  })
                }
                disabled={!settings.reminders.enabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}