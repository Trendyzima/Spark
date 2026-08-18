import { useState, useEffect } from 'react';
import { Heart, X, Sparkles, Crown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { DailyStandout } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function Standouts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [standouts, setStandouts] = useState<DailyStandout[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStandout, setSelectedStandout] = useState<DailyStandout | null>(null);
  const [roseMessage, setRoseMessage] = useState('');
  const [sendingRose, setSendingRose] = useState(false);

  useEffect(() => {
    loadStandouts();
  }, [user]);

  const loadStandouts = async () => {
    if (!user) return;

    try {
      const data = await api.getDailyStandouts(user.id);
      setStandouts(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRose = async () => {
    if (!user || !selectedStandout) return;

    setSendingRose(true);
    try {
      await api.sendRose(user.id, selectedStandout.standout_profile_id, roseMessage);
      
      toast({
        title: '🌹 Rose Sent!',
        description: `${selectedStandout.profile?.display_name} will be notified of your special interest`,
      });

      setSelectedStandout(null);
      setRoseMessage('');
      
      // Also like the profile
      await api.likeProfile(user.id, selectedStandout.standout_profile_id);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSendingRose(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <h1 className="text-3xl font-bold">Today's Top Picks</h1>
              <Sparkles className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-muted-foreground">
              Curated matches with the highest compatibility just for you
            </p>
          </div>

          {/* Standouts Grid */}
          {standouts.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Check Back Tomorrow</h3>
              <p className="text-muted-foreground">
                New top picks are curated daily based on your preferences
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {standouts.map((standout) => {
                const profile = standout.profile;
                if (!profile) return null;

                const photo = profile.photos[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=500&fit=crop';

                return (
                  <div
                    key={standout.id}
                    className="relative rounded-3xl overflow-hidden cursor-pointer group"
                    style={{ aspectRatio: '3/4' }}
                    onClick={() => setSelectedStandout(standout)}
                  >
                    <img
                      src={photo}
                      alt={profile.display_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Compatibility Badge */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg">
                        {standout.compatibility_score}% Match
                      </div>
                    </div>

                    {/* Profile Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold">
                          {profile.display_name}, {profile.age}
                        </h3>
                        {profile.is_verified && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      {profile.occupation && (
                        <p className="text-sm text-white/90">{profile.occupation}</p>
                      )}
                      {profile.location && (
                        <p className="text-xs text-white/75">{profile.location}</p>
                      )}
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">
                        Send Rose 🌹
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Rose Modal */}
      {selectedStandout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-3xl">🌹</span>
                Send a Rose
              </h3>
              <button
                onClick={() => {
                  setSelectedStandout(null);
                  setRoseMessage('');
                }}
                className="p-2 hover:bg-accent rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-4">
              <p className="text-muted-foreground">
                Stand out from the crowd! Send {selectedStandout.profile?.display_name} a rose
                with a personal message to show your special interest.
              </p>
            </div>

            <Textarea
              value={roseMessage}
              onChange={(e) => setRoseMessage(e.target.value)}
              placeholder="Write a message (optional)"
              rows={3}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedStandout(null);
                  setRoseMessage('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendRose}
                disabled={sendingRose}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
              >
                {sendingRose ? 'Sending...' : 'Send Rose 🌹'}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Roses are a premium feature. You have unlimited roses with your subscription.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
