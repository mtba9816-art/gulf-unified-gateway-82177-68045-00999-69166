import React from 'react';
import { cn } from '@/lib/utils';

interface MobileSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface MobileSelectItemProps {
  value: string;
  children: React.ReactNode;
}

export const MobileSelect: React.FC<MobileSelectProps> = ({
  value,
  onValueChange,
  placeholder = 'اختر...',
  children,
  disabled = false,
  className,
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "[&>option]:bg-background [&>option]:text-foreground",
        className
      )}
      dir="rtl"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
};

export const MobileSelectItem: React.FC<MobileSelectItemProps> = ({ value, children }) => {
  return <option value={value}>{children}</option>;
};
