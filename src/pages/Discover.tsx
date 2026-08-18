import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { X, Heart, RotateCcw, Zap, TrendingUp, Undo2, Crown, Play } from 'lucide-react';
import { VideoMessage } from '@/components/features/VideoMessage';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { ProfileCard } from '@/components/features/ProfileCard';
import { MatchModal } from '@/components/features/MatchModal';
import { Stories } from '@/components/features/Stories';
import { AdUnit } from '@/components/features/AdUnit';
import { SponsoredProfileCard } from '@/components/features/SponsoredProfileCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Profile, ProfileBoost, SponsoredProfile } from '@/types';
import { Button } from '@/components/ui/button';

export function Discover() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [superLikesUsed, setSuperLikesUsed] = useState(0);
  const [activeBoost, setActiveBoost] = useState<ProfileBoost | null>(null);
  const [canRewind, setCanRewind] = useState(false);
  const [compatibilityScore, setCompatibilityScore] = useState<number>(0);
  const [sponsoredProfiles, setSponsoredProfiles] = useState<SponsoredProfile[]>([]);
  const [showAd, setShowAd] = useState(false);
  const [profilesViewed, setProfilesViewed] = useState(0);

  const [{ x, rotate }, springApi] = useSpring(() => ({
    x: 0,
    rotate: 0,
  }));

  useEffect(() => {
    loadProfiles();
    loadUserData();
    loadSponsoredContent();
  }, [user]);

  useEffect(() => {
    if (user && profiles[currentIndex]) {
      loadCompatibilityScore(profiles[currentIndex].id);
      // Record profile view
      api.recordProfileView(user.id, profiles[currentIndex].id);
      
      // Show ad every 5 profiles for free users
      setProfilesViewed(prev => prev + 1);
      if (!userProfile?.is_premium && profilesViewed > 0 && profilesViewed % 5 === 0) {
        setShowAd(true);
      }
    }
  }, [currentIndex, profiles, profilesViewed]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [superLikesCount, boost] = await Promise.all([
        api.getSuperLikesCount(user.id),
        api.getActiveBoost(user.id),
      ]);

      setSuperLikesUsed(superLikesCount);
      setActiveBoost(boost);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadCompatibilityScore = async (profileId: string) => {
    if (!user) return;

    try {
      const score = await api.getCompatibilityScore(user.id, profileId);
      setCompatibilityScore(score);
    } catch (error) {
      console.error('Error loading compatibility:', error);
    }
  };

  const loadSponsoredContent = async () => {
    try {
      const sponsored = await api.getSponsoredProfiles(3);
      setSponsoredProfiles(sponsored);
    } catch (error) {
      console.error('Error loading sponsored content:', error);
    }
  };

  const loadProfiles = async () => {
    if (!user) return;

    try {
      const profile = await api.getProfile(user.id);
      if (!profile) return;
      
      setUserProfile(profile);
      const data = await api.getDiscoverProfiles(user.id, profile.looking_for);
      setProfiles(data);
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

  const handleSwipe = async (direction: 'left' | 'right', isSuperLike = false) => {
    if (!user || currentIndex >= profiles.length) return;

    const profile = profiles[currentIndex];

    try {
      if (direction === 'right') {
        if (isSuperLike) {
          // Check super like limit based on subscription
          const maxSuperLikes = userProfile?.is_premium ? 10 : 5;
          if (superLikesUsed >= maxSuperLikes) {
            toast({
              title: 'Super Like Limit Reached',
              description: `Upgrade to premium for more super likes!`,
              variant: 'destructive',
            });
            return;
          }

          await api.superLikeProfile(user.id, profile.id);
          setSuperLikesUsed(prev => prev + 1);
          toast({
            title: '⚡ Super Like Sent!',
            description: `${profile.display_name} will be notified`,
          });
        } else {
          await api.likeProfile(user.id, profile.id);
        }
        
        // Check if it's a match
        const { data } = await api.supabase
          .from('likes')
          .select('*')
          .eq('liker_id', profile.id)
          .eq('liked_id', user.id)
          .maybeSingle();

        if (data) {
          setMatchedProfile(profile);
        }
      } else {
        await api.passProfile(user.id, profile.id);
      }

      setCurrentIndex(prev => prev + 1);
      setCanRewind(true);
      springApi.start({ x: 0, rotate: 0 });
    } catch (error: any) {
      console.error('Swipe error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleRewind = async () => {
    if (!user || !canRewind) return;

    // Premium feature check
    if (!userProfile?.is_premium) {
      toast({
        title: 'Premium Feature',
        description: 'Upgrade to use Rewind',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await api.rewindLastAction(user.id);
      if (result) {
        setCurrentIndex(prev => Math.max(0, prev - 1));
        setCanRewind(false);
        toast({ title: '↩️ Action Undone!' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBoost = async () => {
    if (!user) return;

    if (activeBoost) {
      toast({
        title: 'Boost Active',
        description: 'You already have an active boost',
      });
      return;
    }

    if (!userProfile?.is_premium) {
      toast({
        title: 'Premium Feature',
        description: 'Upgrade to boost your profile',
        variant: 'destructive',
      });
      return;
    }

    try {
      const boost = await api.activateBoost(user.id, '1hour');
      setActiveBoost(boost);
      toast({
        title: '🚀 Profile Boosted!',
        description: 'You\'re now 10x more visible for 1 hour',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSponsoredProfileClick = async (sponsoredProfile: SponsoredProfile) => {
    if (!user) return;

    try {
      await api.trackSponsoredProfileClick(sponsoredProfile.id);
      // Could navigate to full profile view or trigger like action
      if (sponsoredProfile.profile) {
        await api.likeProfile(user.id, sponsoredProfile.profile.id);
        toast({
          title: 'Liked!',
          description: `You liked ${sponsoredProfile.profile.display_name}`,
        });
      }
    } catch (error: any) {
      console.error('Error handling sponsored profile click:', error);
    }
  };

  const bind = useDrag(
    ({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      const trigger = vx > 0.2;
      const dir = xDir < 0 ? -1 : 1;

      if (!down && trigger) {
        handleSwipe(dir === 1 ? 'right' : 'left');
        springApi.start({
          x: (200 + window.innerWidth) * dir,
          rotate: dir * 25,
        });
      } else {
        springApi.start({
          x: down ? mx : 0,
          rotate: down ? mx / 20 : 0,
          immediate: down,
        });
      }
    },
    {
      axis: 'x',
      bounds: { left: -200, right: 200 },
      rubberband: true,
    }
  );

  const currentProfile = profiles[currentIndex];

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
      
      {/* Stories - at the very top */}
      <Stories />
      
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-md mx-auto space-y-4">

          {/* Active Boost Banner */}
          {activeBoost && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-4 flex items-center gap-3">
              <TrendingUp className="w-6 h-6" />
              <div className="flex-1">
                <p className="font-semibold">Boost Active! 🚀</p>
                <p className="text-sm text-white/90">
                  Expires {new Date(activeBoost.expires_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}

          {/* Sponsored Profiles Section */}
          {sponsoredProfiles.length > 0 && currentIndex % 10 === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <Crown className="w-5 h-5 text-yellow-500 fill-current" />
                <h2 className="font-semibold text-lg">Featured Profiles</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sponsoredProfiles.slice(0, 2).map((sp) => (
                  <div key={sp.id} className="h-80">
                    <SponsoredProfileCard
                      sponsoredProfile={sp}
                      onView={() => api.trackSponsoredProfileView(sp.id)}
                      onClick={() => handleSponsoredProfileClick(sp)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad Unit - Show every 5 profiles for free users */}
          {showAd && !userProfile?.is_premium && (
            <AdUnit
              placementKey="discover_feed"
              showCloseButton
              onClose={() => setShowAd(false)}
              className="my-4"
            />
          )}

          {/* Card Stack */}
          <div className="relative" style={{ height: '60vh' }}>
            {!currentProfile ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
                <RotateCcw className="w-16 h-16 text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">No More Profiles</h3>
                  <p className="text-muted-foreground">Check back later for new matches!</p>
                </div>
              </div>
            ) : (
              <>
                {/* Next card (preview) */}
                {profiles[currentIndex + 1] && (
                  <div className="absolute inset-0 scale-95 opacity-50">
                    <ProfileCard profile={profiles[currentIndex + 1]} />
                  </div>
                )}

                {/* Current card */}
                <animated.div
                  {...bind()}
                  style={{
                    x,
                    rotate,
                    touchAction: 'none',
                  }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                >
                  <div className="relative h-full">
                    <ProfileCard profile={currentProfile} />
                    
                    {/* Video Indicator */}
                    {currentProfile.videos && currentProfile.videos.length > 0 && (
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
                        <Play className="w-4 h-4 fill-white" />
                        <span className="text-sm font-semibold">{currentProfile.videos.length} Video{currentProfile.videos.length > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    
                    {/* Compatibility Badge */}
                    {compatibilityScore > 0 && (
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full px-4 py-2 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 fill-current" />
                          <span className="font-semibold">{compatibilityScore}% Match</span>
                        </div>
                      </div>
                    )}
                  </div>
                </animated.div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {currentProfile && (
            <div className="space-y-4">
              {/* Main Actions */}
              <div className="flex items-center justify-center gap-4">
                {/* Rewind */}
                <button
                  onClick={handleRewind}
                  disabled={!canRewind || !userProfile?.is_premium}
                  className="w-12 h-12 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Undo2 className="w-5 h-5 text-yellow-500" />
                </button>

                {/* Pass */}
                <button
                  onClick={() => handleSwipe('left')}
                  className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <X className="w-8 h-8 text-destructive" />
                </button>

                {/* Super Like */}
                <button
                  onClick={() => handleSwipe('right', true)}
                  className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Zap className="w-7 h-7 text-white fill-current" />
                </button>

                {/* Like */}
                <button
                  onClick={() => handleSwipe('right')}
                  className="w-16 h-16 rounded-full gradient-primary shadow-lg shadow-primary/50 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Heart className="w-8 h-8 text-white fill-current" />
                </button>

                {/* Boost */}
                <button
                  onClick={handleBoost}
                  disabled={!!activeBoost || !userProfile?.is_premium}
                  className="w-12 h-12 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </button>
              </div>

              {/* Super Likes Counter */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {superLikesUsed}/{userProfile?.is_premium ? 10 : 5} Super Likes used today
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Match Modal */}
      {matchedProfile && (
        <MatchModal
          profile={matchedProfile}
          onClose={() => setMatchedProfile(null)}
        />
      )}
    </div>
  );
}
