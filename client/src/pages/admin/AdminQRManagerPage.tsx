import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Quest } from '../../types/api';
import { Button } from '../../components/common/Button';
import { QRPosterModal } from '../../components/admin/QRPosterModal';
import { QrCode, Download, Printer, RefreshCw, ExternalLink } from 'lucide-react';

export const AdminQRManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-quests'],
    queryFn: () => api.get<{ quests: Quest[] }>('/api/admin/quests'),
  });

  const qrQuests = (data?.quests || []).filter((q) => q.verificationType === 'QR');

  const regenMutation = useMutation({
    mutationFn: ({ questId, expiresAt }: { questId: string; expiresAt?: string | null }) =>
      api.post(`/api/admin/quests/${questId}/qr`, { expiresAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quests'] });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-8 space-y-6">
      <div>
        <h1 className="font-heading font-black text-3xl text-ink tracking-tight">
          QR Code Manager & Posters
        </h1>
        <p className="font-body text-xs sm:text-sm text-gray-600">
          US-09: Manage physical checkpoint codes, view short codes, print campus posters, and regenerate expired tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p className="text-gray-400 font-heading">Loading checkpoint codes...</p>
        ) : (
          qrQuests.map((q) => {
            const activeQR = q.qrCodes?.[0];
            const token = activeQR?.token || 'NO-CODE';
            const shortCode = token.slice(0, 8).toUpperCase();
            const pngUrl = `/api/admin/quests/${q.id}/qr.png?t=${token}`;

            return (
              <div
                key={q.id}
                className="bg-white border-2.5 border-ink rounded-3xl p-5 shadow-hard flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-yellow text-ink border-2 border-ink px-2.5 py-0.5 rounded-full font-mono font-bold text-xs">
                      +{q.pointValue} PTS
                    </span>
                    <span className="text-[11px] font-heading font-bold text-gray-500 uppercase">
                      {q.status}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-lg text-ink mb-1">
                    {q.title}
                  </h3>
                  <p className="font-body text-xs text-gray-600 mb-4 line-clamp-1">
                    {q.locationHint}
                  </p>

                  {/* QR Preview Card */}
                  <div className="bg-cream border-2 border-ink rounded-2xl p-4 text-center mb-4">
                    {activeQR ? (
                      <div className="flex flex-col items-center">
                        <img
                          src={pngUrl}
                          alt={q.title}
                          className="w-36 h-36 bg-white p-2 rounded-xl border-2 border-ink shadow-hard-sm mb-2"
                        />
                        <div className="font-mono text-xs text-ink font-bold">
                          Code: <span className="text-violet font-black">{shortCode}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 py-6">No active QR code generated</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-ink/10">
                  <Button
                    variant="yellow"
                    size="sm"
                    fullWidth
                    onClick={() => setSelectedQuest(q)}
                  >
                    <Printer className="w-4 h-4" />
                    Open Poster / Print View
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {selectedQuest && (
        <QRPosterModal
          isOpen={!!selectedQuest}
          onClose={() => setSelectedQuest(null)}
          quest={selectedQuest}
          qrCode={selectedQuest.qrCodes?.[0]}
          onRegenerate={async (questId, exp) => {
            await regenMutation.mutateAsync({ questId, expiresAt: exp });
            const updated = await queryClient.fetchQuery<{ quests: Quest[] }>({
              queryKey: ['admin-quests'],
            });
            const fresh = updated.quests.find((item) => item.id === questId);
            if (fresh) setSelectedQuest(fresh);
          }}
        />
      )}
    </div>
  );
};
