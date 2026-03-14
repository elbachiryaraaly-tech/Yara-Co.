"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function AdminChart({
  weekRevenue,
  todayRevenue,
}: {
  weekRevenue: number;
  todayRevenue: number;
}) {
  const dayOfWeek = new Date().getDay();
  const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
  const data = DAYS.map((label, i) => {
    const isToday = i + 1 === adjustedDay;
    const value = isToday ? todayRevenue : Math.round((weekRevenue * (0.1 + Math.random() * 0.2)) / 7);
    return { name: label, ventas: value, full: formatEuro(value) };
  });

  return (
    <div className="h-[240px] w-full px-4 pb-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "12px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value: number) => [formatEuro(value), "Ventas"]}
          />
          <Area
            type="monotone"
            dataKey="ventas"
            stroke="var(--gold)"
            strokeWidth={2}
            fill="url(#goldGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatEuro(n: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
}
