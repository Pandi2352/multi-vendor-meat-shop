import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, type InputProps } from '../input';

export type PasswordInputProps = Omit<InputProps, 'type' | 'rightSlot'>;

/** `Input` for passwords: lock icon and a show/hide toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ leftIcon = <Lock className="h-4 w-4" />, placeholder = '••••••••', ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        leftIcon={leftIcon}
        placeholder={placeholder}
        rightSlot={
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="flex cursor-pointer rounded-md p-1 text-muted transition-colors hover:text-text"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
        {...props}
      />
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
