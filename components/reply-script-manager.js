"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

const emptyForm = {
  intent: "",
  enabled: true,
  keywords: "",
  replies: ""
};

function listToText(items) {
  return Array.isArray(items) ? items.join("\n") : "";
}

function normalizeIntent(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_ -]/g, "")
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function textToList(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ReplyScriptManager() {
  const [scripts, setScripts] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const scriptEntries = useMemo(() => Object.entries(scripts).sort(([left], [right]) => left.localeCompare(right)), [scripts]);
  const normalizedIntent = normalizeIntent(form.intent);
  const replies = textToList(form.replies);
  const formError = !normalizedIntent
    ? "Intent is required."
    : !replies.length
      ? "Add at least one reply."
      : "";

  useEffect(() => {
    let mounted = true;

    async function loadScripts() {
      try {
        const response = await apiRequest("/api/reply-scripts");

        if (mounted) {
          setScripts(response.scripts || {});
          setError("");
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadScripts();

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(field, value) {
    setNotice("");
    setError("");
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function loadScript(intent, script) {
    setNotice("");
    setError("");
    setForm({
      intent,
      enabled: script.enabled !== false,
      keywords: listToText(script.keywords),
      replies: listToText(script.replies)
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice("");
    setError("");

    if (formError) {
      return;
    }

    setSubmitting("save");

    try {
      const response = await apiRequest(`/api/reply-scripts/${encodeURIComponent(normalizedIntent)}`, {
        method: "PUT",
        body: JSON.stringify({
          enabled: form.enabled,
          keywords: textToList(form.keywords),
          replies
        })
      });

      setScripts(response.scripts || {});
      setForm((current) => ({
        ...current,
        intent: normalizedIntent
      }));
      setNotice("Reply script saved.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting("");
    }
  }

  async function deleteScript(intent) {
    if (!window.confirm(`Delete reply script "${intent}"?`)) {
      return;
    }

    setNotice("");
    setError("");
    setSubmitting(intent);

    try {
      const response = await apiRequest(`/api/reply-scripts/${encodeURIComponent(intent)}`, {
        method: "DELETE"
      });

      setScripts(response.scripts || {});

      if (normalizeIntent(form.intent) === intent) {
        setForm(emptyForm);
      }

      setNotice("Reply script deleted.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting("");
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Intent Name</label>
            <input
              className="input-field"
              placeholder="ask_price"
              value={form.intent}
              onChange={(event) => updateField("intent", event.target.value)}
            />
            {normalizedIntent && normalizedIntent !== form.intent ? (
              <p className="mt-2 text-xs text-slate-500">Will save as {normalizedIntent}</p>
            ) : null}
          </div>

          <label className="flex h-11 items-center gap-3 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-sm text-slate-200">
            <input
              checked={form.enabled}
              className="h-5 w-5 accent-green-500"
              type="checkbox"
              onChange={(event) => updateField("enabled", event.target.checked)}
            />
            Enabled
          </label>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Keywords</label>
          <textarea
            className="textarea-field min-h-28"
            placeholder={"price\ncost\nhow much"}
            value={form.keywords}
            onChange={(event) => updateField("keywords", event.target.value)}
          />
          <p className="mt-2 text-xs text-slate-500">One keyword per line. Keywords are checked before AI classification.</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">Exact Replies</label>
          <textarea
            className="textarea-field"
            placeholder={"Requirement konjam clear ah sollunga, correct price solren.\nWhat exactly do you need? Based on that price confirm panren."}
            value={form.replies}
            onChange={(event) => updateField("replies", event.target.value)}
          />
          <p className="mt-2 text-xs text-slate-500">One reply per line. The bot randomly picks one reply for the matched intent.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            {formError ? <span className="text-red-300">{formError}</span> : null}
            {error ? <span className="text-red-300">{error}</span> : null}
            {notice ? <span className="text-accent">{notice}</span> : null}
          </div>

          <div className="flex gap-3">
            <button className="action-button-secondary" type="button" onClick={() => setForm(emptyForm)}>
              New Script
            </button>
            <button className="action-button" disabled={submitting === "save" || Boolean(formError)} type="submit">
              {submitting === "save" ? "Saving..." : "Save Script"}
            </button>
          </div>
        </div>
      </form>

      <aside className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-white">Saved Scripts</p>
          <span className="text-xs text-slate-500">{scriptEntries.length} total</span>
        </div>

        {loading ? <p className="text-sm text-slate-400">Loading scripts...</p> : null}

        {!loading && !scriptEntries.length ? (
          <p className="rounded-lg border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-400">
            No scripts yet. Add one on the left.
          </p>
        ) : null}

        {scriptEntries.map(([intent, script]) => (
          <div key={intent} className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{intent}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {script.enabled === false ? "Disabled" : "Enabled"} · {(script.keywords || []).length} keywords · {(script.replies || []).length} replies
                </p>
              </div>
              <span className={`rounded px-2 py-1 text-xs ${script.enabled === false ? "bg-slate-800 text-slate-400" : "bg-green-500/10 text-green-300"}`}>
                {script.enabled === false ? "Off" : "On"}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="action-button-secondary flex-1 px-3 py-2 text-xs" type="button" onClick={() => loadScript(intent, script)}>
                Edit
              </button>
              <button
                className="action-button-secondary px-3 py-2 text-xs text-red-200 hover:border-red-400"
                disabled={submitting === intent}
                type="button"
                onClick={() => deleteScript(intent)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </aside>
    </div>
  );
}
