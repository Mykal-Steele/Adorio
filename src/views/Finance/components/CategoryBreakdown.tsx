import type { FinanceOverview } from '@/api/finance';

interface CategoryBreakdownProps {
  overview: FinanceOverview;
}

export default function CategoryBreakdown({ overview }: CategoryBreakdownProps) {
  if (overview.categoryBreakdown.length === 0) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6">
        <h2 className="text-sm font-medium text-gray-300 mb-2">Category Breakdown</h2>
        <p className="text-sm text-gray-500">No expenses this month yet.</p>
      </div>
    );
  }

  const max = Math.max(...overview.categoryBreakdown.map((entry) => entry.amount));

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6">
      <h2 className="text-sm font-medium text-gray-300 mb-4">Category Breakdown</h2>
      <div className="space-y-3">
        {overview.categoryBreakdown.map((entry) => (
          <div key={entry.category.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{entry.category.name}</span>
              <span className="text-gray-400">${entry.amount.toFixed(2)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${max > 0 ? (entry.amount / max) * 100 : 0}%`,
                  backgroundColor: entry.category.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
