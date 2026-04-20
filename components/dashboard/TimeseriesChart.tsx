"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimeseriesBucket } from "@/lib/actions/dashboard-query";

type TooltipPayloadEntry = {
  name?: string;
  value?: number;
  color?: string;
  dataKey?: string;
};

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const success = Number(
    payload.find((p) => p.dataKey === "success")?.value ?? 0,
  );
  const failed = Number(
    payload.find((p) => p.dataKey === "failed")?.value ?? 0,
  );
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-sm bg-emerald-500" />
        <span className="text-muted-foreground">성공</span>
        <span className="ml-auto font-medium">{success}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-sm bg-red-500" />
        <span className="text-muted-foreground">실패</span>
        <span className="ml-auto font-medium">{failed}</span>
      </div>
      <div className="mt-1 pt-1 border-t flex items-center gap-2">
        <span className="text-muted-foreground">합계</span>
        <span className="ml-auto font-medium">{success + failed}</span>
      </div>
    </div>
  );
};

export const TimeseriesChart = ({
  data,
}: {
  data: TimeseriesBucket[];
}) => (
  <div className="relative h-[280px] w-full">
    <ResponsiveContainer width="100%" height="100%" debounce={1}>
      <BarChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="currentColor"
          strokeOpacity={0.1}
        />
        <XAxis
          dataKey="bucket"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="currentColor"
          strokeOpacity={0.5}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          stroke="currentColor"
          strokeOpacity={0.5}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.1)" }}
          wrapperStyle={{ outline: "none" }}
          allowEscapeViewBox={{ x: false, y: false }}
          isAnimationActive={false}
          content={<ChartTooltip />}
        />
        <Bar dataKey="success" stackId="s" fill="#10b981" radius={[0, 0, 0, 0]} />
        <Bar dataKey="failed" stackId="s" fill="#ef4444" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
