"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/components/dashboard-provider";
import { StatusBadge } from "@/components/status-badge";
import { classes } from "@/lib/classes";

const navItems = [
  { href: "/chats", label: "Chats" },
  { href: "/auto-reply", label: "Replies" },
  { href: "/settings", label: "Settings" },
  { href: "/session", label: "Session" }
];

export function AppShell({ children }) {
  const pathname = usePathname();
  const { snapshot, error } = useDashboard();

  return (
    <div className="min-h-screen border-t border-accent/40">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-slate-950/80 p-4 lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:border-b-0 lg:border-r lg:p-5">
          <div className="flex items-start justify-between gap-4 lg:block">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">Personal Chat</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">Control Room</h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400 lg:max-w-none">
                WhatsApp auto replies for direct personal chats.
              </p>
            </div>
            <div className="lg:mt-5">
              <StatusBadge status={snapshot.status.value} />
            </div>
          </div>

          <nav className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
            {navItems.map((item) => {
              const active = item.href === "/chats" ? pathname === "/" || pathname === "/chats" : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classes(
                    "flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition",
                    active
                      ? "border-accent/50 bg-accent/10 text-white"
                      : "border-white/10 bg-slate-900/50 text-slate-300 hover:border-slate-500 hover:text-white"
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  {active ? <span className="h-2.5 w-2.5 rounded-full bg-accent" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 rounded-lg border border-white/10 bg-slate-900/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Account</p>
            <p className="mt-2 truncate text-sm text-slate-200">
              {snapshot.status.clientName || "Not connected"}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
              <Metric label="Chats" value={String(snapshot.stats.totalChats)} />
              <Metric label="Unread" value={String(snapshot.stats.unreadChats)} />
              <Metric label="Auto" value={snapshot.settings.aiEnabled ? "On" : "Off"} />
              <Metric label="Sent" value={String(snapshot.stats.aiRepliedCount)} />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm leading-6 text-red-200">
              {error}
            </div>
          ) : null}
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-7">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-400">Realtime dashboard</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {snapshot.settings.aiEnabled ? "Auto replies are active" : "Auto replies are paused"}
              </p>
            </div>
            {error ? (
              <span className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-red-200">Needs attention</span>
            ) : (
              <span className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Live</span>
            )}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/70 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
