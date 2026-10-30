import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { LeaderboardResponse, LeaderboardEntry } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Medal, Sparkles, RefreshCw, User } from 'lucide-react';
import { clsx } from 'clsx';

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => api.get<LeaderboardResponse>('/api/leaderboard'),
    refetchInterval: 10000, // Refresh automatically for live demo updates
  });

  const topStudents = data?.topStudents || [];
  const myRank = data?.myRank;

  // Split top 3 for podium
  const first = topStudents[0];
  const second = topStudents[1];
  const third = topStudents[2];
  const restOfTop20 = topStudents.slice(3);

  // Check if current user is within top 20
  const isUserInTop20 = myRank && myRank.rank <= 20;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-8 pb-24 md:pb-12 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-yellow text-ink border-2 border-ink px-3 py-0.5 rounded-full font-heading font-black text-xs uppercase tracking-wider shadow-hard-sm mb-1.5">
            <Trophy className="w-3.5 h-3.5" />
            CAMPUS RANKINGS
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-ink tracking-tight">
            Freshman Leaderboard
          </h1>
          <p className="font-body text-xs sm:text-sm text-gray-600">
            Top explorers by lifetime points. Complete quests first to break ties!
          </p>
        </div>

        <button
          onClick={() => refetch()}
          title="Refresh rankings"
          className="p-2 rounded-xl bg-white border-2 border-ink shadow-hard-sm hover:bg-cream active:translate-x-0.5 active:translate-y-0.5"
        >
          <RefreshCw className="w-4 h-4 text-ink stroke-[2.5]" />
        </button>
      </div>

      {isLoading && (
        <div className="bg-white border-3 border-ink rounded-3xl p-12 text-center shadow-hard animate-pulse">
          <p className="font-heading font-bold text-gray-500">Calculating campus rankings...</p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4">
            {/* 2nd Place: Silver */}
            {second ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#E0E5EC] border-2.5 border-ink shadow-hard-sm flex items-center justify-center font-heading font-black text-lg sm:text-xl mb-2 relative">
                  🥈
                  {second.id === user?.id && (
                    <span className="absolute -top-2 -right-2 bg-pink text-ink text-[10px] font-heading font-extrabold px-1.5 rounded-full border border-ink">
                      YOU
                    </span>
                  )}
                </div>
                <div className="w-full bg-[#E0E5EC] border-2.5 border-ink rounded-t-2xl p-3 text-center shadow-hard h-32 flex flex-col justify-between">
                  <span className="font-heading font-black text-xs sm:text-sm text-ink truncate block">
                    {second.name}
                  </span>
                  <div>
                    <span className="font-mono font-black text-sm sm:text-lg text-ink block">
                      {second.lifetimePoints} XP
                    </span>
                    <span className="text-[10px] font-mono text-gray-600">
                      #2 RANK
                    </span>
                  </div>
                </div>
              </div>
            ) : <div />}

            {/* 1st Place: Gold */}
            {first ? (
              <div className="flex flex-col items-center -mt-6">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-yellow border-3 border-ink shadow-hard flex items-center justify-center font-heading font-black text-2xl sm:text-3xl mb-2 relative animate-bounce">
                  👑
                  {first.id === user?.id && (
                    <span className="absolute -top-2 -right-2 bg-pink text-ink text-[10px] font-heading font-extrabold px-1.5 rounded-full border border-ink">
                      YOU
                    </span>
                  )}
                </div>
                <div className="w-full bg-yellow border-3 border-ink rounded-t-2xl p-3 text-center shadow-hard-lg h-40 flex flex-col justify-between">
                  <span className="font-heading font-black text-sm sm:text-base text-ink truncate block">
                    {first.name}
                  </span>
                  <div>
                    <span className="font-mono font-black text-lg sm:text-2xl text-ink block">
                      {first.lifetimePoints} XP
                    </span>
                    <span className="text-[10px] font-heading font-extrabold bg-ink text-white px-2 py-0.5 rounded-full uppercase">
                      #1 LEADER
                    </span>
                  </div>
                </div>
              </div>
            ) : <div />}

            {/* 3rd Place: Bronze */}
            {third ? (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#F0D5C0] border-2.5 border-ink shadow-hard-sm flex items-center justify-center font-heading font-black text-lg sm:text-xl mb-2 relative">
                  🥉
                  {third.id === user?.id && (
                    <span className="absolute -top-2 -right-2 bg-pink text-ink text-[10px] font-heading font-extrabold px-1.5 rounded-full border border-ink">
                      YOU
                    </span>
                  )}
                </div>
                <div className="w-full bg-[#F0D5C0] border-2.5 border-ink rounded-t-2xl p-3 text-center shadow-hard h-28 flex flex-col justify-between">
                  <span className="font-heading font-black text-xs sm:text-sm text-ink truncate block">
                    {third.name}
                  </span>
                  <div>
                    <span className="font-mono font-black text-sm sm:text-base text-ink block">
                      {third.lifetimePoints} XP
                    </span>
                    <span className="text-[10px] font-mono text-gray-600">
                      #3 RANK
                    </span>
                  </div>
                </div>
              </div>
            ) : <div />}
          </div>

          {/* Ranks 4 to 20 List */}
          <div className="bg-white border-2.5 border-ink rounded-3xl p-5 shadow-hard space-y-2">
            <h3 className="font-heading font-extrabold text-sm text-gray-500 uppercase tracking-wider mb-3">
              Contenders (Top 20)
            </h3>

            {restOfTop20.length === 0 && topStudents.length <= 3 && (
              <p className="text-xs text-gray-400 py-2">No more participants in top 20.</p>
            )}

            {restOfTop20.map((student) => {
              const isCurrentUser = student.id === user?.id;
              return (
                <div
                  key={student.id}
                  className={clsx(
                    'flex items-center justify-between p-3 rounded-2xl border-2 border-ink transition-all',
                    isCurrentUser
                      ? 'bg-yellow shadow-hard translate-x-1 font-bold'
                      : 'bg-cream/40 hover:bg-cream'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm w-7 text-gray-500">
                      #{student.rank}
                    </span>
                    <div>
                      <span className="font-heading font-bold text-sm text-ink block">
                        {student.name}
                        {isCurrentUser && ' (You)'}
                      </span>
                      <span className="text-[11px] font-mono text-gray-500">
                        {student.completedQuestsCount} quests completed
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-black text-base text-violet">
                    {student.lifetimePoints} XP
                  </span>
                </div>
              );
            })}
          </div>

          {/* Current Student's Rank PINNED if outside top 20 (US-05) */}
          {!isUserInTop20 && myRank && (
            <div className="sticky bottom-20 md:bottom-4 z-30">
              <div className="bg-violet text-white border-3 border-ink rounded-3xl p-4 shadow-hard-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-ink border-2 border-ink flex items-center justify-center font-heading font-black text-base">
                    #{myRank.rank}
                  </div>
                  <div>
                    <span className="font-heading font-black text-sm uppercase tracking-wider block">
                      YOUR CURRENT STANDING
                    </span>
                    <span className="text-xs opacity-90">
                      {myRank.completedQuestsCount} quests • Complete more quests to climb into the Top 20!
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-xl text-yellow block">
                    {myRank.lifetimePoints} XP
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
