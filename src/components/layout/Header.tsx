import { useState, useEffect } from 'react';
import { Menu, Heart, Shield, Crown, TrendingUp, Settings as SettingsIcon, Bell, Video, Calendar, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ComplimentsNotification } from '@/components/features/Compliments';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [coinBalance, setCoinBalance] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadHeaderData();
      const interval = setInterval(loadHeaderData, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadHeaderData = async () => {
    if (!user) return;
    try {
      const [coins, matches, superLikes] = await Promise.all([
        api.getUserCoins(user.id),
        api.getMatches(user.id),
        api.getSuperLikesReceived(user.id),
      ]);
      setCoinBalance(coins?.balance || 0);
      // Count unread: new matches + unread messages
      const unread = matches.reduce((sum: number, m: any) => sum + (m.unread_count || 0), 0);
      setUnreadCount(unread + (superLikes?.length > 0 ? 1 : 0));
    } catch (e) {
      // Silent fail for header data
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-background/90 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => navigate('/discover')} className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-primary/30 transition-shadow">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Spark
          </span>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Coin Balance */}
          {coinBalance !== null && (
            <button
              onClick={() => navigate('/coins')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
            >
              <span className="text-sm">🪙</span>
              <span className="text-sm font-bold text-yellow-600 dark:text-yellow-400">{coinBalance.toLocaleString()}</span>
            </button>
          )}

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 hover:bg-accent rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Premium */}
          <button
            onClick={() => navigate('/premium')}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            title="Premium"
          >
            <Crown className="w-5 h-5 text-yellow-500" />
          </button>

          {/* Safety */}
          <button
            onClick={() => navigate('/safety')}
            className="p-2 hover:bg-accent rounded-full transition-colors"
            title="Safety Center"
          >
            <Shield className="w-5 h-5" />
          </button>

          {/* Menu */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Compliments Notification */}
      <ComplimentsNotification />

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute top-14 right-4 bg-card border border-border rounded-2xl shadow-xl p-2 min-w-[220px] z-50">
            {[
              { label: 'Profile Insights', icon: TrendingUp, path: '/insights', color: '' },
              { label: 'Video Dates', icon: Video, path: '/video-date', color: 'text-blue-500' },
              { label: 'Dating Events', icon: Calendar, path: '/events', color: 'text-orange-500' },
              { label: 'Spark Coins', icon: Wallet, path: '/coins', color: 'text-yellow-500' },
              { label: 'FansOnly', icon: Crown, path: '/fansonly', color: 'text-purple-500' },
              { label: 'Settings', icon: SettingsIcon, path: '/settings', color: '' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setShowMenu(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-xl transition-colors text-left"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </header>
  );
}
