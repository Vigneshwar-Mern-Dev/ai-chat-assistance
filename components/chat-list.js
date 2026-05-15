import { formatDateTime } from "@/lib/format";
import { useState } from "react";
import { apiRequest } from "@/lib/api";

export function ChatList({ chats }) {
  const [submitting, setSubmitting] = useState(null);

  async function handleTogglePause(chatId, isCurrentlyPaused) {
    setSubmitting(chatId);
    try {
      const endpoint = isCurrentlyPaused ? `/api/chats/${chatId}/resume` : `/api/chats/${chatId}/pause`;
      await apiRequest(endpoint, { method: "POST" });
      // The socket event will automatically update the UI state
    } catch (err) {
      console.error("Failed to toggle pause:", err);
    } finally {
      setSubmitting(null);
    }
  }

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
                    {chat.isPaused ? (
                      <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-400">
                        Human Mode
                      </span>
                    ) : null}
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
                  <div className="mt-3 flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
                    <div className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-300 border border-white/5">
                      Unread: {chat.unreadCount || 0}
                    </div>
                    
                    <button
                      onClick={() => handleTogglePause(chat.id, chat.isPaused)}
                      disabled={submitting === chat.id}
                      className={`inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition min-w-[100px] ${
                        chat.isPaused 
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' 
                        : 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      {submitting === chat.id ? "Wait..." : chat.isPaused ? "Resume AI" : "Pause AI"}
                    </button>
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
