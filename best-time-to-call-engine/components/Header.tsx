export default function Header() {
  return (
    <header className="mb-8 border-b border-slate-200 pb-6">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-6 w-1 shrink-0 rounded-full bg-emerald-600" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Best Time to Call
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Prioritize the right states at the right local hour to maximize live
            connections.
          </p>
        </div>
      </div>
    </header>
  );
}
