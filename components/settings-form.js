"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard-provider";

export function SettingsForm() {
  const { snapshot, actions, submitting } = useDashboard();
  const [form, setForm] = useState(snapshot.settings);
  const [notice, setNotice] = useState("");
  const minDelay = Number(form.replyDelayMinSeconds);
  const maxDelay = Number(form.replyDelayMaxSeconds);
  const trimmedPrompt = String(form.customPrompt || "").trim();
  const formError =
    Number.isNaN(minDelay) || Number.isNaN(maxDelay)
      ? "Delay values must be valid numbers."
      : minDelay < 0 || maxDelay < 0
        ? "Delay values cannot be negative."
        : maxDelay < minDelay
          ? "Max delay must be greater than or equal to min delay."
          : !trimmedPrompt
            ? "Custom prompt cannot be empty."
            : "";

  useEffect(() => {
    setForm(snapshot.settings);
  }, [snapshot.settings]);

  function updateField(field, value) {
    setNotice("");
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");

    if (formError) {
      return;
    }

    try {
      await actions.updateSettings({
        aiEnabled: form.aiEnabled,
        typingSimulation: form.typingSimulation,
        replyDelayMinSeconds: minDelay,
        replyDelayMaxSeconds: maxDelay,
        customPrompt: trimmedPrompt
      });

      setNotice("Settings saved.");
    } catch (error) {
      // DashboardProvider already exposes the actionable error message.
      setNotice("");
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <ToggleCard
          title="Enable Auto Replies"
          description="If this is off, the app still tracks direct chats but never sends replies."
          checked={form.aiEnabled}
          onChange={(checked) => updateField("aiEnabled", checked)}
        />

        <ToggleCard
          title="Typing Simulation"
          description="Shows typing before sending a reply. It is simple, but still better than instant bot-like responses."
          checked={form.typingSimulation}
          onChange={(checked) => updateField("typingSimulation", checked)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Reply Delay Min (seconds)</label>
          <input
            className="input-field"
            min="0"
            type="number"
            value={form.replyDelayMinSeconds}
            onChange={(event) => updateField("replyDelayMinSeconds", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Reply Delay Max (seconds)</label>
          <input
            className="input-field"
            min="0"
            type="number"
            value={form.replyDelayMaxSeconds}
            onChange={(event) => updateField("replyDelayMaxSeconds", event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200">Personal Reply Prompt</label>
        <textarea
          className="textarea-field"
          value={form.customPrompt}
          onChange={(event) => updateField("customPrompt", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          Keep the prompt short and specific. Long prompts usually just make the output worse.
        </p>

        <div className="flex items-center gap-3">
          {formError ? <span className="text-sm text-red-300">{formError}</span> : null}
          {notice ? <span className="text-sm text-accent">{notice}</span> : null}
          <button className="action-button" disabled={submitting === "settings" || Boolean(formError)} type="submit">
            Save Settings
          </button>
        </div>
      </div>
    </form>
  );
}

function ToggleCard({ title, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-white/10 bg-slate-950/55 p-4 transition hover:border-slate-600">
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <input
        checked={checked}
        className="mt-1 h-5 w-5 accent-green-500"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
