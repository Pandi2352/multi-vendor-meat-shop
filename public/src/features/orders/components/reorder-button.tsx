import { useState } from 'react';
import { RotateCw, Check } from 'lucide-react';
import { Button, toast } from '@/components/ui';
import { useReorderOrder } from '../api/use-orders';

interface ReorderButtonProps {
  orderId: string;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'outline' | 'secondary';
  className?: string;
  onReordered?: () => void;
}

export function ReorderButton({
  orderId,
  size = 'sm',
  variant = 'outline',
  className = '',
  onReordered,
}: ReorderButtonProps) {
  const reorder = useReorderOrder();
  const [reordered, setReordered] = useState(false);

  const handleReorder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const res = await reorder.mutateAsync(orderId);
      setReordered(true);
      setTimeout(() => setReordered(false), 3000);

      toast.success(`${res.itemsAdded} item(s) from ${res.shopName} added to your cart!`);

      if (res.skippedItems?.length > 0) {
        const unavailable = res.skippedItems.map((s) => s.productName).join(', ');
        toast.info(`Note: ${unavailable} is out of stock today.`);
      }

      onReordered?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not reorder this past order';
      toast.error(msg);
    }
  };

  return (
    <Button
      variant={reordered ? 'secondary' : variant}
      size={size}
      disabled={reorder.isPending}
      loading={reorder.isPending}
      onClick={handleReorder}
      className={className}
      leftIcon={
        reordered ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <RotateCw className="h-3.5 w-3.5 text-primary" />
        )
      }
    >
      {reordered ? 'Added to Cart' : 'Reorder'}
    </Button>
  );
}
