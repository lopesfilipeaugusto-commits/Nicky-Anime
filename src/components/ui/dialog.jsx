import React, { createContext, useContext, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

const DialogContext = createContext(null);

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within Dialog');
  }
  return context;
}

function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, ...props }) {
  const { onOpenChange } = useDialogContext();

  return (
    <button type="button" onClick={() => onOpenChange?.(true)} {...props}>
      {children}
    </button>
  );
}

function DialogClose({ className, children, ...props }) {
  const { onOpenChange } = useDialogContext();

  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpenChange?.(false)}
      {...props}
    >
      {children}
    </button>
  );
}

function DialogPortal({ children }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

function DialogOverlay({ className, ...props }) {
  const { onOpenChange } = useDialogContext();

  return (
    <div
      className={cn('fixed inset-0 z-50 bg-black/50 backdrop-blur-sm', className)}
      onClick={() => onOpenChange?.(false)}
      aria-hidden="true"
      {...props}
    />
  );
}

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const { open, onOpenChange } = useDialogContext();
  const contentRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onOpenChange?.(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    const node = contentRef.current;
    node?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        ref={(node) => {
          contentRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
          'border border-border bg-card p-6 shadow-lg sm:rounded-lg animate-fadeIn outline-none',
          className
        )}
        onClick={(event) => event.stopPropagation()}
        data-dialog-title-id={titleId}
        data-dialog-description-id={descriptionId}
        {...props}
      >
        <DialogMetadataProvider titleId={titleId} descriptionId={descriptionId}>
          {children}
        </DialogMetadataProvider>
        <button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Fechar"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

const DialogMetadataContext = createContext({ titleId: undefined, descriptionId: undefined });

function DialogMetadataProvider({ titleId, descriptionId, children }) {
  return (
    <DialogMetadataContext.Provider value={{ titleId, descriptionId }}>
      {children}
    </DialogMetadataContext.Provider>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

const DialogTitle = React.forwardRef(({ className, children, ...props }, ref) => {
  const { titleId } = useContext(DialogMetadataContext);

  return (
    <h2
      ref={ref}
      id={titleId}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h2>
  );
});
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef(({ className, children, ...props }, ref) => {
  const { descriptionId } = useContext(DialogMetadataContext);

  return (
    <p
      ref={ref}
      id={descriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
});
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
