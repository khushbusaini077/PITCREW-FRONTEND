"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtSigned } from "@/lib/format";
import type { Comparison } from "@/lib/types/models";

const GREEDY = "#2563eb";
const FCFS = "#94a3b8";

export function ComparisonPanel({ comparison }: { comparison: Comparison }) {
  const { greedy: g, fcfs: f, improvement: imp } = comparison;
  const outcomes = [
    { metric: "High-severity fixed", Greedy: g.fixed_high_severity, FCFS: f.fixed_high_severity },
    { metric: "School-zone high-severity fixed", Greedy: g.fixed_school_zone_high_severity, FCFS: f.fixed_school_zone_high_severity },
    { metric: "Total fixed", Greedy: g.fixed_total, FCFS: f.fixed_total },
  ];
  const minutes = [
    { metric: "Travel minutes", Greedy: g.total_travel_minutes, FCFS: f.total_travel_minutes },
    { metric: "Avg wait, high severity (min)", Greedy: g.avg_wait_high_severity_minutes, FCFS: f.avg_wait_high_severity_minutes },
  ];
  const rows = [
    { label: "High-severity fixed", g: `${g.fixed_high_severity} / ${g.high_severity_total}`, f: `${f.fixed_high_severity} / ${f.high_severity_total}`, d: fmtSigned(imp.fixed_high_severity_delta) },
    {
      label: "School-zone high-severity fixed",
      g: `${g.fixed_school_zone_high_severity} / ${g.school_zone_high_severity_total}`,
      f: `${f.fixed_school_zone_high_severity} / ${f.school_zone_high_severity_total}`,
      d: fmtSigned(imp.fixed_school_zone_high_severity_delta),
    },
    { label: "Severity-weighted coverage", g: `${(g.severity_weighted_coverage * 100).toFixed(1)}%`, f: `${(f.severity_weighted_coverage * 100).toFixed(1)}%`, d: fmtSigned(imp.coverage_delta_points, " pts") },
    { label: "Travel minutes", g: g.total_travel_minutes.toFixed(1), f: f.total_travel_minutes.toFixed(1), d: `${fmtSigned(imp.travel_reduction_pct, "%")} reduction` },
    { label: "Avg wait, high severity (min)", g: g.avg_wait_high_severity_minutes.toFixed(1), f: f.avg_wait_high_severity_minutes.toFixed(1), d: `${fmtSigned(imp.avg_wait_reduction_pct, "%")} reduction` },
  ];

  const chart = (data: typeof outcomes, label: string) => (
    <div className="h-56" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="metric" tick={{ fontSize: 11 }} interval={0} />
          <YAxis width={36} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Greedy" fill={GREEDY} />
          <Bar dataKey="FCFS" fill={FCFS} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="rounded-sm bg-slate-900 p-5 text-white">
        <p className="text-sm text-slate-300">High-severity potholes fixed in one shift ({comparison.crew_count} crews)</p>
        <div className="mt-2 flex flex-wrap items-end gap-x-8 gap-y-2">
          <div>
            <p className="text-5xl font-semibold tabular-nums" style={{ color: "#93c5fd" }}>
              {g.fixed_high_severity}
            </p>
            <p className="text-sm">Greedy scheduler</p>
          </div>
          <div>
            <p className="text-5xl font-semibold tabular-nums text-slate-300">{f.fixed_high_severity}</p>
            <p className="text-sm">First-come-first-served</p>
          </div>
          <p className="pb-1 text-lg font-medium">{fmtSigned(imp.fixed_high_severity_delta)} with greedy</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {chart(outcomes, "Bar chart comparing greedy and FCFS fixed counts")}
        {chart(minutes, "Bar chart comparing greedy and FCFS travel and wait minutes")}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-600">
            <tr>
              <th scope="col" className="py-2 pr-2 font-medium">Metric</th>
              <th scope="col" className="px-2 py-2 font-medium">Greedy</th>
              <th scope="col" className="px-2 py-2 font-medium">FCFS</th>
              <th scope="col" className="px-2 py-2 font-medium">Improvement</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-slate-100">
                <th scope="row" className="py-2 pr-2 font-normal">{r.label}</th>
                <td className="px-2 py-2 tabular-nums">{r.g}</td>
                <td className="px-2 py-2 tabular-nums">{r.f}</td>
                <td className="px-2 py-2 font-medium tabular-nums">{r.d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
