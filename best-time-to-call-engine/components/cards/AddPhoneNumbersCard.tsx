"use client";

import { importNumbers } from "@/lib/importNumbers";
import { ImportResult } from "@/lib/phone";
import { useState, useTransition, type FormEvent } from "react";

export default function AddPhoneNumbers() {
  const [open, setOpen] = useState(false); // collapsed by default
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    setFailed(false);

    startTransition(async () => {
      try {
        const res = await importNumbers(text);
        setResult(res);
        // Keep only the lines that need fixing, so the user can correct them.
        setText(
          res.invalid
            .map((x) => x.raw)
            .filter(Boolean)
            .join("\n"),
        );
      } catch {
        setFailed(true);
      }
    });
  }

  const shown = result?.invalid.slice(0, 5) ?? [];
  const hidden = (result?.invalid.length ?? 0) - shown.length;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="import-panel"
          className="flex w-full items-center justify-between gap-4 text-left text-lg font-semibold text-slate-900"
        >
          Add your leads
          <svg
            className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 7.5l5 5 5-5" />
          </svg>
        </button>
      </h2>

      {open && (
        <div id="import-panel">
          <p className="mt-0.5 text-sm text-slate-500">
            Paste phone numbers, one per line. Their states and time zones are
            automatically estimated.
          </p>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            <textarea
              rows={4}
              aria-label="Phone numbers"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"+1 415-555-0101\n+1 212-555-0142\n+1 312-555-0188"}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                Enter valid US phone numbers. To set the state yourself, add it
                after a comma, like “+1 415-555-0101, CA”.
              </p>

              <button
                type="submit"
                disabled={pending || !text.trim()}
                className="shrink-0 rounded-xl bg-indigo-50 px-5 py-3 text-[15px] font-semibold text-blue-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Importing…" : "Import numbers"}
              </button>
            </div>

            <div aria-live="polite">
              {failed && (
                <p className="text-sm text-rose-600">
                  Something went wrong. Please try again.
                </p>
              )}

              {result && !failed && (
                <div className="flex flex-col gap-2 text-sm">
                  <p
                    className={
                      result.added > 0 ? "text-emerald-700" : "text-slate-600"
                    }
                  >
                    Imported {result.added} number
                    {result.added === 1 ? "" : "s"}
                    {result.alreadySaved > 0 &&
                      ` · ${result.alreadySaved} already saved`}
                    {result.repeated > 0 && ` · ${result.repeated} repeated`}
                    {result.invalid.length > 0 &&
                      ` · ${result.invalid.length} skipped`}
                  </p>

                  {shown.length > 0 && (
                    <ul className="flex flex-col gap-1 text-rose-600">
                      {shown.map((x) => (
                        <li key={`${x.line}-${x.raw}`}>
                          {x.line > 0 ? `Line ${x.line}: ` : ""}
                          {x.raw && (
                            <span className="font-medium">{x.raw}</span>
                          )}
                          {x.raw && " - "}
                          {x.reason}
                        </li>
                      ))}
                      {hidden > 0 && <li>…and {hidden} more.</li>}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
