'use client';
import { useState } from 'react';
import type { FinanceCategory } from '@/api/finance';
import { createFinanceCategory, deleteFinanceCategory } from '@/api/finance';

interface CategoryManagerProps {
  categories: FinanceCategory[];
  onChanged: () => Promise<void>;
}

export default function CategoryManager({ categories, onChanged }: CategoryManagerProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#8b5cf6');
  const [excludeFromBudget, setExcludeFromBudget] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      await createFinanceCategory({ name: name.trim(), color, excludeFromBudget });
      setName('');
      setExcludeFromBudget(false);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError('');
    try {
      await deleteFinanceCategory(id);
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6">
      <h2 className="text-sm font-medium text-gray-300 mb-4">Categories</h2>

      <ul className="space-y-2 mb-4">
        {categories.map((category) => (
          <li
            key={category._id}
            className="flex items-center justify-between p-2 rounded-lg bg-gray-800/40"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full bg-[var(--dot-color)]"
                style={{ '--dot-color': category.color } as React.CSSProperties}
              />
              <span className="text-sm text-gray-200">{category.name}</span>
              {category.excludeFromBudget && (
                <span className="text-xs text-gray-500">(excluded from daily budget)</span>
              )}
            </div>
            {category.slug !== 'other' && (
              <button
                onClick={() => handleDelete(category._id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="New category"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[140px] p-2 rounded-lg bg-gray-800/60 border border-gray-700/50 text-white text-sm"
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded-lg bg-gray-800/60 border border-gray-700/50"
        />
        <label className="flex items-center gap-1.5 text-xs text-gray-400">
          <input
            type="checkbox"
            checked={excludeFromBudget}
            onChange={(e) => setExcludeFromBudget(e.target.checked)}
          />
          Exclude from budget
        </label>
        <button
          onClick={handleAdd}
          disabled={isSaving}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium disabled:opacity-50"
        >
          Add
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
