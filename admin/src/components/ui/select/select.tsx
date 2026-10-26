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
      // Support direct value callback
      (onChange as (val: string | string[]) => void)(val);
      // Support event-like callback
      try {
        (onChange as (e: { target: { value: string; name?: string } }) => void)({
          target: {
            value: Array.isArray(val) ? val[0] || '' : val,
            name: props.name,
          },
        });
      } catch {
        // Handled
      }
    };

    return <CustomSelect {...props} size={effectiveSize} onChange={handleChange} />;
  },
);

Select.displayName = 'Select';
