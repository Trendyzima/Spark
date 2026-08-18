import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Story } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function Stories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showViewer, setShowViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const data = await api.getStories();
      
      // Sort by latest and most viewed
      const sortedStories = data.sort((a, b) => {
        // First priority: newest stories
        const dateCompare = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (Math.abs(dateCompare) > 3600000) { // If difference > 1 hour
          return dateCompare;
        }
        // Second priority: most viewed
        return b.views_count - a.views_count;
      });
      
      setStories(sortedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStory = async (index: number) => {
    setCurrentStoryIndex(index);
    setShowViewer(true);
    
    if (user) {
      await api.viewStory(stories[index].id, user.id);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      if (user) {
        api.viewStory(stories[currentStoryIndex + 1].id, user.id);
      }
    } else {
      setShowViewer(false);
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  // Group stories by user
  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.user_id]) {
      acc[story.user_id] = [];
    }
    acc[story.user_id].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  // Sort grouped stories by latest and most viewed
  const sortedUserStories = Object.entries(groupedStories)
    .map(([userId, userStories]) => ({
      userId,
      stories: userStories,
      latestStory: userStories[0],
      totalViews: userStories.reduce((sum, s) => sum + s.views_count, 0),
      hasUnviewed: userStories.some(s => !s.viewed_by_me),
    }))
    .sort((a, b) => {
      // Prioritize unviewed stories
      if (a.hasUnviewed !== b.hasUnviewed) {
        return a.hasUnviewed ? -1 : 1;
      }
      // Then by latest
      const dateCompare = new Date(b.latestStory.created_at).getTime() - new Date(a.latestStory.created_at).getTime();
      if (Math.abs(dateCompare) > 3600000) {
        return dateCompare;
      }
      // Finally by total views
      return b.totalViews - a.totalViews;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-20 bg-background/95 backdrop-blur-lg z-40 border-b border-border">
        <div className="flex gap-3 overflow-x-auto py-3 px-4 hide-scrollbar">
          {/* Add Story Button */}
          <button
            onClick={() => setShowUpload(true)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 min-w-[72px]"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-accent to-secondary flex items-center justify-center shadow-lg">
                <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                <Upload className="w-3 h-3 text-white" />
              </div>
            </div>
            <span className="text-[10px] font-medium text-foreground">Your Story</span>
          </button>

          {/* Stories - Sorted by latest and most viewed */}
          {sortedUserStories.map((userStory) => {
            const story = userStory.latestStory;
            const profile = story.profile;
            const photo = profile?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';
            const isUnviewed = userStory.hasUnviewed;

            return (
              <button
                key={userStory.userId}
                onClick={() => handleViewStory(stories.findIndex(s => s.id === story.id))}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 min-w-[72px]"
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full p-[2px] ${
                    isUnviewed
                      ? 'bg-gradient-to-tr from-primary via-accent to-secondary'
                      : 'bg-border'
                  } shadow-md`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-background p-[2px]">
                      <img
                        src={photo}
                        alt={profile?.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  </div>
                  {/* View count badge for popular stories */}
                  {userStory.totalViews > 50 && (
                    <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-[9px] font-bold text-white shadow-lg">
                      🔥 {userStory.totalViews}
                    </div>
                  )}
                  {/* New badge for very recent stories */}
                  {new Date().getTime() - new Date(story.created_at).getTime() < 3600000 && (
                    <div className="absolute -top-1 -left-1 px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-[9px] font-bold text-white shadow-lg">
                      NEW
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium truncate w-16 text-center text-foreground">
                  {profile?.display_name || 'User'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Story Viewer */}
      {showViewer && stories[currentStoryIndex] && (
        <StoryViewer
          story={stories[currentStoryIndex]}
          onClose={() => setShowViewer(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={currentStoryIndex < stories.length - 1}
          hasPrevious={currentStoryIndex > 0}
        />
      )}

      {/* Upload Story Modal */}
      {showUpload && (
        <UploadStoryModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            loadStories();
          }}
        />
      )}
    </>
  );
}

function StoryViewer({
  story,
  onClose,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
}: {
  story: Story;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}) {
  const profile = story.profile;
  const photo = profile?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasNext) {
        onNext();
      } else {
        onClose();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [story.id]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img src={photo} alt={profile?.display_name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="font-semibold text-white">{profile?.display_name}</p>
              <p className="text-xs text-white/70">
                {new Date(story.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-16 left-0 right-0 px-4 z-10">
        <div className="h-0.5 bg-white/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full animate-progress"
            style={{ animationDuration: '5s' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full h-full flex items-center justify-center">
        {story.media_type === 'photo' ? (
          <img
            src={story.media_url}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            src={story.media_url}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted
          />
        )}
      </div>

      {/* Caption */}
      {story.caption && (
        <div className="absolute bottom-4 left-0 right-0 px-4 z-10">
          <p className="text-white text-center">{story.caption}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="absolute inset-0 flex">
        {hasPrevious && (
          <button onClick={onPrevious} className="flex-1" />
        )}
        {hasNext && (
          <button onClick={onNext} className="flex-1" />
        )}
      </div>
    </div>
  );
}

function UploadStoryModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    setUploading(true);
    try {
      const bucket = mediaType === 'photo' ? 'profile-photos' : 'profile-videos';
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const url = await api.uploadFile(bucket, path, file);

      await api.createStory(user.id, mediaType, url, caption);

      toast({ title: 'Story posted!' });
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Add to Story</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <input
              type="file"
              accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="w-full"
            />
          </div>

          <div>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary text-white"
            disabled={uploading || !file}
          >
            {uploading ? 'Uploading...' : 'Post Story'}
          </Button>
        </form>
      </div>
    </div>
  );
}
