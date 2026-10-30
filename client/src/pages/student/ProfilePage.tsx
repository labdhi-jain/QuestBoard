import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ProgressResponse } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { getRankInfo } from '../../lib/ranks';
import { Button } from '../../components/common/Button';
import { CategoryBadge } from '../../components/common/Badge';
import {
  User,
  Coins,
  Trophy,
  CheckCircle2,
  Compass,
  LogOut,
  Sparkles,
  Shield,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['progress'],
    queryFn: () => api.get<ProgressResponse>('/api/me/progress'),
  });

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const progress = data;
  const rank = getRankInfo(user?.lifetimePoints || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-8 pb-24 md:pb-12 space-y-6">
      {/* User Passport Header Card */}
      <div className="bg-white border-3 border-ink rounded-3xl p-6 sm:p-8 shadow-hard-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet text-white border-3 border-ink flex items-center justify-center font-heading font-black text-2xl shadow-hard">
              {user?.name.slice(0, 2).toUpperCase() || 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink tracking-tight">
                  {user?.name}
                </h1>
                {user?.role === 'ADMIN' && (
                  <span className="bg-pink text-ink text-xs font-heading font-extrabold px-2 py-0.5 rounded-full border border-ink">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-gray-500 font-bold">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {user?.role === 'ADMIN' && (
              <Link to="/admin">
                <Button variant="pink" size="sm">
                  <Shield className="w-4 h-4" />
                  Admin Desk
                </Button>
              </Link>
            )}
            <Button variant="white" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 stroke-[2.5]" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Dual Points Display */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t-2.5 border-ink">
          {/* Spendable Currency */}
          <div className="bg-mint/20 border-2.5 border-ink rounded-2xl p-4 shadow-hard-sm">
            <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold text-gray-700 mb-1">
              <Coins className="w-4 h-4 text-ink stroke-[2.5]" />
              <span>SPENDABLE BALANCE</span>
            </div>
            <div className="font-mono font-black text-2xl sm:text-3xl text-ink">
              {user?.pointsBalance || 0} pts
            </div>
            <p className="text-[11px] text-gray-600 mt-1">Available to redeem for rewards</p>
          </div>

          {/* Lifetime Points (Leaderboard XP) */}
          <div className="bg-yellow/30 border-2.5 border-ink rounded-2xl p-4 shadow-hard-sm">
            <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold text-gray-700 mb-1">
              <Trophy className="w-4 h-4 text-ink stroke-[2.5]" />
              <span>LIFETIME SCORE</span>
            </div>
            <div className="font-mono font-black text-2xl sm:text-3xl text-violet">
              {user?.lifetimePoints || 0} XP
            </div>
            <p className="text-[11px] text-gray-600 mt-1">Feeds your campus leaderboard rank</p>
          </div>
        </div>

        {/* Cosmetic Rank Title & XP Progress Bar */}
        <div className="mt-6 pt-4 border-t-2 border-ink/10">
          <div className="flex items-center justify-between text-xs font-heading font-extrabold mb-1.5">
            <span className="flex items-center gap-1.5 text-base">
              <span>{rank.emoji}</span>
              <span>{rank.title}</span>
            </span>
            <span className="font-mono text-gray-600">
              {rank.nextPoints ? `${user?.lifetimePoints} / ${rank.nextPoints} XP to next title` : 'Highest Rank Achieved!'}
            </span>
          </div>
          <div className="w-full h-4 bg-cream border-2 border-ink rounded-full overflow-hidden shadow-hard-sm p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${rank.color}`}
              style={{ width: `${rank.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quests Breakdown Section (US-04) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed Quests List */}
        <div className="bg-white border-2.5 border-ink rounded-3xl p-6 shadow-hard space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-ink">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-mint stroke-[3]" />
              <h3 className="font-heading font-extrabold text-lg text-ink">
                Completed Quests
              </h3>
            </div>
            <span className="bg-mint text-ink font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border border-ink">
              {progress?.stats.completedCount || 0} done
            </span>
          </div>

          {isLoading ? (
            <p className="text-xs text-gray-500">Checking completed missions...</p>
          ) : progress?.completedQuests.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-2">🧭</span>
              <p className="font-heading font-bold text-sm text-ink mb-1">No quests completed yet!</p>
              <p className="font-body text-xs text-gray-500 mb-4">Start exploring the campus to earn points.</p>
              <Link to="/quests">
                <Button variant="yellow" size="sm">Browse Quests</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {progress?.completedQuests.map((cq) => (
                <div
                  key={cq.checkInId}
                  className="bg-cream/60 border border-ink rounded-2xl p-3 flex items-center justify-between gap-2"
                >
                  <div>
                    <h5 className="font-heading font-bold text-sm text-ink">{cq.title}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CategoryBadge category={cq.category} />
                      <span className="text-[10px] font-mono text-gray-500">
                        {new Date(cq.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-extrabold text-xs text-mint-dark bg-mint/30 px-2 py-0.5 rounded-lg border border-mint">
                    +{cq.pointValue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Remaining Quests List */}
        <div className="bg-white border-2.5 border-ink rounded-3xl p-6 shadow-hard space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-ink">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-violet stroke-[2.5]" />
              <h3 className="font-heading font-extrabold text-lg text-ink">
                Remaining Quests
              </h3>
            </div>
            <span className="bg-yellow text-ink font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border border-ink">
              {progress?.stats.remainingCount || 0} to go
            </span>
          </div>

          {isLoading ? (
            <p className="text-xs text-gray-500">Loading remaining missions...</p>
          ) : progress?.remainingQuests.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-2">🎉</span>
              <p className="font-heading font-bold text-sm text-ink">All quests conquered!</p>
              <p className="font-body text-xs text-gray-500">You are a true Campus Legend.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {progress?.remainingQuests.map((rq) => (
                <Link
                  key={rq.id}
                  to={`/quests/${rq.id}`}
                  className="block bg-white hover:bg-cream/40 border border-ink rounded-2xl p-3 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-heading font-bold text-sm text-ink truncate">{rq.title}</h5>
                    <span className="font-mono font-bold text-xs text-ink bg-yellow px-2 py-0.5 rounded-lg border border-ink shrink-0">
                      +{rq.pointValue} pts
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-1">{rq.locationHint}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
