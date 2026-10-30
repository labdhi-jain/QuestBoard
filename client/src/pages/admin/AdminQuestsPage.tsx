import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Quest } from '../../types/api';
import { Button } from '../../components/common/Button';
import { CategoryBadge } from '../../components/common/Badge';
import { QuestFormModal } from '../../components/admin/QuestFormModal';
import { QRPosterModal } from '../../components/admin/QRPosterModal';
import { Plus, Edit, QrCode, RefreshCw, Lock } from 'lucide-react';
import { clsx } from 'clsx';

export const AdminQuestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [posterQuest, setPosterQuest] = useState<Quest | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-quests'],
    queryFn: () => api.get<{ quests: Quest[] }>('/api/admin/quests'),
  });

  const quests = data?.quests || [];

  // Create Quest Mutation (US-08)
  const createMutation = useMutation({
    mutationFn: (questData: Partial<Quest>) =>
      api.post('/api/admin/quests', questData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quests'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  // Edit Quest Mutation (US-08)
  const updateMutation = useMutation({
    mutationFn: ({ id, ...questData }: Partial<Quest> & { id: string }) =>
      api.patch(`/api/admin/quests/${id}`, questData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quests'] });
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  // Regenerate QR Mutation (US-09)
  const regenMutation = useMutation({
    mutationFn: ({ questId, expiresAt }: { questId: string; expiresAt?: string | null }) =>
      api.post(`/api/admin/quests/${questId}/qr`, { expiresAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quests'] });
    },
  });

  const handleFormSubmit = async (formData: Partial<Quest>) => {
    if (editingQuest) {
      await updateMutation.mutateAsync({ id: editingQuest.id, ...formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleOpenEdit = (q: Quest) => {
    setEditingQuest(q);
    setIsFormOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingQuest(null);
    setIsFormOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-ink tracking-tight">
            Manage Campus Quests
          </h1>
          <p className="font-body text-xs sm:text-sm text-gray-600">
            Create, edit, publish, and control which quests students see on their boards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-2xl bg-white border-2 border-ink shadow-hard-sm hover:bg-cream"
          >
            <RefreshCw className="w-4 h-4 text-ink stroke-[2.5]" />
          </button>
          <Button variant="violet" onClick={handleOpenCreate}>
            <Plus className="w-5 h-5 stroke-[2.5]" />
            New Quest
          </Button>
        </div>
      </div>

      {/* Quests Table */}
      <div className="bg-white border-3 border-ink rounded-3xl shadow-hard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream border-b-2.5 border-ink text-xs font-heading font-extrabold text-ink uppercase">
                <th className="py-3.5 px-4">Quest</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Points</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Completions</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink/10 text-sm font-body">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 font-heading">
                    Loading quest catalog...
                  </td>
                </tr>
              ) : quests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500 font-heading">
                    No quests created yet. Click "New Quest" to begin!
                  </td>
                </tr>
              ) : (
                quests.map((q) => {
                  const activeQR = q.qrCodes?.[0];
                  return (
                    <tr key={q.id} className="hover:bg-cream/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-heading font-extrabold text-ink text-base">
                          {q.title}
                        </div>
                        <div className="text-xs text-gray-500 font-body truncate max-w-xs">
                          {q.locationHint}
                        </div>
                        {q.prerequisiteQuest && (
                          <div className="text-[11px] font-mono text-gray-600 flex items-center gap-1 mt-0.5">
                            <Lock className="w-3 h-3 text-gray-400" />
                            Requires: {q.prerequisiteQuest.title}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <CategoryBadge category={q.category} />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-ink">
                        +{q.pointValue}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-gray-600">
                        {q.verificationType}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={clsx(
                            'text-xs font-heading font-extrabold px-2.5 py-1 rounded-full border-1.5 border-ink',
                            q.status === 'PUBLISHED'
                              ? 'bg-mint text-ink'
                              : q.status === 'DRAFT'
                              ? 'bg-yellow text-ink'
                              : 'bg-gray-200 text-gray-600'
                          )}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-ink">
                        {q._count?.checkIns || 0}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {q.verificationType === 'QR' && activeQR && (
                            <button
                              onClick={() => setPosterQuest(q)}
                              title="View & Print QR Poster"
                              className="p-2 rounded-xl border border-ink bg-yellow hover:bg-yellow-dark shadow-hard-sm"
                            >
                              <QrCode className="w-4 h-4 text-ink" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(q)}
                            title="Edit Quest"
                            className="p-2 rounded-xl border border-ink bg-white hover:bg-cream shadow-hard-sm"
                          >
                            <Edit className="w-4 h-4 text-ink" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quest Form Modal (US-08) */}
      <QuestFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        questToEdit={editingQuest}
        availablePrereqs={quests}
      />

      {/* QR Poster & Regenerator Modal (US-09) */}
      {posterQuest && (
        <QRPosterModal
          isOpen={!!posterQuest}
          onClose={() => setPosterQuest(null)}
          quest={posterQuest}
          qrCode={posterQuest.qrCodes?.[0]}
          onRegenerate={async (questId, exp) => {
            await regenMutation.mutateAsync({ questId, expiresAt: exp });
            const updated = await queryClient.fetchQuery<{ quests: Quest[] }>({
              queryKey: ['admin-quests'],
            });
            const fresh = updated.quests.find((item) => item.id === questId);
            if (fresh) setPosterQuest(fresh);
          }}
        />
      )}
    </div>
  );
};
