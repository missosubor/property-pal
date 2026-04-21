import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/lib/store";
import {
  currentRentYear,
  dueDateFor,
  formatMoney,
  outstandingFor,
  paymentsFor,
  statusFor,
  tenancyYears,
  totalPaid,
} from "@/lib/rent";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    properties,
    tenancies,
    payments,
    settings,
    updateProperty,
    deleteProperty,
    addTenancy,
    updateTenancy,
    endTenancy,
    addPayment,
    deletePayment,
  } = useStore();

  const property = properties.find((p) => p.id === id);
  const propertyTenancies = useMemo(
    () =>
      tenancies
        .filter((t) => t.propertyId === id)
        .sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
        ),
    [tenancies, id],
  );
  const active = propertyTenancies.find((t) => !t.endDate);

  const [editAddrOpen, setEditAddrOpen] = useState(false);
  const [editAddr, setEditAddr] = useState(property?.address ?? "");
  const [tenancyOpen, setTenancyOpen] = useState(false);
  const [editingTenancy, setEditingTenancy] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [year, setYear] = useState<number | null>(null);

  if (!property) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Property not found.</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to dashboard</Link>
        </Button>
      </div>
    );
  }

  const status = active ? statusFor(active, payments) : null;
  const activeYear = active ? currentRentYear(active) : new Date().getFullYear();
  const viewYear = year ?? activeYear;
  const yearList = active ? tenancyYears(active, payments) : [activeYear];
  const yearPayments = active ? paymentsFor(active.id, viewYear, payments) : [];
  const yearTotal = active ? totalPaid(active.id, viewYear, payments) : 0;
  const balance = active ? Math.max(0, active.annualRent - yearTotal) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditAddr(property.address);
              setEditAddrOpen(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-1" /> Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this property?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the property along with its tenancies and payments. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    deleteProperty(property.id);
                    navigate("/");
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Property</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            {property.address}
          </h1>
        </div>
        {status && <StatusBadge status={status} />}
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-warm text-primary-foreground border-0 shadow-warm">
          <CardContent className="p-5">
            <p className="text-sm opacity-80">Outstanding</p>
            <p className="font-display text-3xl font-bold">
              {formatMoney(active ? outstandingFor(active, payments) : 0, settings.currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-secondary border-0">
          <CardContent className="p-5">
            <p className="text-sm text-secondary-foreground/70">Annual rent</p>
            <p className="font-display text-2xl font-bold">
              {active ? formatMoney(active.annualRent, settings.currency) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-gold text-gold-foreground border-0">
          <CardContent className="p-5">
            <p className="text-sm opacity-80">Due each year</p>
            <p className="font-display text-2xl font-bold">
              {active ? format(dueDateFor(active, activeYear), "d MMM") : "—"}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="font-display">Active tenancy</CardTitle>
          {active ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingTenancy(active.id);
                  setTenancyOpen(true);
                }}
              >
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  endTenancy(active.id, new Date().toISOString());
                  toast({ title: "Tenancy ended" });
                }}
              >
                End tenancy
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                setEditingTenancy(null);
                setTenancyOpen(true);
              }}
              className="gap-2"
            >
              <UserPlus className="h-4 w-4" /> Add tenant
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {active ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Tenant" value={active.tenantName} />
              <Field label="Phone" value={active.tenantPhone || "—"} />
              <Field label="Email" value={active.tenantEmail || "—"} />
              <Field label="Tenancy started" value={format(new Date(active.startDate), "PPP")} />
            </div>
          ) : (
            <p className="text-muted-foreground">No active tenant on this property.</p>
          )}
        </CardContent>
      </Card>

      {active && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 gap-2 flex-wrap">
            <CardTitle className="font-display">Payment history</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={String(viewYear)}
                onValueChange={(v) => setYear(Number(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearList.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setPayOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Log payment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Date</th>
                    <th className="text-right px-3 py-2 font-medium">Amount</th>
                    <th className="text-right px-3 py-2 font-medium">Running</th>
                    <th className="text-right px-3 py-2 font-medium">Balance</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {yearPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                        No payments logged for {viewYear}.
                      </td>
                    </tr>
                  ) : (
                    yearPayments.reduce<{ rows: JSX.Element[]; running: number }>(
                      (acc, p, idx) => {
                        const running = acc.running + p.amount;
                        const bal = Math.max(0, active.annualRent - running);
                        const settled = bal === 0 && idx === yearPayments.length - 1;
                        acc.rows.push(
                          <tr key={p.id} className="border-t border-border">
                            <td className="px-3 py-2">
                              {format(new Date(p.dateReceived), "d MMM yyyy")}
                              {p.notes && (
                                <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                  {p.notes}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-medium">
                              {formatMoney(p.amount, settings.currency)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {formatMoney(running, settings.currency)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {formatMoney(bal, settings.currency)}
                              {settled && (
                                <span className="ml-2 inline-flex items-center gap-1 text-success text-xs font-semibold">
                                  <CheckCircle2 className="h-3 w-3" /> Settled
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePayment(p.id)}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>,
                        );
                        acc.running = running;
                        return acc;
                      },
                      { rows: [], running: 0 },
                    ).rows
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-6 mt-3 text-sm">
              <div>
                <span className="text-muted-foreground">Paid {viewYear}: </span>
                <span className="font-semibold">{formatMoney(yearTotal, settings.currency)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Balance: </span>
                <span className="font-semibold">{formatMoney(balance, settings.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {active && yearList.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Year-on-year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Year</th>
                    <th className="text-right px-3 py-2 font-medium">Total paid</th>
                    <th className="text-right px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {yearList.map((y) => {
                    const paid = totalPaid(active.id, y, payments);
                    const settled = paid >= active.annualRent;
                    return (
                      <tr key={y} className="border-t border-border">
                        <td className="px-3 py-2 font-medium">{y}</td>
                        <td className="px-3 py-2 text-right">
                          {formatMoney(paid, settings.currency)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={
                              settled
                                ? "text-success font-semibold"
                                : "text-warning font-semibold"
                            }
                          >
                            {settled ? "Settled" : "Outstanding"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {propertyTenancies.filter((t) => t.endDate).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Past tenancies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {propertyTenancies
              .filter((t) => t.endDate)
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{t.tenantName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(t.startDate), "MMM yyyy")} –{" "}
                      {format(new Date(t.endDate!), "MMM yyyy")}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatMoney(t.annualRent, settings.currency)} / yr
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Edit address dialog */}
      <Dialog open={editAddrOpen} onOpenChange={setEditAddrOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit property address</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={editAddr} onChange={(e) => setEditAddr(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditAddrOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!editAddr.trim()) {
                  toast({ title: "Address required", variant: "destructive" });
                  return;
                }
                updateProperty(property.id, editAddr);
                setEditAddrOpen(false);
                toast({ title: "Property updated" });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TenancyDialog
        open={tenancyOpen}
        onOpenChange={setTenancyOpen}
        propertyId={property.id}
        existing={editingTenancy ? propertyTenancies.find((t) => t.id === editingTenancy) : null}
        onSave={(data) => {
          if (editingTenancy) {
            updateTenancy(editingTenancy, data);
            toast({ title: "Tenancy updated" });
          } else {
            addTenancy({
              propertyId: property.id,
              startDate: new Date().toISOString(),
              ...data,
            } as any);
            toast({ title: "Tenancy created" });
          }
        }}
      />

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        onSave={({ amount, dateReceived, notes }) => {
          if (!active) return;
          addPayment({
            tenancyId: active.id,
            propertyId: property.id,
            year: new Date(dateReceived).getFullYear() < active.dueMonth - 1 ? new Date(dateReceived).getFullYear() - 1 : currentRentYearForDate(active, new Date(dateReceived)),
            amount,
            dateReceived,
            notes,
          });
          toast({ title: "Payment logged" });
        }}
      />
    </div>
  );
}

function currentRentYearForDate(t: { dueDay: number; dueMonth: number }, d: Date) {
  const y = d.getFullYear();
  const due = new Date(y, t.dueMonth - 1, t.dueDay);
  return d >= due ? y : y - 1;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function TenancyDialog({
  open,
  onOpenChange,
  existing,
  onSave,
  propertyId,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  existing?: any;
  propertyId: string;
  onSave: (data: any) => void;
}) {
  const [name, setName] = useState(existing?.tenantName ?? "");
  const [phone, setPhone] = useState(existing?.tenantPhone ?? "");
  const [email, setEmail] = useState(existing?.tenantEmail ?? "");
  const [rent, setRent] = useState<string>(existing ? String(existing.annualRent) : "");
  const [day, setDay] = useState<string>(existing ? String(existing.dueDay) : "1");
  const [month, setMonth] = useState<string>(existing ? String(existing.dueMonth) : "1");

  // Reset when opening
  useMemo(() => {
    if (open) {
      setName(existing?.tenantName ?? "");
      setPhone(existing?.tenantPhone ?? "");
      setEmail(existing?.tenantEmail ?? "");
      setRent(existing ? String(existing.annualRent) : "");
      setDay(existing ? String(existing.dueDay) : "1");
      setMonth(existing ? String(existing.dueMonth) : "1");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "Edit tenancy" : "New tenancy"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Tenant name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Annual rent</Label>
            <Input
              inputMode="decimal"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="12000"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due day</Label>
              <Input
                inputMode="numeric"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Due month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {format(new Date(2024, m - 1, 1), "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!name.trim()) return toast({ title: "Tenant name required", variant: "destructive" });
              const r = parseFloat(rent);
              const d = parseInt(day, 10);
              const m = parseInt(month, 10);
              if (!r || r <= 0) return toast({ title: "Enter an annual rent", variant: "destructive" });
              if (!d || d < 1 || d > 31) return toast({ title: "Day must be 1–31", variant: "destructive" });
              onSave({
                tenantName: name.trim(),
                tenantPhone: phone.trim() || undefined,
                tenantEmail: email.trim() || undefined,
                annualRent: r,
                dueDay: d,
                dueMonth: m,
                propertyId,
              });
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  onSave: (data: { amount: number; dateReceived: string; notes?: string }) => void;
}) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");

  useMemo(() => {
    if (open) {
      setAmount("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setNotes("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Amount</Label>
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Date received</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const a = parseFloat(amount);
              if (!a || a <= 0)
                return toast({ title: "Enter an amount", variant: "destructive" });
              onSave({
                amount: a,
                dateReceived: new Date(date).toISOString(),
                notes: notes.trim() || undefined,
              });
              onOpenChange(false);
            }}
          >
            Save payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}