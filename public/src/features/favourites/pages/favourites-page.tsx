import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/ui';
import { useFavourites } from '../api/use-favourites';
import { FavouriteCard } from '../components/favourite-card';

export function FavouritesPage() {
  const navigate = useNavigate();
  const { data: favourites = [], isLoading } = useFavourites();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text">Your Saved Meats</h1>
          <p className="text-xs text-muted mt-1">
            Quick 1-tap reordering from your trusted butcher stalls
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted text-sm">
          Loading your saved meats...
        </div>
      ) : favourites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favourite meat cuts yet"
          description="Tap the heart icon on any mutton, chicken, or seafood cut to save it here for quick everyday reordering."
          actionLabel="Browse Fresh Meat"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favourites.map((item) => (
            <FavouriteCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
