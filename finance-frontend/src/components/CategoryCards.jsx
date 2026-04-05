const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const cardTheme = [
  'bg-rose-500 text-white',
  'bg-cyan-500 text-white',
  'bg-slate-900 text-white',
  'bg-emerald-600 text-white',
  'bg-indigo-600 text-white',
  'bg-amber-500 text-slate-900',
];

export default function CategoryCards({ expenseByCategory }) {
  const categories = Object.entries(expenseByCategory || {})
    .map(([key, value]) => ({
      key,
      label: key
        .split(/[_\-\s]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' '),
      value: Number(value) || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  if (categories.length === 0) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <p className="text-lg font-semibold text-slate-900">Spendings</p>
        <p className="mt-2 text-sm text-slate-600">No category-wise spending data available.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-semibold text-slate-900">Spendings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category, index) => (
          <article
            key={category.key}
            className={`rounded-2xl p-5 shadow-sm ${cardTheme[index % cardTheme.length]}`}
          >
            <p className="text-sm opacity-90">{category.label}</p>
            <p className="mt-1 text-2xl font-semibold">
              {currency.format(category.value)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
