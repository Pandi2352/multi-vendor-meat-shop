import { Heart } from 'lucide-react';
import { useIsFavourited, useToggleFavourite } from '../api/use-favourites';

interface FavouriteButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function FavouriteButton({
  productId,
  className = '',
  size = 'md',
}: FavouriteButtonProps) {
  const isFavourited = useIsFavourited(productId);
  const toggle = useToggleFavourite();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggle.mutate(productId);
  };

  const iconSizes = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const buttonSizes = size === 'sm' ? 'p-1.5' : 'p-2';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={toggle.isPending}
      aria-label={isFavourited ? 'Remove from favourites' : 'Save to favourites'}
      className={`rounded-md border border-border bg-surface hover:border-danger/40 transition-colors flex items-center justify-center ${buttonSizes} ${className}`}
    >
      <Heart
        className={`${iconSizes} transition-transform active:scale-125 ${
          isFavourited
            ? 'fill-danger text-danger'
            : 'text-muted hover:text-danger'
        }`}
      />
    </button>
  );
}
