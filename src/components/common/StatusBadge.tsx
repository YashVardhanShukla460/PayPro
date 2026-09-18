import React from 'react';

export type BadgeVariant =
  | 'draft'
  | 'computed'
  | 'validated'
  | 'paid'
  | 'active'
  | 'expired'
  | 'pending'
  | 'approved'
  | 'refused'
  | 'present'
  | 'late'
  | 'absent'
  | 'needs_review'
  | 'warning'
  | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  className = '',
  dot = true,
}) => {
  // Infer variant if not explicitly provided
  const normalized = (variant || status.toLowerCase().replace(/\s+/g, '_')) as BadgeVariant;

  const getStyle = (): { bg: string; text: string; border: string; dotColor: string } => {
    switch (normalized) {
      case 'paid':
      case 'approved':
      case 'active':
      case 'present':
        return {
          bg: 'bg-[#EAF2EC]',
          text: 'text-[#1B4332]',
          border: 'border-[#C2DBC7]',
          dotColor: 'bg-[#1B4332]',
        };

      case 'validated':
      case 'computed':
        return {
          bg: 'bg-[#F0F4F1]',
          text: 'text-[#2D5A43]',
          border: 'border-[#D2E3D6]',
          dotColor: 'bg-[#4A6B53]',
        };

      case 'pending':
      case 'draft':
      case 'late':
      case 'warning':
        return {
          bg: 'bg-[#FEF3C7]',
          text: 'text-[#92400E]',
          border: 'border-[#FDE68A]',
          dotColor: 'bg-[#B45309]',
        };

      case 'refused':
      case 'absent':
      case 'needs_review':
        return {
          bg: 'bg-[#FEE2E2]',
          text: 'text-[#991B1B]',
          border: 'border-[#FECACA]',
          dotColor: 'bg-[#B91C1C]',
        };

      case 'expired':
      case 'neutral':
      default:
        return {
          bg: 'bg-[#F4F4F0]',
          text: 'text-[#5F6773]',
          border: 'border-[#E2E4DE]',
          dotColor: 'bg-[#8A92A0]',
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />}
      <span className="capitalize tracking-tight">{status}</span>
    </span>
  );
};
