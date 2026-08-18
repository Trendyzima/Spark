import { useState } from 'react';
import { MapPin, Info } from 'lucide-react';
import type { Profile } from '@/types';

interface ProfileCardProps {
  profile: Profile;
  onSwipe?: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
}

export function ProfileCard({ profile, onSwipe, style }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const photos = profile.photos.length > 0 
    ? profile.photos 
    : ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop'];

  const handlePhotoClick = (e: React.MouseEvent) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    if (x < rect.width / 2 && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    } else if (x >= rect.width / 2 && currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  return (
    <div
      className="absolute inset-0 select-none"
      style={style}
    >
      <div className="relative w-full h-full bg-card rounded-3xl overflow-hidden shadow-2xl">
        {/* Photo */}
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={handlePhotoClick}
        >
          <img
            src={photos[currentPhotoIndex]}
            alt={profile.display_name}
            className="w-full h-full object-cover"
          />
          
          {/* Photo indicators */}
          {photos.length > 1 && (
            <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <div
                    className={`h-full bg-white transition-all ${
                      index <= currentPhotoIndex ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-3xl font-bold mb-1">
                {profile.display_name}, {profile.age}
              </h2>
              {profile.location && (
                <div className="flex items-center gap-1 text-white/90">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Interests */}
          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Expanded info */}
        {showInfo && (
          <div className="absolute inset-0 bg-black/95 p-6 overflow-y-auto animate-fade-in">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              ✕
            </button>
            
            <div className="text-white space-y-6 mt-12">
              <div>
                <h3 className="text-2xl font-bold mb-2">{profile.display_name}</h3>
                <p className="text-white/70">{profile.age} years old</p>
              </div>

              {profile.bio && (
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-white/80">{profile.bio}</p>
                </div>
              )}

              {profile.interests.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full bg-white/20 text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
