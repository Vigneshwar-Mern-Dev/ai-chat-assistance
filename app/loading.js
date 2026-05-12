export default function Loading() {
  return (
    <div className="mx-auto min-h-screen max-w-[1480px] p-3 sm:p-4 lg:p-6">
      <div className="panel flex min-h-[calc(100vh-1.5rem)] items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-lg border border-white/10 bg-slate-950/60 p-8 text-center shadow-glow">
          <div className="mx-auto h-12 w-12 animate-pulse rounded-lg bg-accent/20" />
          <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-slate-500">Loading</p>
          <h1 className="mt-3 text-2xl font-semibold text-white">Preparing Chats</h1>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            The UI should appear first. WhatsApp connection work continues in the background.
          </p>
        </div>
      </div>
    </div>
  );
}
