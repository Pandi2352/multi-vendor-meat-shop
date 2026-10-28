import { useState, useCallback, useEffect, type RefObject, type CSSProperties } from 'react';

interface UseSelectPositionParams {
  triggerRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  portal: boolean;
  placement?: 'auto' | 'top' | 'bottom';
  align?: 'auto' | 'left' | 'right';
}

interface UseSelectPositionResult {
  openAbove: boolean;
  alignRight: boolean;
  maxListHeight: number;
  menuStyle?: CSSProperties;
  updatePosition: () => void;
}

/** Computes screen coordinates and bounds for CustomSelect dropdown menu. */
export function useSelectPosition({
  triggerRef,
  isOpen,
  portal,
  placement = 'auto',
  align = 'auto',
}: UseSelectPositionParams): UseSelectPositionResult {
  const [openAbove, setOpenAbove] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [maxListHeight, setMaxListHeight] = useState<number>(224);
  const [menuStyle, setMenuStyle] = useState<CSSProperties | undefined>(undefined);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const spaceBelow = vh - rect.bottom;
    const spaceAbove = rect.top;
    const isAbove =
      placement === 'top' || (placement === 'auto' && spaceBelow < 300 && spaceAbove > spaceBelow);
    setOpenAbove(isAbove);

    const availH = isAbove ? spaceAbove - 24 : spaceBelow - 24;
    const listH = Math.min(240, Math.max(120, availH - 64));
    setMaxListHeight(listH);

    const estimatedWidth = Math.max(rect.width, 220);
    const spaceRight = vw - rect.left;
    const isRight =
      align === 'right' ||
      (align === 'auto' && (spaceRight < estimatedWidth || rect.right > vw - 60));
    setAlignRight(isRight);

    if (portal) {
      setMenuStyle({
        position: 'fixed',
        zIndex: 70,
        top: isAbove ? undefined : `${rect.bottom + 4}px`,
        bottom: isAbove ? `${vh - rect.top + 4}px` : undefined,
        left: isRight ? undefined : `${rect.left}px`,
        right: isRight ? `${vw - rect.right}px` : undefined,
        minWidth: `${Math.max(rect.width, 200)}px`,
        maxWidth: `${Math.max(rect.width, 360)}px`,
      });
    } else {
      setMenuStyle({ width: 'max-content', maxWidth: '340px' });
    }
  }, [triggerRef, placement, align, portal]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return { openAbove, alignRight, maxListHeight, menuStyle, updatePosition };
}
