import { Play, Plus, Check, Lock } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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

interface MovieCardProps {
  movie: Movie;
  isInWatchlist: boolean;
  canAccess: boolean;
  onWatchlistToggle: () => void;
  onUpgradeClick: () => void;
}

export function MovieCard({
  movie,
  isInWatchlist,
  canAccess,
  onWatchlistToggle,
  onUpgradeClick,
}: MovieCardProps) {
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const hours = Math.floor(movie.duration_minutes / 60);
  const minutes = movie.duration_minutes % 60;

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
        <img
          src={movie.poster_url}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {!canAccess && (
          <div className="absolute top-2 right-2 bg-slate-900 bg-opacity-90 p-2 rounded-lg">
            <Lock size={16} className="text-yellow-400" />
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center space-x-2 mb-2">
            {canAccess ? (
              <>
                <button className="p-2 bg-white rounded-full hover:bg-slate-200 transition">
                  <Play size={20} className="text-black" fill="currentColor" />
                </button>
                {user && (
                  <button
                    onClick={onWatchlistToggle}
                    className="p-2 bg-slate-700 bg-opacity-80 rounded-full hover:bg-slate-600 transition"
                  >
                    {isInWatchlist ? (
                      <Check size={20} className="text-white" />
                    ) : (
                      <Plus size={20} className="text-white" />
                    )}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onUpgradeClick}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
              >
                Upgrade to Watch
              </button>
            )}
          </div>

          <h3 className="text-white font-semibold text-lg mb-1">{movie.title}</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-300 mb-2">
            <span>{movie.release_year}</span>
            <span>•</span>
            <span>
              {hours}h {minutes}m
            </span>
            <span>•</span>
            <span className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              {movie.rating.toFixed(1)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-xs px-2 py-1 bg-slate-700 bg-opacity-80 text-slate-300 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-400 line-clamp-2">{movie.description}</p>
        </div>
      </div>
    </div>
  );
}
