import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import RoleSelector from '../components/RoleSelector';
import { api, getStoredRole, unwrapData } from '../services/api';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const formatDate = (value) => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

export default function IncomeExpenses() {
  const [records, setRecords] = useState([]);
  const [activeRole, setActiveRole] = useState(getStoredRole());
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [netWorth, setNetWorth] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await api.get('/dashboard/summary');
        const summary = unwrapData(response) || {};
        setNetWorth(Number(summary.netBalance) || 0);
      } catch {
        setNetWorth(0);
      }
    };

    loadSummary();
  }, [activeRole]);

  useEffect(() => {
    const loadRecords = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          page,
          limit,
        };

        if (typeFilter !== 'all') {
          params.type = typeFilter;
        }

        if (categoryFilter.trim()) {
          params.category = categoryFilter.trim();
        }

        if (startDate) {
          params.startDate = startDate;
        }

        if (endDate) {
          params.endDate = endDate;
        }

        const response = await api.get('/records', { params });
        const payload = unwrapData(response);
        const nextRecords = Array.isArray(payload) ? payload : payload?.records || [];
        const nextPagination = Array.isArray(payload)
          ? {
              page,
              limit,
              totalItems: nextRecords.length,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            }
          : {
              page: payload?.pagination?.page || page,
              limit: payload?.pagination?.limit || limit,
              totalItems: payload?.pagination?.totalItems || nextRecords.length,
              totalPages: payload?.pagination?.totalPages || 1,
              hasNextPage: Boolean(payload?.pagination?.hasNextPage),
              hasPrevPage: Boolean(payload?.pagination?.hasPrevPage),
            };

        setRecords(nextRecords);
        setPagination(nextPagination);

        const nextCategories = nextRecords
          .map((item) => String(item.category || '').trim())
          .filter(Boolean);

        setCategoryOptions((prev) => {
          const merged = new Set([...prev, ...nextCategories]);
          return Array.from(merged).sort((a, b) => a.localeCompare(b));
        });
      } catch (requestError) {
        setError(requestError?.response?.data?.error || 'Unable to load records');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [activeRole, page, limit, typeFilter, categoryFilter, startDate, endDate]);

  const visibleRecords = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return records;
    }

    return records.filter((item) => {
      const haystack = [
        item.category,
        item.type,
        item.notes,
        item.amount,
        formatDate(item.date),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [records, search]);

  const updateAndResetPage = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar netWorth={netWorth} />

      <main className="px-4 pb-10 pt-4 lg:ml-72 lg:px-8 lg:pt-6">
        <header className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 text-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-50/90">Records Module</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Income & Expenses</h1>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <RoleSelector onRoleChanged={setActiveRole} />
              <div className="rounded-xl bg-slate-900/30 px-4 py-2 text-right backdrop-blur">
                <p className="text-sm">Total Records</p>
                <p className="text-xl font-semibold">{pagination.totalItems}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Type
              <select
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-cyan-500"
                value={typeFilter}
                onChange={updateAndResetPage(setTypeFilter)}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Category
              <input
                list="category-suggestions"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-cyan-500"
                value={categoryFilter}
                onChange={updateAndResetPage(setCategoryFilter)}
                placeholder="e.g. food"
              />
              <datalist id="category-suggestions">
                {categoryOptions.map((category) => (
                  <option value={category} key={category} />
                ))}
              </datalist>
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Start Date
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-cyan-500"
                value={startDate}
                onChange={updateAndResetPage(setStartDate)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-600">
              End Date
              <input
                type="date"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-cyan-500"
                value={endDate}
                onChange={updateAndResetPage(setEndDate)}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Search
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-cyan-500"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="notes, category..."
              />
            </label>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
          {loading ? (
            <div className="grid min-h-40 place-items-center text-slate-600">Loading records...</div>
          ) : error ? (
            <div className="rounded-2xl bg-rose-50 p-4 text-rose-600">{error}</div>
          ) : visibleRecords.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-slate-600">
              No records found for the selected filters.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleRecords.map((record) => (
                      <tr key={record._id || `${record.date}-${record.amount}-${record.category}`}>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {currency.format(Number(record.amount) || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${
                              record.type === 'income'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {record.type || '--'}
                          </span>
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-700">{record.category || '--'}</td>
                        <td className="px-4 py-3 text-slate-700">{formatDate(record.date)}</td>
                        <td className="px-4 py-3 text-slate-600">{record.notes || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!pagination.hasPrevPage || loading}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!pagination.hasNextPage || loading}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
