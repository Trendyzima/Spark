import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Heart } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AdUnit } from '@/components/features/AdUnit';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Match, Profile } from '@/types';

export function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    loadMatches();
    loadUserProfile();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      const data = await api.getMatches(user.id);
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await api.getProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
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
          <div>
            <h1 className="text-3xl font-bold mb-2">Matches</h1>
            <p className="text-muted-foreground">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
            </p>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
                <p className="text-muted-foreground">
                  Keep swiping to find your perfect match!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map((match, index) => {
                if (!match.profile) return null;
                
                const photo = match.profile.photos[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop';

                return (
                  <div key={match.id}>
                    <button
                      onClick={() => navigate(`/chat/${match.id}`)}
                      className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl hover:bg-accent transition-colors text-left group"
                    >
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                          <img
                            src={photo}
                            alt={match.profile.display_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {match.unread_count! > 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">
                            {match.unread_count}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {match.profile.display_name}
                        </h3>
                        {match.profile.bio && (
                          <p className="text-sm text-muted-foreground truncate">
                            {match.profile.bio}
                          </p>
                        )}
                      </div>

                      <MessageCircle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>

                    {/* Show ad every 4 matches for free users */}
                    {!userProfile?.is_premium && (index + 1) % 4 === 0 && index !== matches.length - 1 && (
                      <div className="my-4">
                        <AdUnit placementKey="matches_list" />
                      </div>
                    )}
                  </div>
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
