type Props = {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
};

// Switch: also fill callable states that have no leads.
export default function LeadsSwitch({ checked, disabled, onToggle }: Props) {
  return (
    <div className="mt-3 flex justify-end">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className={`relative h-5 w-9 rounded-full transition-colors ${
            checked ? "bg-emerald-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-4" : ""
            }`}
          />
        </span>
        Include states without leads
      </button>
    </div>
  );
}
