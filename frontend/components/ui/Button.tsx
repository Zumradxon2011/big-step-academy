'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary:
        'bg-[#003b95] text-white hover:bg-[#002b6e] active:scale-[0.99] focus:ring-[#003b95]/40 shadow-sm shadow-[#003b95]/20',
      accent:
        'bg-[#f59e0b] text-white hover:bg-[#d97706] active:scale-[0.99] focus:ring-[#f59e0b]/40 shadow-sm shadow-[#f59e0b]/25 font-semibold',
      secondary:
        'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 focus:ring-slate-300 shadow-sm',
      outline:
        'bg-transparent text-[#003b95] border border-[#003b95]/30 hover:bg-[#003b95]/5 active:bg-[#003b95]/10 focus:ring-[#003b95]/30',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.99] focus:ring-rose-500/40 shadow-sm shadow-rose-600/20',
      ghost:
        'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-5 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
