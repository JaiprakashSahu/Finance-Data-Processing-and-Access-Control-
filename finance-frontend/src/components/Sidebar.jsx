const navItems = ['Dashboard', 'Income & Expenses', 'Assets & Goals'];

const formatCompactCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);
};

export default function Sidebar({ months, selectedMonth, onMonthChange, netWorth }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col justify-between rounded-r-[2.5rem] bg-slate-950 px-8 py-7 text-slate-200 shadow-2xl lg:flex">
      <div className="space-y-10">
        <div className="rounded-3xl border border-cyan-500/40 bg-slate-900/80 p-6 shadow-[0_0_0_3px_rgba(45,212,191,0.12)]">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total Net Worth</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-cyan-300">
            {formatCompactCurrency(netWorth)}
          </p>
          <p className="mt-1 text-sm text-slate-400">USD</p>
        </div>

        <nav>
          <ul className="space-y-3">
            {navItems.map((item, index) => (
              <li
                key={item}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                  index === 0 ? 'bg-slate-800 text-cyan-300' : 'text-slate-400'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {item}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">Month Selector</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {months.map((month) => (
              <button
                key={month}
                type="button"
                onClick={() => onMonthChange(month)}
                className={`rounded-lg px-2 py-1.5 transition ${
                  selectedMonth === month
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-4 text-xs text-slate-400">
          <p className="font-medium text-slate-200">Personal Finance Tracker</p>
          <p className="mt-1">Fintech Analytics Panel</p>
        </div>
      </div>
    </aside>
  );
}
