import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function ChartSection({ trends }) {
  const sortedTrends = Array.isArray(trends)
    ? [...trends].sort((a, b) => new Date(a.month) - new Date(b.month))
    : [];

  const maxIncome = Math.max(...sortedTrends.map((point) => point.income), 0);
  const maxExpense = Math.max(...sortedTrends.map((point) => point.expense), 0);

  if (sortedTrends.length === 0) {
    return (
      <section className="min-w-0 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="mb-2">
          <p className="text-lg font-semibold text-slate-900">Income & Expenses</p>
          <p className="text-sm text-slate-500">Monthly trend overview</p>
        </div>
        <div className="grid h-72 place-items-center rounded-2xl bg-slate-50 text-sm text-slate-600">
          No data available for chart rendering.
        </div>
      </section>
    );
  }

  return (
    <section className="min-w-0 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">Income & Expenses</p>
          <p className="text-sm text-slate-500">Monthly trend overview</p>
        </div>
        <div className="flex gap-8 text-sm">
          <div>
            <p className="text-slate-500">Max Expenses</p>
            <p className="font-semibold text-rose-500">{currency.format(maxExpense)}</p>
          </div>
          <div>
            <p className="text-slate-500">Max Income</p>
            <p className="font-semibold text-teal-600">{currency.format(maxIncome)}</p>
          </div>
        </div>
      </div>

      <div className="h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={sortedTrends} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
            <YAxis stroke="#64748B" fontSize={12} width={48} />
            <Tooltip
              formatter={(value) => currency.format(Number(value))}
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid #CBD5E1',
                boxShadow: '0 16px 30px -18px rgba(15, 23, 42, 0.35)',
              }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#0D9488"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#E11D48"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
