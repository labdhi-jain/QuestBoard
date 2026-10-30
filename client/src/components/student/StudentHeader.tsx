import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getRankInfo } from '../../lib/ranks';
import { Sparkles, Trophy, Coins, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentHeader: React.FC = () => {
  const { user } = useAuth();
  const [displayPoints, setDisplayPoints] = useState(user?.lifetimePoints || 0);

  // Animated counter for points changes
  useEffect(() => {
    if (!user) return;
    const target = user.lifetimePoints;
    if (displayPoints === target) return;

    const diff = target - displayPoints;
    const step = Math.ceil(Math.abs(diff) / 10);
    const interval = setInterval(() => {
      setDisplayPoints((prev) => {
        if (prev < target) return Math.min(target, prev + step);
        if (prev > target) return Math.max(target, prev - step);
        clearInterval(interval);
        return target;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [user?.lifetimePoints, displayPoints]);

  if (!user) return null;

  const rank = getRankInfo(user.lifetimePoints);

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-md border-b-2.5 border-ink px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Student Identity */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <Link to="/quests" className="flex items-center gap-2.5 group">
            <span className="w-10 h-10 rounded-2xl bg-violet text-white border-2 border-ink flex items-center justify-center font-heading text-xl shadow-hard-sm group-hover:rotate-6 transition-transform">
              🎯
            </span>
            <div>
              <span className="font-heading font-black text-xl tracking-tight text-ink block leading-none">
                QuestBoard
              </span>
              <span className="text-xs font-bold text-gray-500 font-mono">
                CAMPUS EDITION
              </span>
            </div>
          </Link>

          {/* Mobile Notification & Points snippet */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="p-2 rounded-xl bg-white border-2 border-ink shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              <Bell className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <div className="bg-yellow text-ink border-2 border-ink px-3 py-1 rounded-xl shadow-hard-sm font-mono font-black text-sm flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-ink" />
              {displayPoints} XP
            </div>
          </div>
        </div>

        {/* Center: XP Progress Bar & Rank Title */}
        <div className="w-full sm:max-w-md flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-heading font-extrabold">
            <span className="flex items-center gap-1 text-ink">
              <span>{rank.emoji}</span>
              <span>{rank.title}</span>
            </span>
            <span className="font-mono text-gray-600">
              {rank.nextPoints ? `${user.lifetimePoints} / ${rank.nextPoints} XP` : 'MAX LEVEL'}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3.5 bg-white border-2 border-ink rounded-full overflow-hidden shadow-hard-sm p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${rank.color}`}
              style={{ width: `${rank.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Right Desktop: Points Counters and Badges */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            to="/notifications"
            className="p-2.5 rounded-2xl bg-white border-2 border-ink shadow-hard-sm hover:bg-cream active:translate-x-0.5 active:translate-y-0.5"
            title="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2.5]" />
          </Link>

          {/* Spendable Currency Balance */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-mint text-ink border-2 border-ink shadow-hard-sm"
            title="Spendable Points Balance"
          >
            <Coins className="w-4 h-4 stroke-[2.5]" />
            <span className="font-mono font-bold text-sm">{user.pointsBalance} pts</span>
          </div>

          {/* Total Lifetime XP */}
          <div
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-yellow text-ink border-2 border-ink shadow-hard-sm"
            title="Total Lifetime Points (Leaderboard)"
          >
            <Trophy className="w-4 h-4 stroke-[2.5]" />
            <span className="font-mono font-black text-base">{displayPoints} XP</span>
          </div>
        </div>
      </div>
    </header>
  );
};
