import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import SummaryCards from '../components/SummaryCards';
import ChartSection from '../components/ChartSection';
import CategoryCards from '../components/CategoryCards';
import { api, unwrapData } from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [trends, setTrends] = useState([]);
  const [categoryWise, setCategoryWise] = useState({ expense: {} });
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [summaryRes, trendRes, categoryRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/trends'),
          api.get('/dashboard/category-wise'),
        ]);

        const summaryData = unwrapData(summaryRes) || {};
        const trendData = unwrapData(trendRes) || [];
        const categoryData = unwrapData(categoryRes) || {};

        setSummary({
          totalIncome: toNumber(summaryData.totalIncome),
          totalExpense: toNumber(summaryData.totalExpense),
          netBalance: toNumber(summaryData.netBalance),
        });

        const safeTrendData = MONTHS.map((month) => {
          const found = trendData.find((item) => item.month === month) || {};
          return {
            month,
            income: toNumber(found.income),
            expense: toNumber(found.expense),
          };
        });

        setTrends(safeTrendData);
        setCategoryWise({ expense: categoryData.expense || {} });
      } catch (requestError) {
        setError(requestError?.response?.data?.error || 'Unable to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const selectedMonthData = useMemo(() => {
    return trends.find((item) => item.month === selectedMonth) || { month: selectedMonth, income: 0, expense: 0 };
  }, [selectedMonth, trends]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100">
        <p className="rounded-xl bg-white px-6 py-4 text-slate-700 shadow-sm">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-5">
        <div className="max-w-xl rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-rose-200">
          <p className="text-lg font-semibold text-rose-600">Dashboard failed to load</p>
          <p className="mt-2 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar
        months={MONTHS}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        netWorth={summary.netBalance}
      />

      <main className="px-4 pb-10 pt-4 lg:ml-72 lg:px-8 lg:pt-6">
        <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-rose-400 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-50/90">Finance Analytics Panel</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Personal Finance Dashboard</h1>
            </div>
            <div className="rounded-xl bg-slate-900/30 px-4 py-2 text-right backdrop-blur">
              <p className="text-sm">Selected Month</p>
              <p className="text-xl font-semibold">{selectedMonth}</p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <SummaryCards summary={summary} selectedMonthData={selectedMonthData} />

          <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="min-w-0">
              <ChartSection trends={trends} />
            </div>

            <aside className="space-y-4">
              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                <p className="text-lg font-semibold text-slate-900">Notification</p>
                <p className="mt-2 text-sm text-slate-600">
                  {summary.totalExpense > summary.totalIncome
                    ? 'Expenses are higher than income. Review discretionary spending.'
                    : 'Cashflow is positive this period. Maintain contribution momentum.'}
                </p>
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                <p className="text-lg font-semibold text-slate-900">Income Sources</p>
                <div className="mt-3 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <span className="text-slate-600">Primary income</span>
                    <span className="font-semibold text-slate-900">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(summary.totalIncome)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <span className="text-slate-600">Total expenses</span>
                    <span className="font-semibold text-rose-500">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      }).format(summary.totalExpense)}
                    </span>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          <CategoryCards expenseByCategory={categoryWise.expense || {}} />
        </div>
      </main>
    </div>
  );
}
