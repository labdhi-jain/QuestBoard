import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Reward } from '../../types/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Gift, Plus, Edit, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

export const AdminRewardsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pointCost, setPointCost] = useState(25);
  const [stock, setStock] = useState(10);
  const [active, setActive] = useState(true);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: () => api.get<{ rewards: Reward[] }>('/api/admin/rewards'),
  });

  const rewards = data?.rewards || [];

  const createMutation = useMutation({
    mutationFn: (rewardData: unknown) => api.post('/api/admin/rewards', rewardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...rewardData }: { id: string } & Partial<Reward>) =>
      api.patch(`/api/admin/rewards/${id}`, rewardData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      setIsModalOpen(false);
    },
  });

  const handleOpenCreate = () => {
    setEditingReward(null);
    setTitle('');
    setDescription('');
    setPointCost(25);
    setStock(10);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (r: Reward) => {
    setEditingReward(r);
    setTitle(r.title);
    setDescription(r.description);
    setPointCost(r.pointCost);
    setStock(r.stock);
    setActive(r.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReward) {
      await updateMutation.mutateAsync({
        id: editingReward.id,
        title,
        description,
        pointCost: Number(pointCost),
        stock: Number(stock),
        active,
      });
    } else {
      await createMutation.mutateAsync({
        title,
        description,
        pointCost: Number(pointCost),
        stock: Number(stock),
        active,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-3xl text-ink tracking-tight">
            Manage Campus Rewards
          </h1>
          <p className="font-body text-xs sm:text-sm text-gray-600">
            US-11: Add prizes, control points pricing, and replenish physical stock levels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-2xl bg-white border-2 border-ink shadow-hard-sm hover:bg-cream"
          >
            <RefreshCw className="w-4 h-4 text-ink stroke-[2.5]" />
          </button>
          <Button variant="mint" onClick={handleOpenCreate}>
            <Plus className="w-5 h-5 stroke-[2.5]" />
            Add Reward
          </Button>
        </div>
      </div>

      {/* Rewards Table */}
      <div className="bg-white border-3 border-ink rounded-3xl shadow-hard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream border-b-2.5 border-ink text-xs font-heading font-extrabold text-ink uppercase">
                <th className="py-3.5 px-4">Reward</th>
                <th className="py-3.5 px-4">Point Cost</th>
                <th className="py-3.5 px-4">Available Stock</th>
                <th className="py-3.5 px-4">Redemptions</th>
                <th className="py-3.5 px-4">Catalog Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-ink/10 text-sm font-body">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400 font-heading">
                    Loading catalog...
                  </td>
                </tr>
              ) : (
                rewards.map((r) => (
                  <tr key={r.id} className="hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-heading font-extrabold text-ink text-base">
                        {r.title}
                      </div>
                      <div className="text-xs text-gray-500 font-body truncate max-w-sm">
                        {r.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-ink">
                      {r.pointCost} pts
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black">
                      <span
                        className={clsx(
                          'px-2.5 py-1 rounded-xl border-1.5 border-ink',
                          r.stock <= 0
                            ? 'bg-pink text-ink'
                            : r.stock <= 2
                            ? 'bg-yellow text-ink'
                            : 'bg-mint text-ink'
                        )}
                      >
                        {r.stock} remaining
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                      {r._count?.redemptions || 0} claimed
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={clsx(
                          'text-xs font-heading font-extrabold px-2 py-0.5 rounded-full border',
                          r.active
                            ? 'bg-mint text-ink border-ink'
                            : 'bg-gray-200 text-gray-600 border-gray-400'
                        )}
                      >
                        {r.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-2 rounded-xl border border-ink bg-white hover:bg-cream shadow-hard-sm"
                        title="Edit stock or details"
                      >
                        <Edit className="w-4 h-4 text-ink" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReward ? 'Edit Reward' : 'Add New Reward'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reward Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1.5 text-left">
            <label className="block font-heading font-bold text-sm text-ink">
              Description *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border-2.5 border-ink rounded-xl px-4 py-2 font-body text-ink text-sm outline-none shadow-hard-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Point Cost *"
              type="number"
              min={1}
              value={pointCost}
              onChange={(e) => setPointCost(parseInt(e.target.value, 10) || 0)}
              required
            />
            <Input
              label="Inventory Stock *"
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="reward-active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-ink accent-violet cursor-pointer"
            />
            <label htmlFor="reward-active" className="text-sm font-heading font-bold text-ink cursor-pointer">
              Active in student store
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-ink">
            <Button type="button" variant="white" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="mint">
              {editingReward ? 'Save Reward' : 'Add to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
