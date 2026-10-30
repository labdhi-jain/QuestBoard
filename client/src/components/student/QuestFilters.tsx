import React from 'react';
import { clsx } from 'clsx';

export interface QuestFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: 'ALL', label: 'All Quests', emoji: '🌟' },
  { id: 'EXPLORE', label: 'Explore', emoji: '🗺️' },
  { id: 'ACADEMICS', label: 'Academics', emoji: '📚' },
  { id: 'SOCIAL', label: 'Social', emoji: '🤝' },
  { id: 'WELLNESS', label: 'Wellness', emoji: '🧘' },
];

const STATUSES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All Status' },
  { id: 'AVAILABLE', label: 'Available' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'LOCKED', label: 'Locked' },
];

export const QuestFilters: React.FC<QuestFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-3 mb-6">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search quests by title, location, keywords..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white border-2.5 border-ink rounded-2xl px-4 py-2.5 pl-11 font-body text-ink text-sm sm:text-base outline-none shadow-hard-sm focus:shadow-hard transition-all"
        />
        <span className="absolute left-3.5 top-3 text-lg select-none">🔍</span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-500 hover:text-ink px-1.5 py-0.5 rounded-lg border border-ink bg-cream"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs sm:text-sm font-heading font-extrabold whitespace-nowrap transition-all border-2 border-ink shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5',
              selectedCategory === cat.id
                ? 'bg-yellow text-ink shadow-hard'
                : 'bg-white text-gray-700 hover:bg-cream'
            )}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Status Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STATUSES.map((stat) => (
          <button
            key={stat.id}
            onClick={() => onSelectStatus(stat.id)}
            className={clsx(
              'px-2.5 py-1 rounded-xl text-xs font-heading font-bold transition-all border-1.5 border-ink',
              selectedStatus === stat.id
                ? 'bg-ink text-white'
                : 'bg-cream text-gray-600 hover:text-ink'
            )}
          >
            {stat.label}
          </button>
        ))}
      </div>
    </div>
  );
};
