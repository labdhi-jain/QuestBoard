import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { CheckIn } from '../../types/api';
import { VerificationCard } from '../../components/admin/VerificationCard';
import { EmptyState } from '../../components/common/EmptyState';
import { CheckSquare, RefreshCw } from 'lucide-react';

export const AdminQueuePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-queue'],
    queryFn: () => api.get<{ checkIns: CheckIn[] }>('/api/admin/checkins'),
    refetchInterval: 10000,
  });

  const checkIns = data?.checkIns || [];

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'VERIFIED' | 'REJECTED' }) =>
      api.patch(`/api/admin/checkins/${id}`, { status }),
    onSuccess: (_data, variables) => {
      setFeedback(
        variables.status === 'VERIFIED'
          ? 'Check-in approved and points credited to student!'
          : 'Check-in rejected.'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setTimeout(() => setFeedback(null), 3000);
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-pink text-ink border-2 border-ink px-3 py-0.5 rounded-full font-heading font-black text-xs uppercase tracking-wider shadow-hard-sm mb-1.5">
            <CheckSquare className="w-3.5 h-3.5" />
            STAFF VERIFICATION QUEUE
          </div>
          <h1 className="font-heading font-black text-3xl text-ink tracking-tight">
            Manual Quest Submissions
          </h1>
          <p className="font-body text-xs sm:text-sm text-gray-600">
            US-10: Review and approve student submissions for real-world interactions that cannot use QR codes.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-2xl bg-white border-2 border-ink shadow-hard-sm hover:bg-cream"
          title="Refresh queue"
        >
          <RefreshCw className="w-4 h-4 text-ink stroke-[2.5]" />
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-2xl bg-mint/30 border-2.5 border-mint text-ink font-heading font-bold text-sm shadow-hard-sm">
          ✅ {feedback}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border-2.5 border-ink rounded-3xl p-12 text-center animate-pulse">
          <p className="font-heading font-bold text-gray-500">Checking pending submissions...</p>
        </div>
      ) : checkIns.length === 0 ? (
        <EmptyState
          emoji="🎉"
          title="Queue Is Clean!"
          description="All student manual submissions have been reviewed. Great work!"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {checkIns.map((ci) => (
            <VerificationCard
              key={ci.id}
              checkIn={ci}
              onApprove={async (id) => {
                await reviewMutation.mutateAsync({ id, status: 'VERIFIED' });
              }}
              onReject={async (id) => {
                await reviewMutation.mutateAsync({ id, status: 'REJECTED' });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
