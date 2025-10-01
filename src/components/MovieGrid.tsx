import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MovieCard } from './MovieCard';

interface Movie {
  id: string;
  title: string;
  description: string;
  release_year: number;
  duration_minutes: number;
  rating: number;
  poster_url: string;
  genres: string[];
  required_tier: string | null;
}

interface MovieGridProps {
  title: string;
  featured?: boolean;
  onUpgradeClick: () => void;
}

export function MovieGrid({ title, featured = false, onUpgradeClick }: MovieGridProps) {
  const { user } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [userTierId, setUserTierId] = useState<string | null>(null);
  const [tierHierarchy, setTierHierarchy] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTierHierarchy();
    loadMovies();
    if (user) {
      loadUserSubscription();
      loadWatchlist();
    }
  }, [user, featured]);

  const loadTierHierarchy = async () => {
    const { data } = await supabase
      .from('subscription_tiers')
      .select('id, name, price')
      .order('price', { ascending: true });

    if (data) {
      const hierarchy: { [key: string]: number } = {};
      data.forEach((tier, index) => {
        hierarchy[tier.id] = index;
      });
      setTierHierarchy(hierarchy);
    }
  };

  const loadMovies = async () => {
    let query = supabase
      .from('movies')
      .select('*')
      .order('rating', { ascending: false });

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data } = await query;
    if (data) {
      setMovies(data);
    }
    setLoading(false);
  };

  const loadUserSubscription = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_subscriptions')
      .select('tier_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      setUserTierId(data.tier_id);
    }
  };

  const loadWatchlist = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_watchlist')
      .select('movie_id')
      .eq('user_id', user.id);

    if (data) {
      setWatchlist(new Set(data.map((item) => item.movie_id)));
    }
  };

  const canAccessMovie = (movie: Movie): boolean => {
    if (!movie.required_tier) return true;
    if (!userTierId) return false;

    const userTierLevel = tierHierarchy[userTierId] ?? -1;
    const requiredTierLevel = tierHierarchy[movie.required_tier] ?? 999;

    return userTierLevel >= requiredTierLevel;
  };

  const toggleWatchlist = async (movieId: string) => {
    if (!user) return;

    if (watchlist.has(movieId)) {
      await supabase
        .from('user_watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      setWatchlist((prev) => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    } else {
      await supabase.from('user_watchlist').insert({
        user_id: user.id,
        movie_id: movieId,
      });

      setWatchlist((prev) => new Set([...prev, movieId]));
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
          <div className="text-slate-400">Loading...</div>
        </div>
      </section>
    );
  }

  if (movies.length === 0) return null;

  return (
    <section className="py-8" id={featured ? 'featured' : 'movies'}>
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isInWatchlist={watchlist.has(movie.id)}
              canAccess={canAccessMovie(movie)}
              onWatchlistToggle={() => toggleWatchlist(movie.id)}
              onUpgradeClick={onUpgradeClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
