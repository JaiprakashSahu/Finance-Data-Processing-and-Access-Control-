const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function SummaryCards({ summary, selectedMonthData }) {
  const assets = [
    { label: 'Gold', value: Math.max(summary.netBalance * 0.12, 0) },
    { label: 'Stock', value: Math.max(summary.netBalance * 0.33, 0) },
    { label: 'Land', value: Math.max(summary.netBalance * 0.4, 0) },
    { label: 'Liquidity', value: Math.max(summary.netBalance * 0.15, 0) },
  ];

  const incomeTarget = Math.max(summary.totalIncome * 1.25, 1);
  const progress = Math.min((summary.totalIncome / incomeTarget) * 100, 100);

  return (
    <section className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
      <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Available balance</p>
            <p className="text-4xl font-semibold tracking-tight text-slate-900">
              {currency.format(summary.netBalance)}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-widest text-slate-500">{selectedMonthData.month}</p>
            <p className="text-lg font-semibold text-slate-800">
              {currency.format(selectedMonthData.income - selectedMonthData.expense)}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Income Goal</p>
              <p className="text-xs text-slate-500">Progress this period</p>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {currency.format(summary.totalIncome)} / {currency.format(incomeTarget)}
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <p className="text-lg font-semibold text-slate-900">Assets</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {assets.map((asset) => (
            <div key={asset.label}>
              <p className="text-sm text-slate-500">{asset.label}</p>
              <p className="text-xl font-semibold text-slate-800">{currency.format(asset.value)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
