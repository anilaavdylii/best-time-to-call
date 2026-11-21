const label = "mb-2 block text-[13px] font-semibold text-slate-600";
const field =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

export default function CallingPreferences() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        Calling preferences
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Set your team’s calling window
      </p>

      <form className="mt-5 flex flex-col gap-4">
        <div>
          <label htmlFor="timezone" className={label}>
            Team / base timezone
          </label>
          <select id="timezone" className={field}>
            <option>Eastern Time (ET)</option>
            <option>Central Time (CT)</option>
            <option>Mountain Time (MT)</option>
            <option>Pacific Time (PT)</option>
          </select>
        </div>

        <div>
          <label htmlFor="start" className={label}>
            Shift start time
          </label>
          <input
            id="start"
            type="time"
            defaultValue="09:00"
            className={field}
          />
          <p className="mt-2 text-xs text-slate-400">
            Shifts run 12 hours. Starting at 9:00 AM means 9:00 AM to 9:00 PM
            team time.
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-500 px-4 py-3.5 text-[15px] font-semibold text-white hover:bg-blue-600"
        >
          Apply preferences
        </button>

        <p className="text-xs text-slate-500">
          Applied · Eastern Time (ET) · 09:00–21:00
        </p>
      </form>
    </section>
  );
}
