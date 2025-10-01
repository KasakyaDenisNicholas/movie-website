import { Film, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAuthClick: () => void;
  onSubscriptionClick: () => void;
}

export function Header({ onAuthClick, onSubscriptionClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black via-black/80 to-transparent">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="text-cyan-400" size={32} />
            <span className="text-2xl font-bold text-white">CinemaStream</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-white hover:text-cyan-400 transition">
              Home
            </a>
            <a href="#movies" className="text-white hover:text-cyan-400 transition">
              Movies
            </a>
            <a href="#featured" className="text-white hover:text-cyan-400 transition">
              Featured
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <button
                  onClick={onSubscriptionClick}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
                >
                  Subscription
                </button>
                <button
                  onClick={signOut}
                  className="p-2 text-white hover:text-cyan-400 transition"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onAuthClick}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
