"use client";

import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Settings"
        title="Personal Reply Settings"
        description="Control the direct-chat reply behavior. The app only handles one-to-one personal conversations."
      />

      <Panel title="Reply Configuration" description="Change the reply toggle, delay window, prompt, and typing behavior.">
        <SettingsForm />
      </Panel>
    </div>
  );
}
