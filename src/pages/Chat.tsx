import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Video, MoreVertical, Mic, Image as ImageIcon, Film } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Match, Message, Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VideoMessage } from '@/components/features/VideoMessage';

export function Chat() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMatch();
    loadMessages();

    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMatch = async () => {
    if (!matchId || !user) return;

    try {
      const { data, error } = await api.supabase
        .from('matches')
        .select(`
          *,
          user1:user1_id(id),
          user2:user2_id(id)
        `)
        .eq('id', matchId)
        .maybeSingle();

      if (error) throw error;

      const otherUserId = data.user1_id === user.id ? data.user2_id : data.user1_id;
      const profile = await api.getProfile(otherUserId);

      setMatch({
        ...data,
        profile,
      });
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

  const loadMessages = async () => {
    if (!matchId || !user) return;

    try {
      const data = await api.getMessages(matchId);
      setMessages(data);
      await api.markMessagesAsRead(matchId, user.id);
    } catch (error: any) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !user) return;

    try {
      await api.sendMessage(matchId!, user.id, message);
      setMessage('');
      loadMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const url = await api.uploadFile('profile-photos', path, file);
      await api.sendMessage(matchId!, user.id, url);
      loadMessages();
      setShowMediaOptions(false);
      toast({ title: 'Image sent!' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const url = await api.uploadFile('profile-videos', path, file);
      await api.sendMessage(matchId!, user.id, `[VIDEO]${url}`);
      loadMessages();
      setShowMediaOptions(false);
      toast({ title: 'Video sent!' });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading || !match?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const profile = match.profile;
  const photo = profile.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/matches')}
              className="p-2 hover:bg-accent rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src={photo}
                alt={profile.display_name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="font-semibold">{profile.display_name}</h2>
              <p className="text-xs text-muted-foreground">Active now</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full gradient-primary mb-4 flex items-center justify-center">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">It's a Match!</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Start the conversation and share photos or videos!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSentByMe = msg.sender_id === user?.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
              >
                {msg.content.startsWith('[VIDEO]') ? (
                  <div className={`max-w-[70%] ${isSentByMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <VideoMessage
                      videoUrl={msg.content.replace('[VIDEO]', '')}
                      className="w-64 h-48"
                    />
                    <p className="text-xs text-muted-foreground px-2">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ) : msg.content.startsWith('http') && (msg.content.includes('.jpg') || msg.content.includes('.png') || msg.content.includes('.webp') || msg.content.includes('.gif')) ? (
                  <div className={`max-w-[70%] ${isSentByMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className="rounded-2xl overflow-hidden">
                      <img src={msg.content} alt="" className="max-w-full h-auto" />
                    </div>
                    <p className="text-xs text-muted-foreground px-2">
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isSentByMe
                        ? 'gradient-primary text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      isSentByMe ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-card">
        <div className="border-t border-border p-4">
          {showMediaOptions && (
            <div className="mb-3 flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button
                variant="outline"
                onClick={() => videoInputRef.current?.click()}
                className="flex-1"
              >
                <Film className="w-4 h-4 mr-2" />
                Video
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMediaOptions(!showMediaOptions)}
              className={`text-muted-foreground hover:text-foreground ${
                showMediaOptions ? 'text-primary' : ''
              }`}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`text-muted-foreground hover:text-foreground ${
                recording ? 'text-primary' : ''
              }`}
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="gradient-primary text-white"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
