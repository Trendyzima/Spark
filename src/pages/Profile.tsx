import { useState, useEffect } from 'react';
import { Camera, MapPin, Briefcase, GraduationCap, Heart, Edit, Sparkles, Crown, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Profile as ProfileType, UserSubscription } from '@/types';

export function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const [profileData, subData] = await Promise.all([
        api.getProfile(user.id),
        api.getUserSubscription(user.id),
      ]);

      setProfile(profileData);
      setSubscription(subData);
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

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const photo = profile.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=500&fit=crop';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Premium Badge */}
          {profile.is_premium && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 flex items-center gap-3">
              <Crown className="w-6 h-6 text-white" />
              <div className="flex-1 text-white">
                <p className="font-semibold">Premium Member</p>
                <p className="text-sm text-white/90">
                  {subscription?.subscription_tiers?.name || 'Active subscription'}
                </p>
              </div>
              <Button
                onClick={() => navigate('/premium')}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Manage
              </Button>
            </div>
          )}

          {/* Main Photo */}
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden">
            <img
              src={photo}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-4xl font-bold">{profile.display_name}, {profile.age}</h1>
                {profile.is_verified && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              
              {profile.location && (
                <div className="flex items-center gap-2 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate('/setup-profile')}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>

          {/* About */}
          {profile.bio && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                About Me
              </h3>
              <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Work & Education */}
          {(profile.occupation || profile.education) && (
            <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
              {profile.occupation && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Work</div>
                    <div className="font-medium">{profile.occupation}</div>
                  </div>
                </div>
              )}

              {profile.education && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Education</div>
                    <div className="font-medium">{profile.education}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {interest}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos & Videos Grid */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Photos & Videos ({(profile.photos?.length || 0) + (profile.videos?.length || 0)})
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {/* Videos */}
              {profile.videos && profile.videos.length > 0 && profile.videos.map((video, index) => (
                <div
                  key={`video-${index}`}
                  className="aspect-square rounded-xl overflow-hidden relative group cursor-pointer"
                  onClick={() => navigate('/video-feeds')}
                >
                  <video
                    src={video}
                    className="w-full h-full object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Video
                    </div>
                  </div>
                </div>
              ))}
              {/* Photos */}
              {profile.photos.map((photo, index) => (
                <div
                  key={`photo-${index}`}
                  className="aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => navigate('/setup-profile')}
            className="w-full h-12 gradient-primary text-white text-lg"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
