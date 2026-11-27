"use client";

import { importNumbers } from "@/lib/importNumbers";
import { ImportResult } from "@/lib/phone";
import { useState, useTransition, type FormEvent } from "react";

export default function AddPhoneNumbers() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const lineCount = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean).length;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!text.trim()) return;
    setFailed(false);

    startTransition(async () => {
      try {
        const res = await importNumbers(text);
        setResult(res);
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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-colors">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="import-panel"
          className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/80"
        >
          <div className="flex items-center gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M10 4v12M4 10h12" />
              </svg>
            </span>

            <div>
              <span className="block text-sm font-semibold text-slate-900">
                Add your leads
              </span>
              <span className="block text-xs text-slate-500">
                Paste US phone numbers to auto-detect states &amp; time zones
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            {result && result.added > 0 && !open && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                +{result.added} added
              </span>
            )}

            <span className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors group-hover:bg-slate-100 group-hover:text-slate-600">
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${
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
            </span>
          </div>
        </button>
      </h2>

      {open && (
        <div
          id="import-panel"
          className="border-t border-slate-100 bg-slate-50/50 px-5 pb-5 pt-4"
        >
          <form onSubmit={submit} className="flex flex-col gap-3.5">
            <div className="relative">
              <textarea
                rows={4}
                aria-label="Phone numbers"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  "+1 415-555-0101\n+1 212-555-0142, NY\n+1 312-555-0188"
                }
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 font-mono text-sm leading-relaxed text-slate-900 shadow-2xs placeholder:font-sans placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />

              {lineCount > 0 && (
                <span className="pointer-events-none absolute bottom-2.5 right-3 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-600">
                  {lineCount} {lineCount === 1 ? "line" : "lines"}
                </span>
              )}
            </div>

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs leading-relaxed text-slate-500">
                One US number per line. Override a state after a comma:{" "}
                <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
                  +1 415-555-0101, CA
                </code>
              </p>

              <div className="flex shrink-0 items-center gap-2">
                {text.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setText("");
                      setResult(null);
                      setFailed(false);
                    }}
                    className="rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-700"
                  >
                    Clear
                  </button>
                )}

                <button
                  type="submit"
                  disabled={pending || !text.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {pending ? "Importing…" : "Import numbers"}
                </button>
              </div>
            </div>

            <div aria-live="polite" className="empty:hidden">
              {failed && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                  Something went wrong while importing. Please try again.
                </div>
              )}

              {result && !failed && (
                <div className="space-y-2">
                  <div
                    className={`flex flex-wrap items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
                      result.added > 0
                        ? "border-emerald-200 bg-emerald-50/80 text-emerald-800"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <span>
                      Imported{" "}
                      <strong className="font-semibold">{result.added}</strong>{" "}
                      number{result.added === 1 ? "" : "s"}
                    </span>
                    {result.alreadySaved > 0 && (
                      <span className="text-slate-500">
                        · {result.alreadySaved} already saved
                      </span>
                    )}
                    {result.repeated > 0 && (
                      <span className="text-slate-500">
                        · {result.repeated} repeated
                      </span>
                    )}
                    {result.invalid.length > 0 && (
                      <span className="text-rose-600">
                        · {result.invalid.length} skipped
                      </span>
                    )}
                  </div>

                  {shown.length > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2.5 text-xs text-rose-700">
                      <p className="font-semibold text-rose-800">
                        Fix these lines and re-import:
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {shown.map((x) => (
                          <li key={`${x.line}-${x.raw}`}>
                            {x.line > 0 ? `Line ${x.line}: ` : ""}
                            {x.raw && (
                              <span className="font-mono font-medium">
                                {x.raw}
                              </span>
                            )}
                            {x.raw && " — "}
                            {x.reason}
                          </li>
                        ))}
                        {hidden > 0 && (
                          <li className="text-rose-600">…and {hidden} more.</li>
                        )}
                      </ul>
                    </div>
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
