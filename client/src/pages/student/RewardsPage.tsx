import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { Reward } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { Gift, Coins, AlertCircle, CheckCircle2, Sparkles, Package } from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx } from 'clsx';

export const RewardsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [successReward, setSuccessReward] = useState<Reward | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => api.get<{ rewards: Reward[] }>('/api/rewards'),
  });

  const rewards = data?.rewards || [];
  const pointsBalance = user?.pointsBalance || 0;

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) =>
      api.post(`/api/rewards/${rewardId}/redeem`),
    onSuccess: async () => {
      if (selectedReward) {
        setSuccessReward(selectedReward);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2EE6A6', '#FFD23F', '#6C3BFF', '#FF4FA3'],
        });
      }
      setSelectedReward(null);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Redemption failed';
      setErrorMessage(msg);
      setSelectedReward(null);
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-8 pb-24 md:pb-12 space-y-6">
      {/* Header with Balance notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border-2.5 border-ink rounded-3xl p-6 shadow-hard">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-mint text-ink border-2 border-ink px-3 py-0.5 rounded-full font-heading font-black text-xs uppercase tracking-wider shadow-hard-sm mb-1.5">
            <Gift className="w-3.5 h-3.5" />
            CAMPUS REWARD STORE
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink tracking-tight">
            Redeem Your Points
          </h1>
          <p className="font-body text-xs sm:text-sm text-gray-600">
            Trade your hard-earned points for real merch, coffee, and vouchers!
          </p>
        </div>

        {/* Spendable Balance Banner */}
        <div className="bg-yellow border-2.5 border-ink rounded-2xl p-3.5 shadow-hard-sm flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white border-2 border-ink text-ink shadow-hard-sm">
            <Coins className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="block text-[11px] font-heading font-black text-gray-700">YOUR BALANCE</span>
            <span className="font-mono font-black text-2xl text-ink">{pointsBalance} pts</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-pink-light/30 border-2.5 border-pink text-ink font-heading font-bold text-sm shadow-hard-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-pink-dark shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-xs font-mono font-bold">
            DISMISS
          </button>
        </div>
      )}

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border-2.5 border-ink rounded-3xl p-5 shadow-hard h-64 animate-pulse flex flex-col justify-between"
            >
              <div className="w-16 h-6 bg-gray-200 rounded-full" />
              <div className="w-full h-12 bg-gray-200 rounded-xl" />
              <div className="w-full h-10 bg-gray-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <EmptyState
          emoji="🎁"
          title="No Rewards In Stock"
          description="Check back soon! Orientation staff adds new vouchers and college merch weekly."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {rewards.map((reward) => {
            const isOutOfStock = reward.stock <= 0;
            const canAfford = pointsBalance >= reward.pointCost;
            const isDisabled = isOutOfStock || !canAfford;

            return (
              <div
                key={reward.id}
                className={clsx(
                  'bg-white border-2.5 border-ink rounded-3xl p-5 shadow-hard flex flex-col justify-between transition-all',
                  isOutOfStock ? 'opacity-70 grayscale' : 'hover:shadow-hard-lg'
                )}
              >
                <div>
                  {/* Top Bar: Cost Badge and Stock */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-yellow text-ink border-2 border-ink px-2.5 py-0.5 rounded-full font-mono font-black text-xs shadow-hard-sm">
                      {reward.pointCost} PTS
                    </span>
                    <span
                      className={clsx(
                        'text-[11px] font-heading font-extrabold px-2 py-0.5 rounded-lg border',
                        isOutOfStock
                          ? 'bg-gray-200 text-gray-600 border-gray-400'
                          : reward.stock <= 2
                          ? 'bg-pink text-ink border-ink'
                          : 'bg-cream text-gray-700 border-ink'
                      )}
                    >
                      {isOutOfStock ? 'Sold Out' : `${reward.stock} in stock`}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base text-ink mb-1.5 leading-snug">
                    {reward.title}
                  </h3>
                  <p className="font-body text-xs text-gray-600 line-clamp-3 mb-4">
                    {reward.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink/10">
                  <Button
                    variant={canAfford && !isOutOfStock ? 'mint' : 'white'}
                    size="sm"
                    fullWidth
                    disabled={isDisabled}
                    onClick={() => setSelectedReward(reward)}
                  >
                    {isOutOfStock
                      ? 'Out of Stock'
                      : !canAfford
                      ? `Need ${reward.pointCost - pointsBalance} more pts`
                      : 'Claim Reward 🎁'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal (US-06) */}
      <Modal
        isOpen={!!selectedReward}
        onClose={() => setSelectedReward(null)}
        title="Confirm Reward Claim"
        maxWidth="sm"
      >
        {selectedReward && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-yellow border-2.5 border-ink mx-auto flex items-center justify-center text-3xl shadow-hard">
              🎁
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-lg text-ink">
                {selectedReward.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                This will deduct <strong>{selectedReward.pointCost} points</strong> from your spendable balance.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-cream border-2 border-ink text-xs font-mono font-bold text-ink">
              Remaining Balance After: {pointsBalance - selectedReward.pointCost} pts
            </div>

            <p className="text-[11px] text-gray-500 font-body">
              Note: Your lifetime leaderboard rank will <strong>not</strong> be affected!
            </p>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-ink">
              <Button
                variant="white"
                size="sm"
                onClick={() => setSelectedReward(null)}
                disabled={redeemMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="mint"
                size="sm"
                onClick={() => redeemMutation.mutate(selectedReward.id)}
                disabled={redeemMutation.isPending}
              >
                {redeemMutation.isPending ? 'Redeeming...' : 'Confirm Claim'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Success Celebration Modal */}
      <Modal
        isOpen={!!successReward}
        onClose={() => setSuccessReward(null)}
        title="Reward Claimed!"
        maxWidth="sm"
      >
        {successReward && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-mint border-2.5 border-ink mx-auto flex items-center justify-center text-3xl shadow-hard animate-bounce">
              🎉
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-xl text-ink">
                Enjoy your {successReward.title}!
              </h4>
              <p className="text-xs font-body text-gray-600 mt-1">
                Show your name and confirmation to the orientation desk staff at the Student Union to pick up your reward.
              </p>
            </div>

            <div className="p-3 bg-yellow/40 border-2 border-ink rounded-2xl text-xs font-heading font-bold text-ink">
              Confirmation logged to orientation registry.
            </div>

            <Button
              variant="violet"
              size="md"
              fullWidth
              onClick={() => setSuccessReward(null)}
            >
              Sweet! Back to Store
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
