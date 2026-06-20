import React from 'react';
import { cn } from '../../lib/utils';

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:opacity-90',
  outline: 'border border-border bg-transparent hover:bg-accent/10',
  secondary: 'bg-secondary text-secondary-foreground hover:opacity-90',
  ghost: 'hover:bg-accent/10',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
};

const sizeClasses = {
  default: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-sm',
  lg: 'px-8 py-3 text-sm',
  icon: 'p-2',
};

export function Button({
  variant = 'default',
  size = 'default',
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-opacity',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      {...props}
    />
  );
}
