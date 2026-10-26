import type React from 'react';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  group?: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  align?: 'auto' | 'left' | 'right';
  placement?: 'auto' | 'bottom' | 'top';
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  id?: string;
}
