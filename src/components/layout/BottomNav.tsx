import { Flame, MessageCircle, User, Crown, TrendingUp, Film, Sparkles, Calendar, Bell } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Flame, label: 'Discover', path: '/discover', activeColor: 'text-rose-500' },
    { icon: Sparkles, label: 'Picks', path: '/standouts', activeColor: 'text-yellow-500' },
    { icon: MessageCircle, label: 'Matches', path: '/matches', activeColor: 'text-blue-500' },
    { icon: Calendar, label: 'Events', path: '/events', activeColor: 'text-orange-500' },
    { icon: User, label: 'Profile', path: '/profile', activeColor: 'text-purple-500' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-2 py-2 pb-safe">
        <div className="flex items-center justify-around">
          {navItems.map(({ icon: Icon, label, path, activeColor }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[52px] ${
                  isActive ? 'scale-105' : 'hover:bg-accent'
                }`}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon
                    className={`w-5 h-5 transition-all ${isActive ? `${activeColor} fill-current opacity-100` : 'text-muted-foreground'}`}
                    style={isActive ? { filter: 'drop-shadow(0 0 4px currentColor)' } : {}}
                  />
                </div>
                <span className={`text-[10px] font-semibold transition-colors ${isActive ? activeColor : 'text-muted-foreground'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
