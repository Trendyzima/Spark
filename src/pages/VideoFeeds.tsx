import { useState, useEffect } from 'react';
import { VideoFeed } from '@/components/features/VideoFeed';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function VideoFeeds() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    if (!user) return;

    try {
      // Get all profiles with videos
      const { data, error } = await api.supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .not('videos', 'eq', '[]')
        .limit(50);

      if (error) throw error;

      // Flatten videos from all profiles
      const allVideos: any[] = [];
      (data || []).forEach((profile) => {
        if (profile.videos && Array.isArray(profile.videos)) {
          profile.videos.forEach((videoUrl: string, index: number) => {
            allVideos.push({
              id: `${profile.id}-${index}`,
              video_url: videoUrl,
              profile,
              likes_count: Math.floor(Math.random() * 1000), // In real app, track this
              is_liked: false,
            });
          });
        }
      });

      // Shuffle for variety
      const shuffled = allVideos.sort(() => Math.random() - 0.5);
      setVideos(shuffled);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-lg mb-2">No videos yet</p>
        <p className="text-sm text-white/70 text-center">
          Upload a video to your profile to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
      
      <VideoFeed
        videos={videos}
        currentIndex={currentIndex}
        onIndexChange={setCurrentIndex}
      />
    </div>
  );
}
