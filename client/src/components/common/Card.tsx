import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'white' | 'cream' | 'yellow' | 'mint' | 'pink' | 'sky';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'white',
  interactive = false,
  ...props
}) => {
  const variantStyles = {
    white: 'bg-white text-ink',
    cream: 'bg-cream text-ink',
    yellow: 'bg-[#FFF9E6] text-ink',
    mint: 'bg-[#EBFDF7] text-ink',
    pink: 'bg-[#FFF0F7] text-ink',
    sky: 'bg-[#F0FAFF] text-ink',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'card-pop p-5',
          variantStyles[variant],
          interactive && 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-hard-lg cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
