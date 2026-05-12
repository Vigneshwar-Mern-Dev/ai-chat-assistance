"use client";

import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { RecentMessagesList } from "@/components/recent-messages-list";
import { StatCard } from "@/components/stat-card";
import { useDashboard } from "@/components/dashboard-provider";

export default function AutoReplyPage() {
  const { snapshot, actions, submitting } = useDashboard();
  const aiMessages = snapshot.recentMessages.filter((message) => message.aiReplied);

  async function handleToggle() {
    try {
      await actions.updateSettings({
        aiEnabled: !snapshot.settings.aiEnabled
      });
    } catch (error) {
      // DashboardProvider already exposes the actionable error message.
    }
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Replies"
        title="Personal Reply Controls"
        description="Direct personal chats in, natural reply out. Channels, broadcasts, groups, and brand-style replies are blocked."
        action={
          <button className="action-button w-full sm:w-auto" disabled={submitting === "settings"} onClick={handleToggle}>
            {snapshot.settings.aiEnabled ? "Disable Auto Replies" : "Enable Auto Replies"}
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Reply Status"
          value={snapshot.settings.aiEnabled ? "Enabled" : "Disabled"}
          hint="Applies only to direct personal messages"
        />
        <StatCard
          title="Delay Window"
          value={`${snapshot.settings.replyDelayMinSeconds}-${snapshot.settings.replyDelayMaxSeconds}s`}
          hint="Randomized to avoid robotic timing"
        />
        <StatCard
          title="Typing Simulation"
          value={snapshot.settings.typingSimulation ? "On" : "Off"}
          hint="Simple typing indicator before send"
        />
        <StatCard
          title="Queued Replies"
          value={snapshot.stats.pendingReplies}
          hint="Multiple incoming bubbles are grouped into one reply"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <Panel title="Current Prompt" description="This is the exact texting style used right now.">
          <div className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-950/55 p-4 text-sm leading-7 text-slate-300">
            {snapshot.settings.customPrompt}
          </div>
        </Panel>

        <Panel title="Sent Replies" description="Recent outgoing personal replies.">
          <RecentMessagesList messages={aiMessages} emptyLabel="No auto replies have been sent yet." />
        </Panel>
      </div>
    </div>
  );
}
