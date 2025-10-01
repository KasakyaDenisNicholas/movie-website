import { Play, Info } from 'lucide-react';

interface HeroProps {
  onAuthClick: () => void;
  isAuthenticated: boolean;
}

export function Hero({ onAuthClick, isAuthenticated }: HeroProps) {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            Unlimited Movies, TV Shows, and More
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8">
            Watch anywhere. Cancel anytime. Start your journey with thousands of
            movies and shows.
          </p>

          <div className="flex flex-wrap gap-4">
            {isAuthenticated ? (
              <>
                <button className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-slate-200 transition flex items-center space-x-2">
                  <Play size={24} fill="currentColor" />
                  <span>Play Now</span>
                </button>
                <button className="px-8 py-4 bg-slate-600 bg-opacity-50 text-white rounded-lg font-semibold hover:bg-opacity-70 transition flex items-center space-x-2">
                  <Info size={24} />
                  <span>More Info</span>
                </button>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition text-lg"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
