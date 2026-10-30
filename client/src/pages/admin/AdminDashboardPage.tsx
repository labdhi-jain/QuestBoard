import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AdminStatsResponse } from '../../types/api';
import { Button } from '../../components/common/Button';
import {
  Users,
  Compass,
  CheckSquare,
  Gift,
  QrCode,
  ArrowRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get<AdminStatsResponse>('/api/admin/stats'),
    refetchInterval: 15000,
  });

  const overview = data?.overview;

  const statCards = [
    {
      label: 'Registered Students',
      value: overview?.totalStudents ?? 0,
      icon: Users,
      color: 'bg-yellow',
      link: '/admin/stats',
    },
    {
      label: 'Total Quests',
      value: overview?.totalQuests ?? 0,
      icon: Compass,
      color: 'bg-sky',
      link: '/admin/quests',
    },
    {
      label: 'Verified Check-Ins',
      value: overview?.totalCheckIns ?? 0,
      icon: CheckSquare,
      color: 'bg-mint',
      link: '/admin/stats',
    },
    {
      label: 'Pending Queue',
      value: overview?.pendingVerifications ?? 0,
      icon: CheckSquare,
      color: overview?.pendingVerifications ? 'bg-pink text-ink animate-pulse' : 'bg-cream',
      link: '/admin/queue',
    },
    {
      label: 'Rewards Claimed',
      value: overview?.totalRedemptions ?? 0,
      icon: Gift,
      color: 'bg-tangerine',
      link: '/admin/rewards',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-8 space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-3xl text-ink tracking-tight mb-1">
          Orientation Staff Control Room
        </h1>
        <p className="font-body text-xs sm:text-sm text-gray-600">
          Monitor campus onboarding momentum, review incoming check-ins, and manage quests.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.link}
              className="bg-white border-2.5 border-ink rounded-3xl p-4 shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-lg transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} border-2 border-ink flex items-center justify-center mb-3 shadow-hard-sm`}
              >
                <Icon className="w-5 h-5 text-ink stroke-[2.5]" />
              </div>
              <div className="font-mono font-black text-2xl text-ink">
                {isLoading ? '...' : stat.value}
              </div>
              <div className="text-xs font-heading font-bold text-gray-600 mt-0.5">
                {stat.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white border-2.5 border-ink rounded-3xl p-6 shadow-hard space-y-4">
        <h2 className="font-heading font-black text-xl text-ink">
          Orientation Operations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/quests"
            className="p-4 rounded-2xl bg-[#FFF9E6] border-2 border-ink shadow-hard-sm hover:shadow-hard transition-all flex flex-col justify-between h-36"
          >
            <div>
              <Compass className="w-6 h-6 text-violet mb-2 stroke-[2.5]" />
              <h4 className="font-heading font-extrabold text-base text-ink">
                Create & Edit Quests
              </h4>
              <p className="text-xs text-gray-600 font-body">
                Publish new campus missions or change point values.
              </p>
            </div>
            <span className="text-xs font-heading font-bold text-violet flex items-center gap-1">
              Manage Quests →
            </span>
          </Link>

          <Link
            to="/admin/qr"
            className="p-4 rounded-2xl bg-[#EBFDF7] border-2 border-ink shadow-hard-sm hover:shadow-hard transition-all flex flex-col justify-between h-36"
          >
            <div>
              <QrCode className="w-6 h-6 text-mint-dark mb-2 stroke-[2.5]" />
              <h4 className="font-heading font-extrabold text-base text-ink">
                QR Poster Generator
              </h4>
              <p className="text-xs text-gray-600 font-body">
                Print high-res posters with scan codes for campus spots.
              </p>
            </div>
            <span className="text-xs font-heading font-bold text-mint-dark flex items-center gap-1">
              Open QR Manager →
            </span>
          </Link>

          <Link
            to="/admin/queue"
            className="p-4 rounded-2xl bg-[#FFF0F7] border-2 border-ink shadow-hard-sm hover:shadow-hard transition-all flex flex-col justify-between h-36"
          >
            <div>
              <CheckSquare className="w-6 h-6 text-pink-dark mb-2 stroke-[2.5]" />
              <h4 className="font-heading font-extrabold text-base text-ink">
                Verification Queue
              </h4>
              <p className="text-xs text-gray-600 font-body">
                Review submissions for non-QR quests ("Meet a senior").
              </p>
            </div>
            <span className="text-xs font-heading font-bold text-pink-dark flex items-center gap-1">
              Review Submissions →
            </span>
          </Link>

          <Link
            to="/admin/rewards"
            className="p-4 rounded-2xl bg-[#F0FAFF] border-2 border-ink shadow-hard-sm hover:shadow-hard transition-all flex flex-col justify-between h-36"
          >
            <div>
              <Gift className="w-6 h-6 text-sky-dark mb-2 stroke-[2.5]" />
              <h4 className="font-heading font-extrabold text-base text-ink">
                Reward Catalog
              </h4>
              <p className="text-xs text-gray-600 font-body">
                Add prizes, configure costs, and manage stock inventory.
              </p>
            </div>
            <span className="text-xs font-heading font-bold text-sky-dark flex items-center gap-1">
              Manage Rewards →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};
