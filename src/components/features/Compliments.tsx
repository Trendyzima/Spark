import { useState, useEffect } from 'react';
import { Heart, Smile, Sparkles, MessageCircle, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Compliment } from '@/types';

export function ComplimentsNotification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [compliments, setCompliments] = useState<Compliment[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    if (user) {
      loadCompliments();
      const interval = setInterval(loadCompliments, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadCompliments = async () => {
    if (!user) return;

    try {
      const data = await api.getReceivedCompliments(user.id);
      setCompliments(data);
      setUnreadCount(data.filter(c => !c.is_read).length);
    } catch (error) {
      console.error('Error loading compliments:', error);
    }
  };

  const handleMarkAsRead = async (complimentId: string) => {
    try {
      await api.markComplimentAsRead(complimentId);
      loadCompliments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getComplimentIcon = (type: string) => {
    switch (type) {
      case 'smile': return '😊';
      case 'style': return '✨';
      case 'bio': return '💭';
      case 'vibe': return '🌟';
      case 'photos': return '📸';
      default: return '💖';
    }
  };

  const getComplimentText = (type: string) => {
    switch (type) {
      case 'smile': return 'loves your smile';
      case 'style': return 'loves your style';
      case 'bio': return 'loves your bio';
      case 'vibe': return 'loves your vibe';
      case 'photos': return 'loves your photos';
      default: return 'sent you a compliment';
    }
  };

  if (unreadCount === 0) return null;

  return (
    <>
      {/* Notification Badge */}
      <button
        onClick={() => setShowList(true)}
        className="fixed top-20 right-4 z-40 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 animate-bounce"
      >
        <Heart className="w-5 h-5 fill-white" />
        <span className="font-semibold">{unreadCount} New Compliment{unreadCount > 1 ? 's' : ''}</span>
      </button>

      {/* Compliments List Modal */}
      {showList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                Compliments
              </h3>
              <button
                onClick={() => setShowList(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {compliments.map((compliment) => {
                const profile = compliment.profile;
                const photo = profile?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

                return (
                  <div
                    key={compliment.id}
                    className={`p-4 rounded-2xl border ${
                      compliment.is_read ? 'border-border bg-muted/50' : 'border-primary bg-primary/5'
                    }`}
                    onClick={() => !compliment.is_read && handleMarkAsRead(compliment.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img src={photo} alt={profile?.display_name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{getComplimentIcon(compliment.compliment_type)}</span>
                          <p className="font-semibold truncate">
                            {profile?.display_name}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {getComplimentText(compliment.compliment_type)}
                        </p>
                        {compliment.message && (
                          <p className="text-sm mt-2 italic">"{compliment.message}"</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(compliment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SendComplimentButton({ profileId, onSent }: { profileId: string; onSent?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showOptions, setShowOptions] = useState(false);
  const [sending, setSending] = useState(false);

  const complimentTypes = [
    { type: 'smile', label: 'Great Smile', icon: '😊' },
    { type: 'style', label: 'Amazing Style', icon: '✨' },
    { type: 'bio', label: 'Cool Bio', icon: '💭' },
    { type: 'vibe', label: 'Good Vibes', icon: '🌟' },
    { type: 'photos', label: 'Nice Photos', icon: '📸' },
  ];

  const handleSend = async (type: string) => {
    if (!user) return;

    setSending(true);
    try {
      await api.sendCompliment(user.id, profileId, type);
      toast({
        title: 'Compliment Sent! 💖',
        description: 'They\'ll be notified of your compliment',
      });
      setShowOptions(false);
      onSent?.();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowOptions(true)}
        className="p-2 rounded-full bg-accent hover:bg-accent/80 transition-colors"
        title="Send a compliment"
      >
        <Heart className="w-5 h-5 text-pink-500" />
      </button>

      {showOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Send a Compliment</h3>
              <p className="text-sm text-muted-foreground">
                Stand out before you match!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {complimentTypes.map((ct) => (
                <button
                  key={ct.type}
                  onClick={() => handleSend(ct.type)}
                  disabled={sending}
                  className="p-4 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50"
                >
                  <div className="text-3xl mb-2">{ct.icon}</div>
                  <div className="text-sm font-medium">{ct.label}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowOptions(false)}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
