import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/types';

interface MatchModalProps {
  profile: Profile;
  onClose: () => void;
}

export function MatchModal({ profile, onClose }: MatchModalProps) {
  const navigate = useNavigate();

  const photo = profile.photos.length > 0 
    ? profile.photos[0] 
    : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="max-w-md w-full space-y-6 animate-match-celebrate">
        {/* Header */}
        <div className="text-center space-y-2">
          <Sparkles className="w-16 h-16 mx-auto text-primary animate-pulse" />
          <h2 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">
            It's a Match!
          </h2>
          <p className="text-muted-foreground">
            You and {profile.display_name} liked each other
          </p>
        </div>

        {/* Profile Image */}
        <div className="relative">
          <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary shadow-2xl shadow-primary/50">
            <img
              src={photo}
              alt={profile.display_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate('/matches')}
            className="w-full gradient-primary text-white hover:opacity-90 h-12 text-lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Send Message
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-12"
          >
            Keep Swiping
          </Button>
        </div>
      </div>
    </div>
  );
}
