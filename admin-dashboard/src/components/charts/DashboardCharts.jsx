import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#004d40", "#c9a227", "#0d7a68", "#f43f5e", "#3b82f6"];
const chartTick = { fontSize: 11, fill: "var(--admin-chart-text)" };

export function TrendChart({ data }) {
  const grid = "var(--admin-chart-grid)";

  return (
    <div className="admin-card h-[320px] p-4">
      <h3 className="mb-4 text-sm font-bold">Bookings & revenue (14 days)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c9a227" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#c9a227" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#004d40" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#004d40" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={chartTick} />
          <YAxis yAxisId="left" tick={chartTick} />
          <YAxis yAxisId="right" orientation="right" tick={chartTick} />
          <Tooltip
            contentStyle={{
              background: "var(--admin-bg-elevated)",
              border: "1px solid var(--admin-border)",
              borderRadius: 8,
              color: "var(--admin-text)",
            }}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="bookings"
            stroke="#004d40"
            fill="url(#bookGrad)"
            name="Bookings"
          />
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#c9a227"
            fill="url(#revGrad)"
            name="Revenue (EGP)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPieChart({ data, title }) {
  if (!data?.length) {
    return (
      <div className="admin-card flex h-[280px] items-center justify-center p-4 text-sm text-[var(--admin-text-muted)]">
        {title}: no data
      </div>
    );
  }

  return (
    <div className="admin-card h-[280px] p-4">
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueBarChart({ data }) {
  const grid = "var(--admin-chart-grid)";

  return (
    <div className="admin-card h-[280px] p-4">
      <h3 className="mb-4 text-sm font-bold">Revenue by payment (selected day)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid stroke={grid} strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={chartTick} />
          <YAxis tick={chartTick} />
          <Tooltip
            contentStyle={{
              background: "var(--admin-bg-elevated)",
              border: "1px solid var(--admin-border)",
              borderRadius: 8,
              color: "var(--admin-text)",
            }}
          />
          <Bar dataKey="value" fill="#004d40" radius={[8, 8, 0, 0]} name="EGP" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
