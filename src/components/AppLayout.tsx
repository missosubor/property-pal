import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, Home, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { computeReminders } from "@/lib/reminders";

export default function AppLayout() {
  const { properties, tenancies, payments, settings, dismissedReminders } =
    useStore();
  const reminders = computeReminders(
    tenancies,
    payments,
    settings.reminders,
    dismissedReminders,
    properties,
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-warm shadow-warm grid place-items-center">
              <span className="font-display font-bold text-primary-foreground">R</span>
            </div>
            <div className="leading-none">
              <div className="font-display text-xl font-bold">Rentle</div>
              <div className="text-xs text-muted-foreground">Landlord ledger</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavItem to="/" icon={<Home className="h-4 w-4" />} label="Dashboard" end />
            <NavItem
              to="/reminders"
              icon={<Bell className="h-4 w-4" />}
              label="Reminders"
              badge={reminders.length || undefined}
            />
            <NavItem to="/settings" icon={<SettingsIcon className="h-4 w-4" />} label="Settings" />
          </nav>
        </div>
      </header>
      <main className="container py-8">
        <Outlet />
      </main>
      <footer className="container py-10 text-center text-xs text-muted-foreground">
        Rentle · your data stays on this device
      </footer>
    </div>
  );
}

function NavItem({
  to,
  icon,
  label,
  badge,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground shadow-warm"
            : "text-foreground/70 hover:bg-secondary hover:text-foreground",
        )
      }
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge ? (
        <span className="ml-1 rounded-full bg-gold px-1.5 text-xs text-gold-foreground">
          {badge}
        </span>
      ) : null}
    </NavLink>
  );
}