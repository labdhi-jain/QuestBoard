import React from 'react';
import { Link } from 'react-router-dom';
import { Quest } from '../../types/api';
import { CategoryBadge, PointsBadge, StatusBadge } from '../common/Badge';
import { MapPin, Lock, QrCode, UserCheck } from 'lucide-react';
import { clsx } from 'clsx';

export interface QuestCardProps {
  quest: Quest;
}

const CATEGORY_ICONS: Record<string, string> = {
  EXPLORE: '🗺️',
  ACADEMICS: '📚',
  SOCIAL: '🤝',
  WELLNESS: '🧘',
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const isLocked = quest.studentStatus === 'LOCKED';
  const isCompleted = quest.studentStatus === 'COMPLETED';
  const isPending = quest.studentStatus === 'PENDING';

  return (
    <Link
      to={`/quests/${quest.id}`}
      className={clsx(
        'group relative block bg-white border-2.5 border-ink rounded-3xl p-5 shadow-hard transition-all duration-150',
        isLocked
          ? 'bg-gray-50/80 grayscale opacity-80 cursor-not-allowed hover:shadow-hard'
          : 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-lg active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-pressed',
        isCompleted && 'border-mint'
      )}
    >
      {/* Completed Stamped Overlay */}
      {isCompleted && (
        <div className="absolute top-4 right-4 z-20 pointer-events-none select-none">
          <div className="rotate-12 border-3 border-mint bg-mint/90 text-ink px-3 py-1 rounded-xl font-heading font-black text-xs uppercase tracking-wider shadow-hard-sm">
            ★ COMPLETED
          </div>
        </div>
      )}

      {/* Locked Overlay Icon */}
      {isLocked && (
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div className="p-2 rounded-xl bg-gray-200 border-2 border-ink text-gray-700 shadow-hard-sm">
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>
      )}

      {/* Header: Category Badge & Points */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <CategoryBadge category={quest.category} />
        {!isCompleted && !isLocked && <PointsBadge points={quest.pointValue} size="sm" />}
      </div>

      {/* Title & Emoji */}
      <div className="flex items-start gap-3 mb-2">
        <div className="text-3xl select-none group-hover:scale-110 transition-transform">
          {CATEGORY_ICONS[quest.category] || '🎯'}
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-extrabold text-lg text-ink line-clamp-2 leading-snug group-hover:text-violet transition-colors">
            {quest.title}
          </h3>
        </div>
      </div>

      {/* Location Hint */}
      <div className="flex items-center gap-1.5 text-xs text-gray-600 font-body mb-4 line-clamp-1">
        <MapPin className="w-3.5 h-3.5 text-tangerine stroke-[2.5] shrink-0" />
        <span className="truncate">{quest.locationHint}</span>
      </div>

      {/* Footer: Verification Type Pill & Status Badge */}
      <div className="flex items-center justify-between pt-3 border-t-2 border-ink/10">
        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-gray-500 uppercase">
          {quest.verificationType === 'QR' ? (
            <>
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Scan</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manual Check</span>
            </>
          )}
        </div>
        <StatusBadge status={quest.studentStatus || 'AVAILABLE'} />
      </div>

      {/* Prerequisite warning if locked */}
      {isLocked && quest.prerequisiteQuest && (
        <div className="mt-2.5 pt-2 border-t border-dashed border-gray-300 text-[11px] font-heading font-bold text-gray-500 flex items-center gap-1">
          <Lock className="w-3 h-3 shrink-0" />
          <span>Requires: {quest.prerequisiteQuest.title}</span>
        </div>
      )}
    </Link>
  );
};
