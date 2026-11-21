export default function Header() {
  return (
    <header className="mb-8">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Best Time to Call
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your dialing windows and reach leads at the right time.
          </p>
        </div>
      </div>
    </header>
  );
}
