import { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, Star, Users, Zap, Gift, Trophy, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

type NotifType = 'match' | 'message' | 'super_like' | 'like' | 'gift' | 'compliment' | 'achievement' | 'event' | 'rose';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  avatar?: string;
  time: string;
  read: boolean;
  actionPath?: string;
}

const NOTIF_ICONS: Record<NotifType, { icon: any; color: string; bg: string }> = {
  match: { icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  message: { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  super_like: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  like: { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  gift: { icon: Gift, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  compliment: { icon: Star, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  achievement: { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  event: { icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
  rose: { icon: Star, color: 'text-red-500', bg: 'bg-red-500/10' },
};

// Generate mock notifications from real data
const buildNotifications = (matches: any[], superLikes: any[], compliments: any[]): Notification[] => {
  const notifs: Notification[] = [];

  matches.slice(0, 3).forEach((m, i) => {
    notifs.push({
      id: `match-${m.id}`,
      type: 'match',
      title: "It's a Match! 🎉",
      message: `You and ${m.profile?.display_name || 'Someone'} liked each other. Start a conversation!`,
      avatar: m.profile?.photos?.[0],
      time: m.created_at,
      read: i > 0,
      actionPath: `/matches`,
    });
  });

  superLikes.slice(0, 2).forEach((sl, i) => {
    notifs.push({
      id: `sl-${sl.id}`,
      type: 'super_like',
      title: '⚡ Super Like Received!',
      message: `${sl.profiles?.display_name || 'Someone'} Super Liked your profile!`,
      avatar: sl.profiles?.photos?.[0],
      time: sl.created_at,
      read: i > 0,
      actionPath: '/insights',
    });
  });

  compliments.slice(0, 3).forEach((c, i) => {
    notifs.push({
      id: `comp-${c.id}`,
      type: 'compliment',
      title: '✨ You Received a Compliment!',
      message: `Someone complimented your ${c.compliment_type}${c.message ? ': "' + c.message + '"' : ''}`,
      avatar: c.profile?.photos?.[0],
      time: c.created_at,
      read: i > 1,
      actionPath: '/insights',
    });
  });

  // Static demo notifications
  notifs.push(
    {
      id: 'ach-1',
      type: 'achievement',
      title: '🏆 Achievement Unlocked!',
      message: 'You earned "Conversation Starter" — sent your first message!',
      time: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      actionPath: '/insights',
    },
    {
      id: 'event-1',
      type: 'event',
      title: '📅 Event Reminder',
      message: 'Speed Dating Night starts in 2 hours! Make sure you\'re ready.',
      time: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      actionPath: '/events',
    }
  );

  return notifs.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

export function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const [matches, superLikes, compliments] = await Promise.all([
        api.getMatches(user.id),
        api.getSuperLikesReceived(user.id),
        api.getReceivedCompliments(user.id),
      ]);
      setNotifications(buildNotifications(matches, superLikes, compliments));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = (notif: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    if (notif.actionPath) navigate(notif.actionPath);
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  const timeAgo = (t: string) => {
    const diff = Date.now() - new Date(t).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bell className="w-6 h-6" />
                Notifications
                {unreadCount > 0 && (
                  <span className="text-sm px-2 py-0.5 rounded-full bg-primary text-white font-medium">{unreadCount}</span>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm text-primary font-medium hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
            {(['all', 'unread'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === f ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
              </button>
            ))}
          </div>

          {/* Notifications */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">
                {filter === 'unread' ? 'All caught up! ✅' : 'No notifications yet'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'unread' ? 'You have no unread notifications.' : 'Start swiping to get matches and notifications!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(notif => {
                const { icon: Icon, color, bg } = NOTIF_ICONS[notif.type];
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all hover:border-primary/30 hover:shadow-sm flex items-start gap-4 ${
                      !notif.read
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-card border-border'
                    }`}
                  >
                    {/* Avatar or Icon */}
                    <div className="relative flex-shrink-0">
                      {notif.avatar ? (
                        <img src={notif.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                      )}
                      {notif.avatar && (
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${bg} border-2 border-background flex items-center justify-center`}>
                          <Icon className={`w-2.5 h-2.5 ${color}`} />
                        </div>
                      )}
                      {!notif.read && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${!notif.read ? 'text-foreground' : 'text-foreground/80'}`}>
                        {notif.title}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-muted-foreground mt-1.5">{timeAgo(notif.time)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
