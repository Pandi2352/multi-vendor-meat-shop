import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/toast';

export function useCopyToClipboard(toastMessage = 'Copied to clipboard') {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (!text) return false;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (toastMessage) {
          toast.success(toastMessage);
        }
        setTimeout(() => setCopied(false), 2000);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [toastMessage],
  );

  return { copied, copy };
}
