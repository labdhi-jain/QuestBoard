import React from 'react';
import { clsx } from 'clsx';
import { Lock, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { StudentQuestStatus, QuestCategory } from '../../types/api';

export const StatusBadge: React.FC<{ status: StudentQuestStatus }> = ({ status }) => {
  switch (status) {
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-mint text-ink border-2 border-ink shadow-hard-sm">
          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
          COMPLETED
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-yellow text-ink border-2 border-ink shadow-hard-sm">
          <Clock className="w-3.5 h-3.5 stroke-[3] animate-spin" />
          PENDING
        </span>
      );
    case 'LOCKED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-gray-200 text-gray-700 border-2 border-ink shadow-hard-sm">
          <Lock className="w-3.5 h-3.5 stroke-[3]" />
          LOCKED
        </span>
      );
    case 'AVAILABLE':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-extrabold bg-sky text-ink border-2 border-ink shadow-hard-sm">
          <Sparkles className="w-3.5 h-3.5 stroke-[3]" />
          AVAILABLE
        </span>
      );
  }
};

export const CategoryBadge: React.FC<{ category: QuestCategory }> = ({ category }) => {
  const configs: Record<QuestCategory, { label: string; color: string; icon: string }> = {
    EXPLORE: { label: 'Explore', color: 'bg-yellow text-ink', icon: '🗺️' },
    ACADEMICS: { label: 'Academics', color: 'bg-sky text-ink', icon: '📚' },
    SOCIAL: { label: 'Social', color: 'bg-pink text-ink', icon: '🎉' },
    WELLNESS: { label: 'Wellness', color: 'bg-mint text-ink', icon: '🌿' },
  };

  const config = configs[category] || configs.EXPLORE;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-heading font-bold border-2 border-ink',
        config.color
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export const PointsBadge: React.FC<{ points: number; size?: 'sm' | 'md' | 'lg' }> = ({
  points,
  size = 'md',
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5',
  };

  return (
    <div
      className={clsx(
        'badge-starburst bg-yellow text-ink font-mono font-extrabold tracking-tight',
        sizeStyles[size]
      )}
    >
      +{points} PTS
    </div>
  );
};
