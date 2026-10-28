import { forwardRef } from 'react';
import { CustomSelect, type CustomSelectProps, type SelectOption } from './custom-select';

export type { SelectOption };

export interface SelectProps extends Omit<CustomSelectProps, 'onChange'> {
  onChange?:
    | ((value: string | string[]) => void)
    | ((event: { target: { value: string; name?: string } }) => void);
  name?: string;
  selectSize?: 'sm' | 'md' | 'lg';
}

/**
 * Enhanced Dropdown Primitive
 * Backward-compatible drop-in for Select that renders the full CustomSelect without native <select> tags.
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ onChange, selectSize, size, ...props }, _ref) => {
    const effectiveSize = size || selectSize || 'md';

    const handleChange = (val: string | string[]) => {
      if (!onChange) return;
      const strVal = Array.isArray(val) ? val[0] || '' : val;
      (onChange as (value: string | string[]) => void)(strVal);
    };

    return <CustomSelect {...props} size={effectiveSize} onChange={handleChange} />;
  },
);

Select.displayName = 'Select';
