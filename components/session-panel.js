"use client";

import { useDashboard } from "@/components/dashboard-provider";
import { formatDateTime } from "@/lib/format";

export function SessionPanel() {
  const { snapshot, actions, submitting } = useDashboard();
  const { status, session } = snapshot;

  function runSessionAction(action) {
    action().catch(() => {});
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
        <div className="rounded-lg bg-white p-4 shadow-2xl shadow-black/30">
          {status.qrCode ? (
            <img alt="WhatsApp QR Code" className="h-full w-full rounded-lg object-contain" src={status.qrCode} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-slate-300/50 px-6 text-center text-sm text-slate-600">
              No QR available right now. If you expected one, force a reconnect or regenerate it.
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 text-sm text-slate-300">
          <SessionMeta label="Saved session" value={session.hasLocalSession ? "Yes" : "No"} />
          <SessionMeta label="Connected at" value={formatDateTime(status.connectedAt)} />
          <SessionMeta label="Last action" value={formatDateTime(session.lastActionAt)} />
        </div>
      </div>

      <div className="space-y-4">
        <ActionRow
          title="Reconnect"
          description="Restart the client and try to restore the current connection."
          label="Reconnect"
          busy={submitting === "session"}
          onClick={() => runSessionAction(actions.reconnect)}
        />
        <ActionRow
          title="Regenerate QR"
          description="Forces a fresh QR cycle if the current one is stale or missing."
          label="Regenerate QR"
          busy={submitting === "session"}
          onClick={() => runSessionAction(actions.regenerateQr)}
        />
        <ActionRow
          title="Logout Session"
          description="Logs out the current WhatsApp Web session but keeps the dashboard intact."
          label="Logout"
          busy={submitting === "session"}
          onClick={() => runSessionAction(actions.logout)}
        />
        <ActionRow
          title="Reset Session"
          description="Deletes the local auth cache and starts clean. Use this when the session is genuinely broken, not just because you're impatient."
          label="Reset Session"
          busy={submitting === "session"}
          onClick={() => runSessionAction(actions.resetSession)}
        />
      </div>
    </div>
  );
}

function ActionRow({ title, description, label, onClick, busy }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/55 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
        </div>

        <button className="action-button-secondary" disabled={busy} onClick={onClick}>
          {label}
        </button>
      </div>
    </div>
  );
}

function SessionMeta({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-900/50 p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm text-slate-100">{value}</p>
    </div>
  );
}
