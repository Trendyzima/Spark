import { useState, useEffect } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { TargetedAd } from '@/types';

interface AdUnitProps {
  placementKey: string;
  className?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
}

export function AdUnit({ placementKey, className = '', showCloseButton = false, onClose }: AdUnitProps) {
  const { user } = useAuth();
  const [ad, setAd] = useState<TargetedAd | null>(null);
  const [impressionId, setImpressionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (user) {
      loadAd();
    }
  }, [user, placementKey]);

  const loadAd = async () => {
    if (!user) return;

    try {
      const adData = await api.getTargetedAd(user.id, placementKey);
      
      if (adData) {
        setAd(adData);
        
        // Track impression
        const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
        sessionStorage.setItem('session_id', sessionId);
        
        const impId = await api.trackAdImpression(
          adData.campaign_id,
          adData.creative_id,
          placementKey,
          user.id,
          sessionId
        );
        
        setImpressionId(impId);
      }
    } catch (error) {
      console.error('Error loading ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!user || !ad || !impressionId) return;

    try {
      await api.trackAdClick(impressionId, user.id);
      
      // Open destination URL
      if (ad.destination_url) {
        window.open(ad.destination_url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (loading || !ad || !visible) {
    return null;
  }

  return (
    <div className={`relative bg-card rounded-2xl overflow-hidden border border-border shadow-sm ${className}`}>
      {/* Sponsored Badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="px-2 py-1 bg-muted/90 backdrop-blur-sm rounded-md text-[10px] font-semibold text-muted-foreground">
          SPONSORED
        </span>
      </div>

      {/* Close Button */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Ad Content */}
      {ad.creative_type === 'image' && (
        <NativeImageAd ad={ad} onClick={handleClick} />
      )}
      
      {ad.creative_type === 'video' && (
        <VideoAd ad={ad} onClick={handleClick} />
      )}
      
      {ad.creative_type === 'html' && (
        <BannerAd ad={ad} onClick={handleClick} />
      )}
    </div>
  );
}

function NativeImageAd({ ad, onClick }: { ad: TargetedAd; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer group hover:opacity-95 transition-opacity"
    >
      {/* Image */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={ad.media_url}
          alt={ad.headline || 'Advertisement'}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        {ad.headline && (
          <h3 className="font-semibold text-lg line-clamp-2">{ad.headline}</h3>
        )}
        
        {ad.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{ad.description}</p>
        )}
        
        {ad.call_to_action && (
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            {ad.call_to_action}
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function VideoAd({ ad, onClick }: { ad: TargetedAd; onClick: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative">
      <video
        src={ad.media_url}
        poster={ad.media_url.replace(/\.[^/.]+$/, '_poster.jpg')}
        className="w-full aspect-video object-cover cursor-pointer"
        onClick={() => {
          setIsPlaying(!isPlaying);
          onClick();
        }}
        autoPlay={false}
        controls={isPlaying}
        muted
      />
      
      {ad.headline && (
        <div className="p-4">
          <h3 className="font-semibold">{ad.headline}</h3>
          {ad.description && (
            <p className="text-sm text-muted-foreground mt-1">{ad.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

function BannerAd({ ad, onClick }: { ad: TargetedAd; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer hover:opacity-95 transition-opacity"
    >
      <div className="relative aspect-[6/1] md:aspect-[8/1] overflow-hidden">
        <img
          src={ad.media_url}
          alt={ad.headline || 'Advertisement'}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
