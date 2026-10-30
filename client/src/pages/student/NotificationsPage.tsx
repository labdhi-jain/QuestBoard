import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Notification } from '../../types/api';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<{ notifications: Notification[] }>('/api/notifications'),
  });

  const notifications = data?.notifications || [];

  const markAllMutation = useMutation({
    mutationFn: () => api.post('/api/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markSingleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-8 pb-24 md:pb-12 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-yellow text-ink border-2 border-ink px-3 py-0.5 rounded-full font-heading font-black text-xs uppercase tracking-wider shadow-hard-sm mb-1.5">
            <Bell className="w-3.5 h-3.5" />
            ACTIVITY LOG
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink tracking-tight">
            Notifications
          </h1>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button
            variant="white"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 stroke-[2.5]" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white border-2.5 border-ink rounded-3xl p-8 text-center animate-pulse">
          <p className="font-heading font-bold text-gray-500">Checking for alerts...</p>
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          emoji="🔔"
          title="All caught up!"
          description="When you unlock new quests or earn achievements, you’ll see alerts here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && markSingleMutation.mutate(n.id)}
              className={clsx(
                'border-2.5 border-ink rounded-2xl p-4 transition-all flex items-start gap-3 shadow-hard-sm cursor-pointer',
                n.read ? 'bg-white opacity-85' : 'bg-[#FFFDE6] border-ink'
              )}
            >
              <div
                className={clsx(
                  'w-2.5 h-2.5 rounded-full mt-1.5 shrink-0',
                  n.read ? 'bg-transparent' : 'bg-pink border border-ink animate-ping'
                )}
              />
              <div className="flex-1">
                <p className="font-body text-sm text-ink leading-relaxed font-medium">
                  {n.message}
                </p>
                <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
