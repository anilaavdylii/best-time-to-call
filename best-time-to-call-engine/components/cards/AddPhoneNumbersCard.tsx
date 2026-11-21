export default function AddPhoneNumbers() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Add phone numbers
      </h2>

      <p className="mt-0.5 text-sm text-slate-500">
        Paste phone numbers, one per line. Their states and time zones are
        automatically estimated.
      </p>

      <form className="mt-5 flex flex-col gap-4">
        <textarea
          rows={4}
          aria-label="Phone numbers"
          placeholder={"+1 415-555-0101\n+1 212-555-0142\n+1 312-555-0188"}
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />

        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Enter valid US phone numbers.
          </p>

          <button
            type="submit"
            className="shrink-0 rounded-xl bg-indigo-50 px-5 py-3 text-[15px] font-semibold text-blue-700 hover:bg-indigo-100"
          >
            Import numbers
          </button>
        </div>
      </form>
    </section>
  );
}
