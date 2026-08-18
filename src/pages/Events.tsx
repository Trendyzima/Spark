import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Zap, Filter, Search, Star, CheckCircle, Crown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type EventType = 'all' | 'speed_dating' | 'mixer' | 'virtual' | 'activity' | 'singles_party' | 'workshop';

const EVENT_TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  speed_dating: { label: 'Speed Dating', emoji: '⚡', color: 'bg-pink-500/10 text-pink-500 border-pink-500/30' },
  mixer: { label: 'Mixer', emoji: '🥂', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  virtual: { label: 'Virtual', emoji: '💻', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  activity: { label: 'Activity', emoji: '🏃', color: 'bg-green-500/10 text-green-500 border-green-500/30' },
  singles_party: { label: "Singles Party", emoji: '🎉', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
  workshop: { label: 'Workshop', emoji: '📚', color: 'bg-teal-500/10 text-teal-500 border-teal-500/30' },
};

const FORMAT_STYLES: Record<string, string> = {
  virtual: 'bg-blue-500/10 text-blue-500',
  in_person: 'bg-green-500/10 text-green-500',
  hybrid: 'bg-purple-500/10 text-purple-500',
};

export function Events() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<EventType>('all');
  const [search, setSearch] = useState('');
  const [registering, setRegistering] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [eventsData, profile, regsData] = await Promise.all([
        api.getDatingEvents(),
        api.getProfile(user.id),
        api.getUserEventRegistrations(user.id),
      ]);
      setEvents(eventsData);
      setUserProfile(profile);
      setRegistrations(new Set(regsData.map((r: any) => r.event_id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event: any) => {
    if (!user) return;
    setRegistering(event.id);
    try {
      if (event.price_cents > 0) {
        // Paid event — redirect to checkout (placeholder)
        toast({ title: 'Redirecting to checkout...', description: `$${(event.price_cents / 100).toFixed(2)} for ${event.title}` });
      } else {
        await api.registerForEvent(user.id, event.id, 'free');
        setRegistrations(prev => new Set([...prev, event.id]));
        toast({ title: '🎉 Registered!', description: `You're going to ${event.title}` });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setRegistering(null);
    }
  };

  const filtered = events.filter(e => {
    const matchFilter = filter === 'all' || e.event_type === filter;
    const matchSearch = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const featuredEvents = filtered.filter(e => e.is_featured);
  const regularEvents = filtered.filter(e => !e.is_featured);

  const formatDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (days === 1) return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getSpots = (event: any) => event.max_participants - (event.registrations_count || 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Hero Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-rose-600 p-8 text-white">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 to-rose-600/60" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-sm font-medium mb-3 backdrop-blur-sm">
                <Zap className="w-4 h-4 fill-white" />
                Live Events
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Meet Someone Tonight 🔥</h1>
              <p className="text-white/80 text-lg mb-4">
                Speed dating, mixers, outdoor adventures — real connections in real life.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4" />{events.length * 12}+ attending this week</div>
                <div className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />4.9 avg rating</div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(['all', 'speed_dating', 'mixer', 'activity', 'virtual', 'workshop'] as EventType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${filter === type ? 'gradient-primary text-white border-transparent' : 'bg-card border-border hover:bg-accent'}`}
                  >
                    {type === 'all' ? '✨ All' : `${EVENT_TYPE_LABELS[type].emoji} ${EVENT_TYPE_LABELS[type].label}`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Featured Events */}
          {featuredEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Featured Events
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {featuredEvents.map(event => {
                  const typeInfo = EVENT_TYPE_LABELS[event.event_type];
                  const spots = getSpots(event);
                  const isRegistered = registrations.has(event.id);
                  const isAlmostFull = spots <= 5 && spots > 0;

                  return (
                    <div key={event.id} className="bg-card rounded-2xl border-2 border-primary/20 overflow-hidden hover:border-primary/40 transition-all group">
                      {/* Banner */}
                      <div className="h-40 bg-gradient-to-br from-pink-500/30 to-orange-500/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-orange-600/20" />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${typeInfo.color}`}>
                            {typeInfo.emoji} {typeInfo.label}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${FORMAT_STYLES[event.event_format]}`}>
                            {event.event_format === 'in_person' ? '📍 In Person' : event.event_format === 'virtual' ? '💻 Virtual' : '🔀 Hybrid'}
                          </span>
                        </div>
                        {isAlmostFull && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-red-500 rounded-full text-xs font-bold text-white animate-pulse">
                            Only {spots} spots left!
                          </div>
                        )}
                        <div className="absolute bottom-3 left-3 text-4xl">{typeInfo.emoji}</div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>

                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(event.scheduled_at)} · {event.duration_minutes}min
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {spots > 0 ? `${spots} spots left` : 'Full'}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {event.location}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            {event.price_cents === 0 ? (
                              <span className="text-green-500 font-bold">Free</span>
                            ) : (
                              <span className="text-lg font-bold text-primary">${(event.price_cents / 100).toFixed(2)}</span>
                            )}
                            {event.coins_price > 0 && (
                              <span className="text-sm text-muted-foreground ml-2">or {event.coins_price} 🪙</span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleRegister(event)}
                            disabled={isRegistered || registering === event.id || spots === 0}
                            className={isRegistered ? 'bg-green-500/10 text-green-500 border-green-500/30 border' : 'gradient-primary text-white border-0'}
                          >
                            {isRegistered ? (
                              <><CheckCircle className="w-4 h-4 mr-1" /> Registered</>
                            ) : registering === event.id ? 'Joining...' : spots === 0 ? 'Full' : 'Join Event →'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Events */}
          {regularEvents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">All Events</h2>
              <div className="space-y-3">
                {regularEvents.map(event => {
                  const typeInfo = EVENT_TYPE_LABELS[event.event_type];
                  const spots = getSpots(event);
                  const isRegistered = registrations.has(event.id);

                  return (
                    <div key={event.id} className="bg-card rounded-2xl p-4 border border-border hover:border-primary/30 transition-all flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                        {typeInfo.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold truncate">{event.title}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>🕐 {formatDate(event.scheduled_at)}</span>
                          <span>👥 {spots > 0 ? `${spots} spots` : 'Full'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          {event.price_cents === 0 ? (
                            <span className="text-sm text-green-500 font-bold">Free</span>
                          ) : (
                            <span className="text-sm font-bold">${(event.price_cents / 100).toFixed(2)}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleRegister(event)}
                          disabled={isRegistered || registering === event.id || spots === 0}
                          variant={isRegistered ? 'outline' : 'default'}
                          className={isRegistered ? 'text-green-500 border-green-500/30' : 'gradient-primary text-white border-0'}
                        >
                          {isRegistered ? '✓ Joined' : 'Join'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or check back soon.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
