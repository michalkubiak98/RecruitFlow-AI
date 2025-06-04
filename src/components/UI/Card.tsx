import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={clsx(
        'card',
        {
          'cursor-pointer hover:bg-dark-300 transition-colors': onClick
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
