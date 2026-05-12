"use client";

import { useDeferredValue, useState } from "react";
import { ChatList } from "@/components/chat-list";
import { classes } from "@/lib/classes";
import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { RecentMessagesList } from "@/components/recent-messages-list";
import { useDashboard } from "@/components/dashboard-provider";

export default function ChatsPage() {
  const { snapshot } = useDashboard();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredChats = snapshot.chats.filter((chat) => {
    const matchesQuery =
      !normalizedQuery ||
      chat.name?.toLowerCase().includes(normalizedQuery) ||
      chat.lastMessage?.toLowerCase().includes(normalizedQuery);

    if (!matchesQuery) {
      return false;
    }

    if (filter === "unread") {
      return (chat.unreadCount || 0) > 0;
    }

    if (filter === "pending") {
      return Boolean(chat.pendingReply);
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Chats"
        title="Personal Conversations"
        description="Direct one-to-one chats only. Groups, channels, newsletters, broadcasts, and status threads are ignored."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Panel title="Chats" description="Last active direct chats with unread counts and reply status.">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <input
              className="input-field lg:max-w-sm"
              placeholder="Search by name or message"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            <div className="flex flex-wrap gap-2">
              <FilterButton active={filter === "all"} label={`All (${snapshot.chats.length})`} onClick={() => setFilter("all")} />
              <FilterButton
                active={filter === "unread"}
                label={`Unread (${snapshot.stats.unreadChats})`}
                onClick={() => setFilter("unread")}
              />
              <FilterButton
                active={filter === "pending"}
                label={`Queued (${snapshot.stats.pendingReplies})`}
                onClick={() => setFilter("pending")}
              />
            </div>
          </div>

          <ChatList chats={filteredChats} />
        </Panel>

        <Panel title="Latest Messages" description="Quick feed of the newest incoming and outgoing messages.">
          <RecentMessagesList messages={snapshot.recentMessages} />
        </Panel>
      </div>
    </div>
  );
}

function FilterButton({ active, label, onClick }) {
  return (
    <button
      className={classes(
        "rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
        active
          ? "border-accent/40 bg-accentSoft text-white"
          : "border-white/10 bg-slate-950/40 text-slate-300 hover:border-slate-400 hover:text-white"
      )}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
