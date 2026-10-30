import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'violet' | 'yellow' | 'mint' | 'pink' | 'sky' | 'tangerine' | 'white' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'violet',
  size = 'md',
  fullWidth = false,
  disabled,
  ...props
}) => {
  // Contrast rule strictly enforced:
  // Ink text on yellow, mint, sky, pink, tangerine, and white.
  // White text ONLY on violet and ink.
  const variantStyles = {
    violet: 'bg-violet text-white hover:bg-violet-dark',
    yellow: 'bg-yellow text-ink hover:bg-yellow-dark',
    mint: 'bg-mint text-ink hover:bg-mint-dark',
    pink: 'bg-pink text-ink hover:bg-pink-dark',
    sky: 'bg-sky text-ink hover:bg-sky-dark',
    tangerine: 'bg-tangerine text-ink hover:bg-tangerine-dark',
    white: 'bg-white text-ink hover:bg-cream',
    ink: 'bg-ink text-white hover:bg-[#2A1E63]',
  };

  const sizeStyles = {
    sm: 'text-sm py-1.5 px-3 rounded-xl border-2',
    md: 'text-base py-2.5 px-5 rounded-2xl border-2.5',
    lg: 'text-lg py-3.5 px-7 rounded-3xl border-2.5',
  };

  return (
    <button
      className={twMerge(
        clsx(
          'btn-arcade inline-flex items-center justify-center gap-2 cursor-pointer select-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          disabled && 'opacity-50 cursor-not-allowed active:translate-x-0 active:translate-y-0 active:shadow-hard',
          className
        )
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
