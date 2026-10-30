import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AdminStatsResponse } from '../../types/api';
import { CategoryBadge } from '../../components/common/Badge';
import { BarChart3, Users, CheckSquare, Gift, Trophy, RefreshCw } from 'lucide-react';

export const AdminStatsPage: React.FC = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<AdminStatsResponse>('/api/admin/stats'),
    refetchInterval: 15000,
  });

  const overview = data?.overview;
  const analytics = data?.questAnalytics || [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-sky text-ink border-2 border-ink px-3 py-0.5 rounded-full font-heading font-black text-xs uppercase tracking-wider shadow-hard-sm mb-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            ORIENTATION INSIGHTS
          </div>
          <h1 className="font-heading font-black text-3xl text-ink tracking-tight">
            Analytics & Quest Completion Rates
          </h1>
          <p className="font-body text-xs sm:text-sm text-gray-600">
            US-12: Monitor onboarding traction, student engagement percentages, and campus landmark activity.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-2xl bg-white border-2 border-ink shadow-hard-sm hover:bg-cream"
          title="Refresh metrics"
        >
          <RefreshCw className="w-4 h-4 text-ink stroke-[2.5]" />
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow/30 border-2.5 border-ink rounded-3xl p-5 shadow-hard">
          <span className="text-xs font-heading font-bold text-gray-700 block mb-1">
            PARTICIPATING STUDENTS
          </span>
          <span className="font-mono font-black text-3xl text-ink">
            {overview?.totalStudents || 0}
          </span>
        </div>

        <div className="bg-mint/30 border-2.5 border-ink rounded-3xl p-5 shadow-hard">
          <span className="text-xs font-heading font-bold text-gray-700 block mb-1">
            TOTAL VERIFIED VISITS
          </span>
          <span className="font-mono font-black text-3xl text-ink">
            {overview?.totalCheckIns || 0}
          </span>
        </div>

        <div className="bg-pink-light/30 border-2.5 border-ink rounded-3xl p-5 shadow-hard">
          <span className="text-xs font-heading font-bold text-gray-700 block mb-1">
            PENDING REVIEWS
          </span>
          <span className="font-mono font-black text-3xl text-ink">
            {overview?.pendingVerifications || 0}
          </span>
        </div>

        <div className="bg-sky/30 border-2.5 border-ink rounded-3xl p-5 shadow-hard">
          <span className="text-xs font-heading font-bold text-gray-700 block mb-1">
            PRIZES REDEEMED
          </span>
          <span className="font-mono font-black text-3xl text-ink">
            {overview?.totalRedemptions || 0}
          </span>
        </div>
      </div>

      {/* Completion Rate Chart (US-12) */}
      <div className="bg-white border-3 border-ink rounded-3xl p-6 shadow-hard space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-black text-xl text-ink">
            Quest Completion Rates (% of active cohort)
          </h2>
          <span className="text-xs font-mono font-bold text-gray-500">
            Sorted by most completed
          </span>
        </div>

        {isLoading ? (
          <p className="text-center py-12 text-gray-400 font-heading">
            Calculating cohort metrics...
          </p>
        ) : (
          <div className="space-y-4">
            {analytics.map((quest) => (
              <div key={quest.id} className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-heading font-bold text-ink gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold">{quest.title}</span>
                    <CategoryBadge category={quest.category} />
                  </div>
                  <div className="flex items-center gap-3 font-mono text-gray-600">
                    <span>{quest.verifiedCount} visits</span>
                    <span className="font-black text-violet text-sm">
                      {quest.completionRate}% completion
                    </span>
                  </div>
                </div>

                {/* Pop Visual Bar */}
                <div className="w-full h-5 bg-cream border-2 border-ink rounded-full overflow-hidden shadow-hard-sm p-0.5">
                  <div
                    className="h-full rounded-full bg-violet transition-all duration-700"
                    style={{ width: `${Math.max(quest.completionRate, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
