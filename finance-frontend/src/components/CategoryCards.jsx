const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const cardTheme = {
  housing: 'bg-rose-500 text-white',
  personal: 'bg-cyan-500 text-white',
  transportation: 'bg-slate-900 text-white',
};

export default function CategoryCards({ expenseByCategory }) {
  const categories = [
    { key: 'housing', label: 'Housing' },
    { key: 'personal', label: 'Personal' },
    { key: 'transportation', label: 'Transportation' },
  ];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-semibold text-slate-900">Spendings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => (
          <article
            key={category.key}
            className={`rounded-2xl p-5 shadow-sm ${cardTheme[category.key] || 'bg-slate-100 text-slate-800'}`}
          >
            <p className="text-sm opacity-90">{category.label}</p>
            <p className="mt-1 text-2xl font-semibold">
              {currency.format(expenseByCategory[category.key] || 0)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
