import React from 'react';

export const Card = ({
  children,
  hoverable = false,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-surface-raised border border-border-default rounded-lg shadow-sm p-5 transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-border-strong cursor-pointer hover:-translate-y-[1px]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
