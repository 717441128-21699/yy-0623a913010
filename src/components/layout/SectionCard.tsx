import React from 'react';

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ 
  title, 
  icon, 
  extra, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`section-card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-primary-500">{icon}</span>}
          <h2 className="text-base font-medium text-neutral-500">{title}</h2>
        </div>
        {extra && <div>{extra}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};
