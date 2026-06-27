import React from 'react';

export const Button = React.forwardRef(({
  children,
  className = '',
  variant = 'primary',
  type = 'button',
  disabled = false,
  onClick,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border shadow-sm transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'text-white bg-accent-primary hover:bg-accent-hover border-transparent focus-visible:outline-accent-primary',
    secondary: 'text-text-primary bg-page hover:bg-subtle border-border-default focus-visible:outline-accent-primary',
    destructive: 'text-white bg-error-text hover:bg-red-600 border-transparent focus-visible:outline-error-text',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-subtle border-transparent shadow-none'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
