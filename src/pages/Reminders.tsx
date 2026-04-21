import { Link } from "react-router-dom";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { computeReminders } from "@/lib/reminders";
import { formatMoney } from "@/lib/rent";

export default function Reminders() {
  const {
    tenancies,
    payments,
    properties,
    settings,
    dismissedReminders,
    dismissReminder,
  } = useStore();
  const reminders = computeReminders(
    tenancies,
    payments,
    settings.reminders,
    dismissedReminders,
    properties,
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <p className="text-sm font-medium text-primary">Reminders</p>
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Things to chase
        </h1>
        <p className="text-muted-foreground mt-2">
          Notifications appear on a tenancy's due date and again as follow-ups
          while rent is outstanding.
        </p>
      </header>

      {!settings.reminders.enabled && (
        <Card className="border-dashed">
          <CardContent className="p-6 flex items-center gap-3 text-muted-foreground">
            <BellOff className="h-5 w-5" />
            Reminders are turned off. Enable them in{" "}
            <Link to="/settings" className="text-primary underline">
              settings
            </Link>
            .
          </CardContent>
        </Card>
      )}

      {settings.reminders.enabled && reminders.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            <Bell className="h-6 w-6 mx-auto mb-2 text-primary" />
            All clear — nothing to chase right now.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reminders.map((r) => (
          <Card
            key={r.id}
            className={
              r.level === "due"
                ? "border-l-4 border-l-gold"
                : "border-l-4 border-l-destructive"
            }
          >
            <CardContent className="p-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-bold">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.body}</p>
                <Link
                  to={`/property/${r.propertyId}`}
                  className="text-xs text-primary mt-1 inline-block"
                >
                  Open property →
                </Link>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold">
                  {formatMoney(r.amount, settings.currency)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 mt-1"
                  onClick={() => dismissReminder(r.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}