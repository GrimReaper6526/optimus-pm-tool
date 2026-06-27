import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  className = ''
}) => {
  const styles = {
    default: 'bg-muted text-text-secondary',
    success: 'bg-success-bg text-success-text border border-success-border',
    warning: 'bg-warning-bg text-warning-text border border-warning-border',
    error:   'bg-error-bg text-error-text border border-error-border',
    info:    'bg-info-bg text-info-text border border-info-border',
    accent:  'bg-accent-subtle text-accent-text border border-accent-primary/20'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
