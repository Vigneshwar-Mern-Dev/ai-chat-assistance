export function Panel({ title, description, children }) {
  return (
    <section className="panel-soft p-4 sm:p-5">
      <div className="mb-4 border-b border-white/10 pb-4">
        <p className="text-lg font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      {children}
    </section>
  );
}
