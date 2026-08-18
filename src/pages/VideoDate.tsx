import { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Users, Plus, Check, X, MessageCircle, Star, Shield } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const DURATION_OPTIONS = [15, 30, 45, 60];
const VIDEO_DATE_TIPS = [
  { icon: '💡', tip: 'Dress nicely — first impressions matter even on video!' },
  { icon: '🌟', tip: 'Find good lighting, ideally facing a window or lamp' },
  { icon: '🎯', tip: 'Have 3 conversation topics ready to keep things flowing' },
  { icon: '📱', tip: 'Use headphones for better audio quality' },
  { icon: '☕', tip: 'Grab a drink beforehand — it helps relax the atmosphere' },
];

export function VideoDate() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<any[]>([]);
  const [videoDates, setVideoDates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [matchesData, datesData] = await Promise.all([
        api.getMatches(user.id),
        api.getVideoDates(user.id),
      ]);
      setMatches(matchesData);
      setVideoDates(datesData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!user || !selectedMatch || !scheduledAt) return;
    setScheduling(true);
    try {
      const match = matches.find(m => m.id === selectedMatch);
      const recipientId = match?.user1_id === user.id ? match?.user2_id : match?.user1_id;
      await api.scheduleVideoDate(selectedMatch, user.id, recipientId, scheduledAt, duration, notes);
      toast({ title: '📹 Video Date Scheduled!', description: `${duration} minute date scheduled successfully` });
      setShowSchedule(false);
      setSelectedMatch('');
      setScheduledAt('');
      setNotes('');
      await loadData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setScheduling(false);
    }
  };

  const handleAccept = async (dateId: string) => {
    try {
      await api.respondToVideoDate(dateId, 'accepted');
      toast({ title: '✅ Video Date Accepted!', description: 'Your match has been notified' });
      await loadData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleDecline = async (dateId: string) => {
    try {
      await api.respondToVideoDate(dateId, 'declined');
      toast({ title: 'Date Declined', description: 'Your match has been notified' });
      await loadData();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const pending = videoDates.filter(d => d.status === 'pending' && d.recipient_id === user?.id);
  const upcoming = videoDates.filter(d => d.status === 'accepted' && new Date(d.scheduled_at) > new Date());
  const past = videoDates.filter(d => d.status === 'completed' || new Date(d.scheduled_at) < new Date());

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20 pb-24 px-4">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Hero */}
          <div className="bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl p-8 border border-blue-500/20 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Video Dates</h1>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              See them face-to-face before meeting in person. Build real connection through our safe video dating feature.
            </p>
            <Button
              onClick={() => setShowSchedule(!showSchedule)}
              className="gradient-primary text-white border-0 h-12 px-8 rounded-2xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Schedule a Video Date
            </Button>
          </div>

          {/* Schedule Form */}
          {showSchedule && (
            <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
              <h3 className="text-lg font-bold">Schedule Video Date</h3>

              <div>
                <label className="text-sm font-medium mb-2 block">Select Match</label>
                <select
                  value={selectedMatch}
                  onChange={e => setSelectedMatch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Choose a match...</option>
                  {matches.map(match => (
                    <option key={match.id} value={match.id}>
                      {match.profile?.display_name}, {match.profile?.age}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                        duration === d ? 'gradient-primary text-white border-transparent' : 'bg-background border-border hover:bg-accent'
                      }`}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Input
                  placeholder="e.g., 'Bring your coffee! ☕'"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSchedule}
                  disabled={!selectedMatch || !scheduledAt || scheduling}
                  className="flex-1 gradient-primary text-white border-0"
                >
                  {scheduling ? 'Scheduling...' : 'Send Request'}
                </Button>
                <Button variant="outline" onClick={() => setShowSchedule(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Pending Requests */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                Pending Requests ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(date => (
                  <div key={date.id} className="bg-card rounded-2xl p-4 border border-orange-500/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={date.requester?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{date.requester?.display_name} wants a video date</p>
                      <p className="text-sm text-muted-foreground">📅 {formatDate(date.scheduled_at)} · {date.duration_minutes}min</p>
                      {date.notes && <p className="text-sm text-muted-foreground italic">"{date.notes}"</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAccept(date.id)} className="bg-green-500 hover:bg-green-600 text-white border-0">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDecline(date.id)} className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Video Dates
              </h2>
              <div className="space-y-3">
                {upcoming.map(date => {
                  const otherProfile = date.requester_id === user?.id ? date.recipient : date.requester;
                  return (
                    <div key={date.id} className="bg-card rounded-2xl p-4 border border-primary/20 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={otherProfile?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">Video Date with {otherProfile?.display_name}</p>
                        <p className="text-sm text-muted-foreground">📅 {formatDate(date.scheduled_at)}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span><Clock className="w-3 h-3 inline mr-0.5" />{date.duration_minutes} minutes</span>
                          <span className="text-green-500 font-medium">✓ Confirmed</span>
                        </div>
                      </div>
                      <Button size="sm" className="gradient-primary text-white border-0 flex-shrink-0">
                        <Video className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              Video Date Tips
            </h3>
            <div className="space-y-3">
              {VIDEO_DATE_TIPS.map(tip => (
                <div key={tip.tip} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{tip.icon}</span>
                  <p className="text-sm text-muted-foreground">{tip.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              All video dates happen through our secure platform. We never share your personal contact info. 
              You can end the call anytime and report any inappropriate behavior.
            </p>
          </div>

          {matches.length === 0 && videoDates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💕</div>
              <h3 className="text-xl font-semibold mb-2">Get Matching First!</h3>
              <p className="text-muted-foreground mb-4">You need at least one match to schedule a video date.</p>
              <Button onClick={() => window.history.back()} className="gradient-primary text-white border-0">
                Find Matches →
              </Button>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
