import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full text-left space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block font-heading font-bold text-sm text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'w-full bg-white border-2.5 border-ink rounded-xl px-4 py-2.5 font-body text-ink text-base placeholder:text-gray-400 outline-none transition-all shadow-hard-sm focus:shadow-hard focus:translate-x-[-1px] focus:translate-y-[-1px] focus:border-violet disabled:bg-gray-100 disabled:opacity-60',
              error && 'border-pink bg-[#FFF5F8] focus:border-pink',
              className
            )
          )}
          {...props}
        />
        {hint && !error && <p className="text-xs text-gray-600 font-medium">{hint}</p>}
        {error && <p className="text-xs text-pink-dark font-bold">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
