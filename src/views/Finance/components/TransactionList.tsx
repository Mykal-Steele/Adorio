import type { FinanceTransaction } from '@/api/finance';
import { deleteFinanceTransaction } from '@/api/finance';

interface TransactionListProps {
  transactions: FinanceTransaction[];
  onEdit: (transaction: FinanceTransaction) => void;
  onChanged: () => Promise<void>;
}

export default function TransactionList({ transactions, onEdit, onChanged }: TransactionListProps) {
  const handleDelete = async (id: string) => {
    await deleteFinanceTransaction(id);
    await onChanged();
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6">
        <p className="text-sm text-gray-500">No transactions found.</p>
      </div>
    );
  }

  const groups = transactions.reduce<Record<string, FinanceTransaction[]>>((acc, txn) => {
    (acc[txn.date] ??= []).push(txn);
    return acc;
  }, {});

  const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 space-y-5">
      {dates.map((date) => (
        <div key={date}>
          <p className="text-xs text-gray-500 mb-2">{date}</p>
          <ul className="space-y-1.5">
            {groups[date].map((txn) => (
              <li
                key={txn._id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 cursor-pointer"
                onClick={() => onEdit(txn)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-[var(--dot-color)]"
                    style={{ '--dot-color': txn.category.color } as React.CSSProperties}
                  />
                  <span className="text-sm text-gray-200 truncate">{txn.title}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`text-sm font-medium ${txn.type === 'income' ? 'text-green-400' : 'text-gray-300'}`}
                  >
                    {txn.type === 'income' ? '+' : '-'}${txn.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(txn._id);
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
