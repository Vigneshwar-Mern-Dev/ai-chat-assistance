import { formatDateTime } from "@/lib/format";

export function ChatList({ chats }) {
  if (!chats?.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-sm text-slate-400">
        No chats available yet. Connect WhatsApp first.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className="rounded-lg border border-white/10 bg-slate-950/55 p-4 transition hover:border-slate-600"
        >
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm font-semibold text-accent">
              {getInitials(chat.name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">{chat.name}</p>
                    {chat.pendingReply ? (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                        Queued {chat.pendingReplyCount > 1 ? `(${chat.pendingReplyCount})` : ""}
                      </span>
                    ) : null}
                    {chat.aiReplied ? (
                      <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                        Reply sent
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Waiting
                      </span>
                    )}
                  </div>
                  <p className="mt-3 truncate text-sm leading-6 text-slate-300">
                    {chat.lastMessage || "No message preview yet."}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {formatDateTime(chat.lastMessageAt)}
                  </p>
                  <div className="mt-3 inline-flex rounded-lg bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
                    Unread: {chat.unreadCount || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getInitials(value) {
  return String(value || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}
