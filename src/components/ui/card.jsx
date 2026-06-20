import React from 'react';

export function Card({ className, ...props }) {
  return (
    <div
      className={[
        'rounded-lg border border-border bg-card text-card-foreground',
        'shadow-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={['p-6 pb-4', className].filter(Boolean).join(' ')} {...props} />;
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={['text-lg font-semibold leading-none tracking-tight', className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className, ...props }) {
  return <div className={['p-6 pt-0', className].filter(Boolean).join(' ')} {...props} />;
}

