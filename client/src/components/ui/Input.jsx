import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  placeholder = '',
  className = '',
  id,
  hint,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        placeholder={placeholder}
        className={`w-full px-3 py-2 text-sm text-text-primary bg-page border border-border-default rounded-md shadow-sm placeholder:text-text-tertiary hover:border-border-strong focus:outline-none focus:border-border-focus focus:ring-2 focus:ring-accent-primary/20 transition-colors duration-150 disabled:bg-muted disabled:cursor-not-allowed ${error ? 'border-error-border focus:border-error-text focus:ring-error-text/20' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-error-text">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-secondary">
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
