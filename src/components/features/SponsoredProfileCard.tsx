import { useEffect, useState } from 'react';
import { Crown, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { SponsoredProfile } from '@/types';

interface SponsoredProfileCardProps {
  sponsoredProfile: SponsoredProfile;
  onView?: () => void;
  onClick?: () => void;
}

export function SponsoredProfileCard({ sponsoredProfile, onView, onClick }: SponsoredProfileCardProps) {
  const [viewed, setViewed] = useState(false);

  useEffect(() => {
    if (!viewed && onView) {
      onView();
      setViewed(true);
    }
  }, [viewed, onView]);

  const profile = sponsoredProfile.profile;
  if (!profile) return null;

  const photo = profile.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&h=1000&fit=crop';

  return (
    <div
      onClick={onClick}
      className="relative bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10 rounded-3xl overflow-hidden border-2 border-primary/30 shadow-lg cursor-pointer group hover:scale-[1.02] transition-transform"
    >
      {/* Sponsored Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full shadow-lg">
          <Crown className="w-4 h-4 text-white fill-white" />
          <span className="text-xs font-bold text-white">SPONSORED</span>
        </div>
      </div>

      {/* Priority Indicator */}
      {sponsoredProfile.priority > 5 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Profile Image */}
      <div className="aspect-[3/4] relative overflow-hidden">
        <img
          src={photo}
          alt={profile.display_name}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Profile Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h3 className="text-2xl font-bold mb-1">
                {profile.display_name}, {profile.age}
              </h3>
              {profile.location && (
                <p className="text-sm text-white/90">{profile.location}</p>
              )}
            </div>
            {profile.is_verified && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            )}
          </div>

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sponsor Info */}
      <div className="p-3 bg-card/50 backdrop-blur-sm border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Sponsored by <span className="font-semibold">{sponsoredProfile.sponsor_name}</span>
        </p>
      </div>
    </div>
  );
}
