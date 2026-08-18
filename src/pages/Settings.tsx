import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Crown, Edit, Camera } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/auth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Profile, UserSubscription } from '@/types';

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [profileData, subData] = await Promise.all([
        api.getProfile(user.id),
        api.getUserSubscription(user.id),
      ]);

      setProfile(profileData);
      setSubscription(subData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      logout();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const photo = profile.photos[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <div className="bg-card rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </div>
                {profile.is_premium && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold truncate">{profile.display_name}</h2>
                  {profile.is_verified && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <Button
                onClick={() => navigate('/setup-profile')}
                variant="outline"
                size="icon"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            {profile.bio && (
              <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{profile.photos.length}</div>
                <div className="text-xs text-muted-foreground">Photos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{profile.videos.length}</div>
                <div className="text-xs text-muted-foreground">Videos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{profile.interests.length}</div>
                <div className="text-xs text-muted-foreground">Interests</div>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          {subscription && subscription.status === 'active' ? (
            <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-2xl text-white">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-6 h-6" />
                <h3 className="text-lg font-semibold">Premium Member</h3>
              </div>
              <p className="text-white/90 mb-4">
                {subscription.subscription_tiers?.name} • ${(subscription.subscription_tiers?.price_cents || 0) / 100}/month
              </p>
              <p className="text-sm text-white/80">
                Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    Unlock exclusive features and FansOnly access
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/premium')}
                className="w-full gradient-primary text-white"
              >
                View Plans
              </Button>
            </div>
          )}

          {/* Menu Items */}
          <div className="bg-card rounded-2xl overflow-hidden">
            <button
              onClick={() => navigate('/setup-profile')}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-accent transition-colors border-b border-border"
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left font-medium">Edit Profile</span>
            </button>

            <button
              onClick={() => navigate('/premium')}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-accent transition-colors border-b border-border"
            >
              <Crown className="w-5 h-5 text-primary" />
              <span className="flex-1 text-left font-medium">Premium Plans</span>
            </button>

            <button
              onClick={() => navigate('/fansonly')}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-accent transition-colors border-b border-border"
            >
              <Camera className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1 text-left font-medium">FansOnly Content</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-destructive/10 transition-colors text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">Log Out</span>
            </button>
          </div>

          {/* App Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Spark v1.0</p>
            <p>Find your perfect match</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
