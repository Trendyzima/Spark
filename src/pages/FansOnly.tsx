import { useState, useEffect } from 'react';
import { Lock, Heart, Eye, DollarSign, Upload, X, Loader2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { FansOnlyContent } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

const MAX_FANSONLY_PHOTOS = 10;
const MAX_FANSONLY_VIDEOS = 5;

export function FansOnly() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [content, setContent] = useState<FansOnlyContent[]>([]);
  const [myContent, setMyContent] = useState<FansOnlyContent[]>([]);
  const [purchases, setPurchases] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'my-content'>('explore');
  
  // Upload form
  const [uploading, setUploading] = useState(false);
  const [contentType, setContentType] = useState<'photo' | 'video'>('photo');
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [price, setPrice] = useState('5');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    loadContent();
  }, [user]);

  const loadContent = async () => {
    if (!user) return;

    try {
      const [allContent, userContent, userPurchases] = await Promise.all([
        api.getFansOnlyContent(),
        api.getMyFansOnlyContent(user.id),
        api.getFansOnlyPurchases(user.id),
      ]);

      setContent(allContent);
      setMyContent(userContent);
      setPurchases(userPurchases);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    const bucket = contentType === 'photo' ? 'fansonly-photos' : 'fansonly-videos';
    const maxFiles = contentType === 'photo' ? MAX_FANSONLY_PHOTOS : MAX_FANSONLY_VIDEOS;

    if (myContent.filter(c => c.content_type === contentType).length >= maxFiles) {
      toast({
        title: 'Limit Reached',
        description: `You can upload maximum ${maxFiles} ${contentType}s`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const url = await api.uploadFile(bucket, path, file);

      await api.createFansOnlyContent(user.id, {
        content_type: contentType,
        file_url: url,
        caption: caption.trim(),
        price_cents: Math.round(parseFloat(price) * 100),
        is_public: isPublic,
      });

      toast({ title: 'Content uploaded successfully!' });
      setShowUpload(false);
      setFile(null);
      setCaption('');
      setPrice('5');
      setIsPublic(false);
      loadContent();
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

  const handleUnlock = async (contentId: string) => {
    try {
      const { data, error } = await api.supabase.functions.invoke('create-fansonly-checkout', {
        body: { contentId },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
          } catch {
            errorMessage = `${error.message || 'Failed to read response'}`;
          }
        }
        throw new Error(errorMessage);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await api.deleteFansOnlyContent(contentId);
      toast({ title: 'Content deleted successfully' });
      loadContent();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const canAccess = (item: FansOnlyContent) => {
    return item.is_public || item.creator_id === user?.id || purchases.has(item.id);
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">FansOnly</h1>
              <p className="text-muted-foreground">Exclusive premium content</p>
            </div>
            <Button
              onClick={() => setShowUpload(true)}
              className="gradient-primary text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'explore'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab('my-content')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'my-content'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              My Content ({myContent.length})
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(activeTab === 'explore' ? content : myContent).map((item) => {
              const locked = !canAccess(item);
              const creatorPhoto = item.profiles?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

              return (
                <div key={item.id} className="bg-card rounded-2xl overflow-hidden group">
                  <div className="relative aspect-square">
                    {locked && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
                        <Lock className="w-12 h-12 text-white" />
                      </div>
                    )}
                    
                    {item.content_type === 'photo' ? (
                      <img
                        src={item.file_url}
                        alt={item.caption || ''}
                        className={`w-full h-full object-cover ${locked ? 'blur-xl' : ''}`}
                      />
                    ) : (
                      <video
                        src={item.file_url}
                        className={`w-full h-full object-cover ${locked ? 'blur-xl' : ''}`}
                        controls={!locked}
                      />
                    )}

                    {/* Creator Info */}
                    {activeTab === 'explore' && (
                      <div className="absolute top-2 left-2 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                        <div className="w-6 h-6 rounded-full overflow-hidden">
                          <img src={creatorPhoto} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-white font-medium">
                          {item.profiles?.display_name}
                        </span>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 right-2">
                      <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                        {item.content_type === 'photo' ? (
                          <ImageIcon className="w-4 h-4 text-white" />
                        ) : (
                          <VideoIcon className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {item.caption && (
                      <p className="text-sm line-clamp-2">{item.caption}</p>
                    )}

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.views_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {item.likes_count}
                        </span>
                      </div>
                      {!item.is_public && (
                        <span className="font-semibold text-primary">
                          ${(item.price_cents / 100).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {locked ? (
                      <Button
                        onClick={() => handleUnlock(item.id)}
                        className="w-full gradient-primary text-white"
                        size="sm"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock ${(item.price_cents / 100).toFixed(2)}
                      </Button>
                    ) : activeTab === 'my-content' && (
                      <Button
                        onClick={() => handleDelete(item.id)}
                        variant="destructive"
                        className="w-full"
                        size="sm"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {((activeTab === 'explore' && content.length === 0) || 
            (activeTab === 'my-content' && myContent.length === 0)) && (
            <div className="text-center py-20">
              <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No content yet</h3>
              <p className="text-muted-foreground">
                {activeTab === 'explore' 
                  ? 'Check back later for exclusive content'
                  : 'Upload your first content to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Upload Content</h3>
              <button onClick={() => setShowUpload(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Content Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setContentType('photo')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      contentType === 'photo'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentType('video')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      contentType === 'video'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <VideoIcon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Video</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">File</label>
                <input
                  type="file"
                  accept={contentType === 'photo' ? 'image/*' : 'video/*'}
                  onChange={handleFileSelect}
                  required
                  className="w-full mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Caption</label>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your content..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price (USD)</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="1"
                  step="0.01"
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is-public"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="is-public" className="text-sm">
                  Make this content free (public)
                </label>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-white"
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
