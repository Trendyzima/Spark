
import { useNavigate } from 'react-router-dom';
import { Heart, Zap, Shield, Star, Users, MessageCircle, Crown, Sparkles, ChevronRight, Play, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImg from '@/assets/hero-dating.jpg';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI Dating Coach',
    desc: 'Personalized advice, conversation starters & photo analysis powered by cutting-edge AI.',
  },
  {
    icon: '🎯',
    title: 'Smart Matching',
    desc: 'Compatibility scoring, ML recommendations & behavioral pattern analysis find your ideal match.',
  },
  {
    icon: '📹',
    title: 'Video Dates',
    desc: 'Schedule virtual dates, join speed dating events & build real connections before meeting.',
  },
  {
    icon: '✨',
    title: 'FansOnly',
    desc: 'Premium content creators share exclusive photos & videos for their fans.',
  },
  {
    icon: '🔒',
    title: 'Safety First',
    desc: 'Photo & video verification, safety center, date check-ins & emergency contacts.',
  },
  {
    icon: '🌍',
    title: 'Travel Mode',
    desc: 'Match with locals at your next destination before you even arrive.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Sophia L.',
    age: 28,
    text: "I matched with the love of my life within 2 weeks! The AI coach helped me write my bio and it made all the difference.",
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=80&h=80&fit=crop&crop=face',
    stars: 5,
  },
  {
    name: 'Marcus T.',
    age: 31,
    text: 'The video dates feature is revolutionary. Got to know someone properly before our first real date. We\'re now engaged!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
    stars: 5,
  },
  {
    name: 'Priya K.',
    age: 25,
    text: 'Speed Dating Night events are so fun! Met 12 people in one evening and now talking to 3 great matches.',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face',
    stars: 5,
  },
];

const STATS = [
  { value: '10M+', label: 'Active Members' },
  { value: '2.4M', label: 'Matches Made' },
  { value: '890K', label: 'Happy Couples' },
  { value: '4.9★', label: 'App Rating' },
];

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              Spark
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#events" className="hover:text-foreground transition-colors">Events</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Stories</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/auth')} className="hidden md:flex">Sign In</Button>
            <Button onClick={() => navigate('/auth')} className="gradient-primary text-white border-0 hover:opacity-90">
              Join Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroImg} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/60" />
          {/* Floating elements */}
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Copy */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              World's Most Advanced Dating App
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Find Love That
              <span className="block bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent">
                Actually Sparks
              </span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              AI-powered matching, video dates, live events & a safety-first approach. 
              This isn't just dating — it's a <span className="text-foreground font-semibold">complete love experience</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="gradient-primary text-white border-0 hover:opacity-90 h-14 px-8 text-lg rounded-2xl group"
              >
                Start for Free
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg rounded-2xl group border-border hover:bg-accent"
              >
                <Play className="w-5 h-5 mr-2 text-primary fill-primary" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                No credit card needed
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                Verified profiles
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                Free forever
              </div>
            </div>
          </div>

          {/* Right - App Preview Cards */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-full max-w-sm">
              {/* Main card */}
              <div className="bg-card rounded-3xl overflow-hidden shadow-2xl border border-border relative">
                <img
                  src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop&crop=face"
                  alt="Profile"
                  className="w-full h-96 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-white text-2xl font-bold">Emma, 26</h3>
                  <p className="text-white/80 text-sm">New York • 92% Match 💚</p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs">Photography</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs">Travel</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-white text-xs">Yoga</span>
                  </div>
                </div>
                {/* Verified badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-blue-500 rounded-full">
                  <Shield className="w-3 h-3 text-white" />
                  <span className="text-white text-xs font-bold">Verified</span>
                </div>
              </div>

              {/* Floating match notification */}
              <div className="absolute -top-4 -right-4 bg-card rounded-2xl px-4 py-3 shadow-lg border border-border flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <div>
                  <p className="text-xs font-bold">It's a Match! 🎉</p>
                  <p className="text-xs text-muted-foreground">You & Emma matched</p>
                </div>
              </div>

              {/* Floating AI advice */}
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl px-4 py-3 shadow-lg border border-border max-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">AI Coach</span>
                </div>
                <p className="text-xs text-muted-foreground">Mention her love for photography — great opener!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
              <Zap className="w-4 h-4" />
              Cutting-Edge Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Every feature you need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500"> find your person</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've combined the best features from every major dating app and added AI technology they don't have.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Preview */}
      <section id="events" className="py-24 px-6 bg-card/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm font-medium text-orange-500">
                🎉 Live Dating Events
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Meet people IRL &
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500"> actually connect</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Speed dating, singles mixers, virtual game nights, outdoor activities — join events 
                that match your personality and vibe.
              </p>
              <div className="space-y-3">
                {['Speed Dating Nights — meet 10+ singles in 90 min', 'Virtual Game Nights & Themed Mixers', 'Outdoor Adventures for Active Singles', 'Expert Dating Workshops'].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-orange-500" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate('/auth')} className="bg-orange-500 hover:bg-orange-600 text-white border-0 rounded-2xl h-12 px-8">
                Browse Events →
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Speed Dating Night 🔥', type: 'Virtual', time: 'Tonight 8PM', attendees: 18, capacity: 30 },
                { title: 'Singles Hike 🏔️', type: 'In Person', time: 'Sat 10AM', attendees: 8, capacity: 15 },
                { title: 'Game Night 🎮', type: 'Virtual', time: 'Fri 7PM', attendees: 14, capacity: 24 },
                { title: 'Love Workshop 💖', type: 'Virtual', time: 'Sun 3PM', attendees: 32, capacity: 50 },
              ].map(event => (
                <div key={event.title} className="bg-card rounded-2xl p-4 border border-border hover:border-orange-500/50 transition-all cursor-pointer">
                  <h4 className="font-semibold text-sm mb-1 leading-tight">{event.title}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${event.type === 'Virtual' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                      {event.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">🕐 {event.time}</p>
                  <div className="flex items-center justify-between">
                    <div className="h-1.5 bg-muted rounded-full flex-1 mr-2 overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(event.attendees / event.capacity) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{event.attendees}/{event.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Real love stories ❤️</h2>
            <p className="text-xl text-muted-foreground">Millions have found their match. Now it's your turn.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">Age {t.age}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 px-6 bg-card/30 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Start free, upgrade anytime</h2>
          <p className="text-xl text-muted-foreground mb-12">Free forever with essential features. Premium unlocks everything.</p>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              { name: 'Free', price: '$0', features: ['Unlimited swiping', '5 Super Likes/day', 'Basic matching', 'Stories'], cta: 'Get Started', highlight: false },
              { name: 'Plus', price: '$8', features: ['Everything in Free', 'Unlimited Super Likes', 'See who liked you', 'Incognito Mode', 'AI Coach'], cta: 'Go Plus', highlight: true },
              { name: 'Gold', price: '$12', features: ['Everything in Plus', 'FansOnly Access', 'Video Dates', 'Event Priority', 'Travel Mode'], cta: 'Go Gold', highlight: false },
            ].map(tier => (
              <div key={tier.name} className={`rounded-2xl p-6 border-2 text-left ${tier.highlight ? 'border-primary shadow-lg shadow-primary/20 relative overflow-hidden' : 'border-border bg-card'}`}>
                {tier.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
                )}
                {tier.highlight && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                    POPULAR
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.price !== '$0' && <span className="text-muted-foreground">/mo</span>}
                </div>
                <div className="space-y-2 mb-6">
                  {tier.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => navigate('/auth')}
                  className={`w-full ${tier.highlight ? 'gradient-primary text-white border-0' : ''}`}
                  variant={tier.highlight ? 'default' : 'outline'}
                >
                  {tier.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-red-500/10 rounded-3xl p-12 border border-primary/20 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="text-6xl mb-4">💝</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Your person is waiting</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Join 10 million singles already using Spark. Take the first step today — it's completely free.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="gradient-primary text-white border-0 hover:opacity-90 h-14 px-10 text-lg rounded-2xl"
              >
                Find Your Spark Today ✨
              </Button>
              <p className="text-sm text-muted-foreground mt-4">No credit card · Free forever · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                Spark
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Safety Tips</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Spark. Made with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
