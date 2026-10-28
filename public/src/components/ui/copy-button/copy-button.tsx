import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { Tooltip } from '../tooltip';

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = 'Copy', className }: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Tooltip content={copied ? 'Copied!' : label}>
      <button
        type="button"
        onClick={() => copy(text)}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-border bg-surface p-1.5 text-muted hover:bg-surface-muted hover:text-text transition-colors cursor-pointer',
          copied && 'text-success border-success/30 bg-success-soft/30',
          className,
        )}
        aria-label={label}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" />
        ) : (
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </Tooltip>
  );
}
