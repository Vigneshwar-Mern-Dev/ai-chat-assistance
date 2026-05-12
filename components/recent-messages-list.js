import { classes } from "@/lib/classes";
import { formatDateTime } from "@/lib/format";

export function RecentMessagesList({ messages, emptyLabel = "No messages yet." }) {
  if (!messages?.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-sm text-slate-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className="rounded-lg border border-white/10 bg-slate-950/55 p-4"
        >
          <div className="flex gap-4">
            <div
              className={classes(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                message.direction === "incoming"
                  ? "bg-sky-500/10 text-sky-300"
                  : "bg-accent/10 text-accent"
              )}
            >
              {message.direction === "incoming" ? "IN" : "ME"}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{message.chatName}</p>
                    <span
                      className={classes(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                        message.direction === "incoming"
                          ? "bg-sky-500/10 text-sky-300"
                          : "bg-accent/10 text-accent"
                      )}
                    >
                      {message.direction}
                    </span>
                    {message.aiReplied ? (
                      <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                        Reply sent
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 break-words text-sm leading-6 text-slate-300">{message.body}</p>
                </div>

                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {formatDateTime(message.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
