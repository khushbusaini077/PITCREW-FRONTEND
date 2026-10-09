export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex overflow-hidden rounded-sm border border-slate-300 bg-white">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-sm font-medium ${o.value === value ? "btn-grad" : "text-slate-700 hover:bg-slate-100"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
