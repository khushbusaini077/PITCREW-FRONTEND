import { SeverityBadge } from "@/components/ui/Badges";
import { fmt3 } from "@/lib/format";
import type { ComplaintCreateResponse } from "@/lib/types/models";

export function ResultCard({ result, onReset }: { result: ComplaintCreateResponse; onReset: () => void }) {
  const { pothole } = result;
  return (
    <div role="status" className="p-1">
      <h2 className="text-center text-2xl font-bold text-emerald-800">Report received</h2>
      <p className="mt-1 text-sm text-slate-600">
        {result.is_new_pothole ? "A new pothole record was created from your report." : "Your report was added to an existing pothole record nearby."}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-600">Severity bucket</dt>
          <dd className="mt-1">
            <SeverityBadge bucket={pothole.severity_bucket} />
          </dd>
        </div>
        <div>
          <dt className="text-slate-600">Severity score</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">{fmt3(pothole.severity)}</dd>
        </div>
        <div>
          <dt className="text-slate-600">Queue rank</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">#{result.queue_rank}</dd>
        </div>
        <div>
          <dt className="text-slate-600">Queue size</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums">{result.queue_size}</dd>
        </div>
      </dl>
      <div className="mt-4">
        <p className="text-sm text-slate-600">Why this severity</p>
        {pothole.severity_reasons.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {pothole.severity_reasons.map((r) => (
              <li key={r} className="rounded-md bg-slate-100 px-2 py-0.5 text-sm">
                {r}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-slate-500">No specific factors were identified from the description.</p>
        )}
      </div>
      <button type="button" onClick={onReset} className="mt-5 rounded-sm btn-grad px-4 py-2 font-medium text-white ">
        Report another issue
      </button>
    </div>
  );
}
