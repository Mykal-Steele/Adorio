import type { FinanceCategory, FinanceTransactionsQuery } from '@/api/finance';

interface TransactionFiltersProps {
  categories: FinanceCategory[];
  filters: FinanceTransactionsQuery;
  onChange: (next: FinanceTransactionsQuery) => void;
}

export default function TransactionFilters({
  categories,
  filters,
  onChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="month"
        value={filters.month ?? ''}
        onChange={(e) => onChange({ ...filters, month: e.target.value || undefined })}
        className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm"
      />
      <select
        value={filters.category ?? ''}
        onChange={(e) => onChange({ ...filters, category: e.target.value || undefined })}
        className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Search"
        value={filters.search ?? ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
        className="p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm flex-1 min-w-[140px]"
      />
    </div>
  );
}
