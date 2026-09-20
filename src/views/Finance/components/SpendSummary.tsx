import type { FinanceOverview } from '@/api/finance';

interface SpendSummaryProps {
  overview: FinanceOverview;
}

export default function SpendSummary({ overview }: SpendSummaryProps) {
  const monthPercent =
    overview.monthlyBudget > 0
      ? Math.min((overview.monthlySpend / overview.monthlyBudget) * 100, 100)
      : 0;
  const todayPercent =
    overview.dailyBudget > 0
      ? Math.min((overview.todaySpend / overview.dailyBudget) * 100, 100)
      : 0;

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 space-y-5">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">Today</span>
          <span className="text-gray-200">
            ${overview.todaySpend.toFixed(2)} / ${overview.dailyBudget.toFixed(2)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${todayPercent}%` }}
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-400">This month (budget-relevant)</span>
          <span className="text-gray-200">
            ${overview.monthlySpend.toFixed(2)} / ${overview.monthlyBudget.toFixed(2)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            style={{ width: `${monthPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ${overview.monthlySpendAll.toFixed(2)} total spent this month, including fixed costs
          excluded from the daily budget
        </p>
      </div>
    </div>
  );
}
