import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  emoji?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji = '🎒',
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border-2.5 border-ink rounded-3xl shadow-hard my-6">
      <div className="text-6xl mb-4 select-none animate-bounce">{emoji}</div>
      <h3 className="font-heading font-extrabold text-2xl text-ink mb-2">{title}</h3>
      <p className="text-gray-600 font-body max-w-sm mb-6 text-sm sm:text-base">{description}</p>
      {actionText && onAction && (
        <Button variant="yellow" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
