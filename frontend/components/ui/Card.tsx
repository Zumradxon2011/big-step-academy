'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({ className, hoverEffect = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl border border-slate-100/90 shadow-sm shadow-slate-100 p-6',
        hoverEffect && 'transition-all duration-200 hover:shadow-md hover:border-slate-200/80',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  title,
  subtitle,
  action,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100', className)}
      {...props}
    >
      {title ? (
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      ) : (
        children
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
