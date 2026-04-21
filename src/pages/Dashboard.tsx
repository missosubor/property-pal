import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import {
  activeTenancyFor,
  currentRentYear,
  formatMoney,
  outstandingFor,
  statusFor,
  totalPaid,
} from "@/lib/rent";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const {
    properties,
    tenancies,
    payments,
    settings,
    addProperty,
  } = useStore();
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");

  const totals = useMemo(() => {
    let expected = 0;
    let received = 0;
    for (const t of tenancies) {
      if (t.endDate) continue;
      const year = currentRentYear(t);
      expected += t.annualRent;
      received += totalPaid(t.id, year, payments);
    }
    return { expected, received, outstanding: Math.max(0, expected - received) };
  }, [tenancies, payments]);

  const handleSave = () => {
    if (!address.trim()) {
      toast({ title: "Address required", variant: "destructive" });
      return;
    }
    addProperty(address);
    setAddress("");
    setOpen(false);
    toast({ title: "Property added" });
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Portfolio overview</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            Your properties
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Track tenants, log rent, and stay on top of what’s owed across every
            address you manage.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2 shadow-warm">
              <Plus className="h-4 w-4" /> Add property
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New property</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="addr">Address</Label>
              <Input
                id="addr"
                placeholder="12 Maple Street, London"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save property</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total expected" value={formatMoney(totals.expected, settings.currency)} tone="peach" />
        <SummaryCard label="Total received" value={formatMoney(totals.received, settings.currency)} tone="gold" />
        <SummaryCard label="Total outstanding" value={formatMoney(totals.outstanding, settings.currency)} tone="primary" />
      </section>

      <section>
        {properties.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-secondary grid place-items-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold">No properties yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Add your first property to start tracking tenants and rent.
              </p>
              <Button onClick={() => setOpen(true)} className="mt-2 gap-2">
                <Plus className="h-4 w-4" /> Add property
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => {
              const t = activeTenancyFor(p.id, tenancies);
              const status = t ? statusFor(t, payments) : null;
              const outstanding = t ? outstandingFor(t, payments) : 0;
              return (
                <Link key={p.id} to={`/property/${p.id}`} className="group">
                  <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-warm border-border/70">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-lg font-bold leading-tight truncate">
                            {p.address}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5 truncate">
                            {t ? t.tenantName : "No active tenant"}
                          </p>
                        </div>
                        {status && <StatusBadge status={status} />}
                      </div>
                      <div className="flex items-end justify-between pt-2 border-t border-border/60">
                        <div>
                          <p className="text-xs text-muted-foreground">Outstanding</p>
                          <p className="font-display text-2xl font-bold">
                            {formatMoney(outstanding, settings.currency)}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "peach" | "gold" | "primary";
}) {
  const toneClass =
    tone === "primary"
      ? "bg-gradient-warm text-primary-foreground"
      : tone === "gold"
        ? "bg-gradient-gold text-gold-foreground"
        : "bg-secondary text-secondary-foreground";
  return (
    <Card className={`${toneClass} border-0 shadow-soft`}>
      <CardContent className="p-5">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="font-display text-3xl font-bold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}