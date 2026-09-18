import React from 'react';

interface PageHeaderProps {
  category?: string;
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  borderBottom?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  category,
  title,
  meta,
  actions,
  borderBottom = true,
}) => {
  return (
    <header
      className={`pb-5 pt-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
        borderBottom ? 'border-b border-[#E2E4DE] mb-6' : 'mb-4'
      }`}
    >
      <div>
        {category && (
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#5F6773] mb-1">
            {category}
          </div>
        )}
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="text-2xl font-bold text-[#18191B] tracking-tight">{title}</h1>
          {meta && <div className="text-xs text-[#5F6773] flex items-center gap-2">{meta}</div>}
        </div>
      </div>
      {actions && <div className="flex items-center flex-wrap gap-2.5">{actions}</div>}
    </header>
  );
};
