// File: src/components/common/status-indicator.tsx (Client Component)
'use client';

type StatusType = 'safe' | 'warning' | 'danger' | 'active' | 'inactive';
type SizeType = 'small' | 'medium' | 'large';

interface StatusIndicatorProps {
  status: StatusType;
  size?: SizeType;
  animated?: boolean;
  title?: string;
}

const STATUS_LIGHT_COLORS: Record<StatusType, string> = {
  safe: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  active: '#2563eb',
  inactive: '#6b7280',
};

const STATUS_DARK_COLORS: Record<StatusType, string> = {
  safe: '#86efac',
  warning: '#fbbf24',
  danger: '#f87171',
  active: '#60a5fa',
  inactive: '#9ca3af',
};

const SIZE_CLASSES: Record<SizeType, string> = {
  small: 'w-3 h-3',
  medium: 'w-6 h-6',
  large: 'w-8 h-8',
};

export function StatusIndicator({
  status,
  size = 'medium',
  animated = false,
  title,
}: StatusIndicatorProps) {
  return (
    <div
      className={`
        inline-flex items-center justify-center rounded-full
        ${SIZE_CLASSES[size]}
        ${animated ? 'animate-pulse' : ''}
        transition-all duration-200
      `}
      style={{
        backgroundColor: STATUS_LIGHT_COLORS[status],
      }}
      title={title}
    />
  );
}