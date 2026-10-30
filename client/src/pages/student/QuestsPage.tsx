import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Quest } from '../../types/api';
import { QuestCard } from '../../components/student/QuestCard';
import { QuestFilters } from '../../components/student/QuestFilters';
import { EmptyState } from '../../components/common/EmptyState';
import { Compass, RefreshCw } from 'lucide-react';

export const QuestsPage: React.FC = () => {
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['quests'],
    queryFn: () => api.get<{ quests: Quest[] }>('/api/quests'),
    refetchInterval: 15000, // Real-time poll every 15s to guarantee updates within 1 minute (US-08)
  });

  const quests = data?.quests || [];

  // Filter logic
  const filteredQuests = quests.filter((q) => {
    if (category !== 'ALL' && q.category !== category) return false;
    if (status !== 'ALL' && q.studentStatus !== status) return false;
    if (search.trim()) {
      const qLower = search.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(qLower);
      const matchDesc = q.description.toLowerCase().includes(qLower);
      const matchLoc = q.locationHint.toLowerCase().includes(qLower);
      if (!matchTitle && !matchDesc && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-8 pb-24 md:pb-12">
      {/* Title & Quick Stats */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-violet stroke-[2.5]" />
            <span>Campus Quests</span>
          </h1>
          <p className="font-body text-xs sm:text-sm text-gray-600">
            Find landmarks, complete activities, and rack up points!
          </p>
        </div>

        <button
          onClick={() => refetch()}
          title="Refresh quest board"
          className="p-2 rounded-xl bg-white border-2 border-ink shadow-hard-sm hover:bg-cream active:translate-x-0.5 active:translate-y-0.5"
        >
          <RefreshCw className="w-4 h-4 text-ink stroke-[2.5]" />
        </button>
      </div>

      {/* Filters & Search */}
      <QuestFilters
        selectedCategory={category}
        onSelectCategory={setCategory}
        selectedStatus={status}
        onSelectStatus={setStatus}
        searchQuery={search}
        onSearchChange={setSearch}
      />

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white border-2.5 border-ink rounded-3xl p-5 shadow-hard h-52 animate-pulse flex flex-col justify-between"
            >
              <div className="w-24 h-6 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="w-3/4 h-5 bg-gray-200 rounded-lg" />
                <div className="w-1/2 h-4 bg-gray-200 rounded-lg" />
              </div>
              <div className="w-full h-8 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <EmptyState
          emoji="⚠️"
          title="Couldn't load quests"
          description="We had trouble fetching the latest campus quests from the server. Check your connection or refresh."
          actionText="Try Again"
          onAction={() => refetch()}
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredQuests.length === 0 && (
        <EmptyState
          emoji="🔍"
          title="No matching quests"
          description="Try relaxing your filters or search keywords to see more campus activities."
          actionText="Clear All Filters"
          onAction={() => {
            setCategory('ALL');
            setStatus('ALL');
            setSearch('');
          }}
        />
      )}

      {/* Quests Grid */}
      {!isLoading && !isError && filteredQuests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
};
