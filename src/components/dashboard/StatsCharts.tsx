"use client";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { SEVERITY_COLORS, SEVERITY_ORDER } from "@/lib/constants";
import type { Stats } from "@/lib/types/models";

export function StatsCharts({ stats }: { stats: Stats }) {
  const bucketData = SEVERITY_ORDER.map((b) => ({ name: b, count: stats.by_bucket[b], fill: SEVERITY_COLORS[b] }));
  const sourceData = [
    { name: "Citizen report", count: stats.by_source.complaint },
    { name: "Sensor", count: stats.by_source.sensor },
    { name: "Both", count: stats.by_source.both },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Open potholes by severity">
        <div className="h-52" role="img" aria-label="Bar chart of open potholes by severity bucket">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bucketData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip />
              <Bar dataKey="count" name="Potholes">
                {bucketData.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Open potholes by source">
        <div className="h-52" role="img" aria-label="Bar chart of open potholes by detection source">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip />
              <Bar dataKey="count" name="Potholes" fill="#475569" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
