import React from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'flex w-full rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground',
        'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all',
        className
      )}
      {...props}
    />
  );
}

