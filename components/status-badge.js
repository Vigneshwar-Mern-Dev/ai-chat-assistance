import { classes } from "@/lib/classes";

const statusStyles = {
  connected: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  reconnecting: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  disconnected: "border-red-500/30 bg-red-500/10 text-red-300"
};

export function StatusBadge({ status }) {
  const normalizedStatus = status || "disconnected";

  return (
    <div
      className={classes(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
        statusStyles[normalizedStatus] || statusStyles.disconnected
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      <span>{normalizedStatus}</span>
    </div>
  );
}
