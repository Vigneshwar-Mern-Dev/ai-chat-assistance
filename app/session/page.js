"use client";

import { Panel } from "@/components/panel";
import { PageIntro } from "@/components/page-intro";
import { SessionPanel } from "@/components/session-panel";

export default function SessionPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Session"
        title="QR Login & Session Control"
        description="Connect WhatsApp, regenerate the QR when needed, or wipe the session clean when the local auth state gets corrupted."
      />

      <Panel title="Session Management" description="Everything important for QR auth and connection recovery in one place.">
        <SessionPanel />
      </Panel>
    </div>
  );
}
