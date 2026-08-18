import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Pause, Play, Volume2, VolumeX, MoreVertical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Profile } from '@/types';

interface VideoFeedItem {
  id: string;
  video_url: string;
  profile: Profile;
  likes_count: number;
  is_liked: boolean;
}

interface VideoFeedProps {
  videos: VideoFeedItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function VideoFeed({ videos, currentIndex, onIndexChange }: VideoFeedProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Play current video, pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex && !isPaused) {
          video.play().catch(console.error);
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex, isPaused]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const itemHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < videos.length) {
      onIndexChange(newIndex);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, videos.length]);

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar"
      style={{ scrollBehavior: 'smooth' }}
    >
      {videos.map((item, index) => (
        <div
          key={item.id}
          className="h-screen snap-start relative"
        >
          <VideoFeedItem
            item={item}
            isActive={index === currentIndex}
            isPaused={isPaused}
            isMuted={isMuted}
            onPauseToggle={() => setIsPaused(!isPaused)}
            onMuteToggle={() => setIsMuted(!isMuted)}
            videoRef={(el) => (videoRefs.current[index] = el)}
          />
        </div>
      ))}
    </div>
  );
}

interface VideoFeedItemProps {
  item: VideoFeedItem;
  isActive: boolean;
  isPaused: boolean;
  isMuted: boolean;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
  videoRef: (el: HTMLVideoElement | null) => void;
}

function VideoFeedItem({
  item,
  isActive,
  isPaused,
  isMuted,
  onPauseToggle,
  onMuteToggle,
  videoRef,
}: VideoFeedItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(item.is_liked);
  const [likesCount, setLikesCount] = useState(item.likes_count);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (liked) {
        // Unlike logic would go here
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await api.likeProfile(user.id, item.profile.id);
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Check out ${item.profile.display_name}'s video`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const profilePhoto = item.profile.photos[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={item.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onClick={onPauseToggle}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

      {/* Pause/Play indicator */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="w-10 h-10 text-white fill-white ml-2" />
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            <img src={profilePhoto} alt={item.profile.display_name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-semibold text-white">{item.profile.display_name}</p>
            <p className="text-xs text-white/80">{item.profile.location || 'Nearby'}</p>
          </div>
        </div>
        <button className="text-white">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-20 p-4 z-10">
        <div className="space-y-2">
          <p className="font-semibold text-white">
            @{item.profile.display_name}
          </p>
          {item.profile.bio && (
            <p className="text-sm text-white/90 line-clamp-2">{item.profile.bio}</p>
          )}
          {item.profile.interests && item.profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.profile.interests.slice(0, 3).map((interest, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side actions */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-6 z-10">
        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-12 h-12 rounded-full ${liked ? 'bg-red-500' : 'bg-white/20'} backdrop-blur-sm flex items-center justify-center transition-all`}>
            <Heart className={`w-6 h-6 ${liked ? 'text-white fill-white' : 'text-white'}`} />
          </div>
          <span className="text-xs text-white font-semibold">
            {likesCount > 0 ? likesCount : ''}
          </span>
        </button>

        {/* Comment */}
        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs text-white font-semibold">Chat</span>
        </button>

        {/* Share */}
        <button onClick={handleShare} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </div>
        </button>

        {/* Mute */}
        <button onClick={onMuteToggle} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
