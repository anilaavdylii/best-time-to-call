type Props = {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
};

export default function LeadsSwitch({ checked, disabled, onToggle }: Props) {
  // Always show ON when the switch is disabled.
  const isChecked = disabled || checked;

  return (
    <div className="mt-3 flex justify-end">
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={onToggle}
        className="flex items-center gap-2 text-sm text-slate-700 disabled:cursor-not-allowed"
      >
        <span
          className={`relative h-5 w-9 rounded-full transition-colors ${
            isChecked ? "bg-emerald-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              isChecked ? "translate-x-4" : ""
            }`}
          />
        </span>
        Include states without leads
      </button>
    </div>
  );
}
