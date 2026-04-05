import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import RoleSelector from '../components/RoleSelector';
import api from '../services/api';
import { getStoredRole } from '../services/roleStorage';
import { unwrapData } from '../services/response';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const buildProgress = (current, target) => {
  const safeTarget = Math.max(Number(target) || 0, 1);
  const safeCurrent = Math.max(Number(current) || 0, 0);
  const percentage = Math.min((safeCurrent / safeTarget) * 100, 100);

  return {
    current: safeCurrent,
    target: safeTarget,
    percentage,
  };
};

export default function AssetsGoals() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [activeRole, setActiveRole] = useState(getStoredRole());
  const [categoryWise, setCategoryWise] = useState({ expense: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const requestConfig = {
          headers: {
            'x-user-role': activeRole,
          },
        };

        const [summaryRes, categoryRes] = await Promise.all([
          api.get('/api/dashboard/summary', requestConfig),
          api.get('/api/dashboard/category-wise', requestConfig),
        ]);

        const summaryData = unwrapData(summaryRes) || {};
        const categoryData = unwrapData(categoryRes) || {};

        setSummary({
          totalIncome: Number(summaryData.totalIncome) || 0,
          totalExpense: Number(summaryData.totalExpense) || 0,
          netBalance: Number(summaryData.netBalance) || 0,
        });
        setCategoryWise({ expense: categoryData.expense || {} });
      } catch (requestError) {
        setError(requestError?.response?.data?.error || 'Unable to load assets and goals data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeRole]);

  const assets = useMemo(() => {
    const balance = Math.max(summary.netBalance, 0);

    return [
      { label: 'Gold', value: balance * 0.18, tint: 'from-amber-300 to-amber-500' },
      { label: 'Stock', value: balance * 0.37, tint: 'from-cyan-400 to-blue-500' },
      { label: 'Land', value: balance * 0.3, tint: 'from-emerald-400 to-emerald-600' },
      { label: 'Liquidity', value: balance * 0.15, tint: 'from-slate-400 to-slate-600' },
    ];
  }, [summary.netBalance]);

  const goals = useMemo(() => {
    const emergency = buildProgress(summary.netBalance, summary.totalExpense * 6);
    const investment = buildProgress(summary.totalIncome * 0.45, summary.totalIncome * 1.2);
    const travel = buildProgress(summary.netBalance * 0.1, 20000);

    return [
      { key: 'emergency', label: 'Emergency Fund', detail: 'Target: 6 months of expenses', ...emergency },
      { key: 'investment', label: 'Investment Portfolio', detail: 'Target: 120% of annualized income', ...investment },
      { key: 'travel', label: 'Travel Goal', detail: 'Target: Long-term lifestyle reserve', ...travel },
    ];
  }, [summary]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <p className="rounded-xl bg-white px-6 py-4 text-slate-700 shadow-sm">Loading assets and goals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-5">
        <div className="max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-rose-200">
          <p className="text-lg font-semibold text-rose-600">Assets & Goals failed to load</p>
          <p className="mt-2 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar netWorth={summary.netBalance} />

      <main className="px-4 pb-10 pt-4 lg:ml-72 lg:px-8 lg:pt-6">
        <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-fuchsia-50/90">Wealth Planning</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Assets & Goals</h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <RoleSelector onRoleChanged={setActiveRole} />
              <div className="rounded-xl bg-slate-900/30 px-4 py-2 text-right backdrop-blur">
                <p className="text-sm">Net Balance</p>
                <p className="text-xl font-semibold">{currency.format(summary.netBalance)}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {assets.map((asset) => (
            <article
              key={asset.label}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60"
            >
              <p className="text-sm text-slate-500">{asset.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{currency.format(asset.value)}</p>
              <div className={`mt-4 h-2 rounded-full bg-gradient-to-r ${asset.tint}`} />
            </article>
          ))}
        </section>

        <section className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900">Goal Progress</p>
              <p className="text-sm text-slate-500">Track milestone progress against your financial targets</p>
            </div>
          </div>

          <div className="space-y-5">
            {goals.map((goal) => (
              <div key={goal.key}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{goal.label}</p>
                    <p className="text-xs text-slate-500">{goal.detail}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    {currency.format(goal.current)} / {currency.format(goal.target)}
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    style={{ width: `${goal.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
          <p className="text-lg font-semibold text-slate-900">Expense Exposure Snapshot</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {Object.entries(categoryWise.expense || {}).map(([category, value]) => (
              <div key={category} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-sm capitalize text-slate-600">{category}</p>
                <p className="text-lg font-semibold text-slate-900">{currency.format(Number(value) || 0)}</p>
              </div>
            ))}
            {Object.keys(categoryWise.expense || {}).length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No category-wise expense data available.
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
