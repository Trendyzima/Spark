import { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, Zap, Heart, Shield, Star, Lock, Eye, Map, Video, Users, Gift } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionTier, UserSubscription } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

const TIER_CONFIG = [
  {
    key: 'basic',
    name: 'Plus',
    price: 8,
    badge: null,
    gradient: 'from-blue-500/10 to-cyan-500/10',
    border: 'border-blue-500/20',
    accent: 'text-blue-500',
    btnClass: 'bg-blue-500 hover:bg-blue-600',
    features: [
      { icon: Zap, text: 'Unlimited Super Likes' },
      { icon: Eye, text: 'See who liked you' },
      { icon: Zap, text: 'Daily profile boosts' },
      { icon: Lock, text: 'Incognito mode' },
      { icon: Sparkles, text: 'AI Dating Coach' },
      { icon: Heart, text: 'Advanced Filters' },
    ],
  },
  {
    key: 'gold',
    name: 'Gold',
    price: 12,
    badge: 'MOST POPULAR',
    gradient: 'from-yellow-500/10 to-orange-500/10',
    border: 'border-yellow-500/30',
    accent: 'text-yellow-500',
    btnClass: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    features: [
      { icon: Crown, text: 'Everything in Plus' },
      { icon: Video, text: 'Video Dates feature' },
      { icon: Users, text: 'Events priority access' },
      { icon: Map, text: 'Travel / Passport mode' },
      { icon: Star, text: 'Priority in discovery' },
      { icon: Gift, text: 'Monthly coin bonus (200 🪙)' },
    ],
  },
  {
    key: 'platinum',
    name: 'Platinum',
    price: 20,
    badge: null,
    gradient: 'from-purple-500/10 to-pink-500/10',
    border: 'border-purple-500/20',
    accent: 'text-purple-500',
    btnClass: 'bg-gradient-to-r from-purple-500 to-pink-500',
    features: [
      { icon: Crown, text: 'Everything in Gold' },
      { icon: Lock, text: 'FansOnly Premium Access' },
      { icon: Sparkles, text: 'AI Profile Optimizer' },
      { icon: Shield, text: 'VIP Verified Badge' },
      { icon: Zap, text: 'Unlimited profile boosts' },
      { icon: Gift, text: 'Monthly coin bonus (600 🪙)' },
    ],
  },
];

const PREMIUM_PERKS = [
  { icon: '🤖', title: 'AI Dating Coach', desc: 'Personalized advice on profile, conversation tips, and date planning 24/7.' },
  { icon: '👀', title: 'See Who Likes You', desc: 'Skip the guessing — see everyone who liked your profile instantly.' },
  { icon: '📹', title: 'Video Dates', desc: 'Schedule video dates and virtual meetups to build trust before meeting IRL.' },
  { icon: '🌍', title: 'Passport / Travel Mode', desc: 'Match with singles in any city — perfect for travel or relocation.' },
  { icon: '🚀', title: 'Profile Boost', desc: 'Get featured at the top of discovery for maximum visibility.' },
  { icon: '🔒', title: 'Incognito Mode', desc: 'Browse anonymously — only visible to people you\'ve already liked.' },
  { icon: '⚡', title: 'Unlimited Super Likes', desc: 'Show 100x more interest with unlimited Super Likes daily.' },
  { icon: '🎪', title: 'Event Priority', desc: 'First access to popular speed dating nights and exclusive mixers.' },
];

export function Premium() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTierId, setProcessingTierId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [tiersData, subData] = await Promise.all([
        api.getSubscriptionTiers(),
        api.getUserSubscription(user.id),
      ]);
      setTiers(tiersData);
      setCurrentSubscription(subData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string, tierId: string) => {
    setProcessingTierId(tierId);
    try {
      const { data, error } = await api.supabase.functions.invoke('create-checkout-session', {
        body: { priceId },
      });

      if (error) {
        let errorMessage = error.message;
        if (error instanceof FunctionsHttpError) {
          try {
            const statusCode = error.context?.status ?? 500;
            const textContent = await error.context?.text();
            errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
          } catch {
            errorMessage = error.message || 'Failed to read response';
          }
        }
        throw new Error(errorMessage);
      }

      if (data?.url) window.open(data.url, '_blank');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setProcessingTierId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const discount = billingCycle === 'annual' ? 0.4 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Hero */}
          <div className="relative text-center py-12 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-lg shadow-primary/30 mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Go{' '}
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Premium
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Unlock the full power of Spark and find your match 10x faster with premium features.
              </p>

              {/* Billing Toggle */}
              <div className="inline-flex items-center gap-3 bg-card border border-border rounded-full p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Annual
                  <span className="px-1.5 py-0.5 bg-green-500 text-white rounded-full text-xs font-bold">-40%</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Subscription Banner */}
          {currentSubscription?.status === 'active' && (
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{currentSubscription.subscription_tiers?.name} Member ✨</h3>
                <p className="text-muted-foreground text-sm">
                  Renews on {new Date(currentSubscription.current_period_end).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                  {currentSubscription.cancel_at_period_end && ' · Cancels at period end'}
                </p>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {TIER_CONFIG.map((config, i) => {
              const dbTier = tiers[i];
              const isCurrentPlan = currentSubscription?.tier_id === dbTier?.id;
              const price = billingCycle === 'annual' ? Math.round(config.price * (1 - discount)) : config.price;

              return (
                <div
                  key={config.key}
                  className={`relative bg-gradient-to-br ${config.gradient} rounded-3xl p-6 border-2 ${config.border} transition-all hover:shadow-xl ${config.badge ? 'scale-[1.02]' : ''}`}
                >
                  {config.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-white text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-lg">
                      ⭐ {config.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`text-3xl font-bold ${config.accent} mb-1`}>{config.name}</div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold">${price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-green-500 font-medium">Save ${(config.price - price) * 12}/year</p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    {config.features.map((feature, fi) => (
                      <div key={fi} className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0`}>
                          <feature.icon className={`w-3.5 h-3.5 ${config.accent}`} />
                        </div>
                        <span className="text-sm">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => dbTier && handleSubscribe(dbTier.stripe_price_id, dbTier.id)}
                    disabled={isCurrentPlan || processingTierId === dbTier?.id || !dbTier}
                    className={`w-full text-white border-0 rounded-2xl h-12 font-semibold ${isCurrentPlan ? 'bg-green-500/20 text-green-500' : config.btnClass}`}
                  >
                    {isCurrentPlan
                      ? '✓ Current Plan'
                      : processingTierId === dbTier?.id
                      ? 'Processing...'
                      : `Get ${config.name} →`}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Feature Highlights Grid */}
          <div>
            <h2 className="text-3xl font-bold text-center mb-8">Everything included in Premium</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PREMIUM_PERKS.map(perk => (
                <div key={perk.title} className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 transition-all group">
                  <div className="text-3xl mb-3">{perk.icon}</div>
                  <h3 className="font-bold mb-1 group-hover:text-primary transition-colors">{perk.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Free vs Premium */}
          <div className="bg-card rounded-3xl border border-border overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-semibold border-b border-border">
              <div className="p-4 text-muted-foreground">Feature</div>
              <div className="p-4 text-center text-muted-foreground border-x border-border">Free</div>
              <div className="p-4 text-center gradient-primary text-white">Premium</div>
            </div>
            {[
              ['Daily Super Likes', '5', 'Unlimited ∞'],
              ['See who liked you', '✗', '✓'],
              ['AI Dating Coach', '✗', '✓'],
              ['Video Dates', '✗', '✓'],
              ['Travel / Passport Mode', '✗', '✓'],
              ['FansOnly Access', '✗', '✓'],
              ['Incognito Mode', '✗', '✓'],
              ['Profile Boost', '1/month', 'Daily'],
              ['Undo Last Swipe', '✗', 'Unlimited'],
              ['Read Receipts', '✗', '✓'],
            ].map(([feature, free, premium], i) => (
              <div key={feature} className={`grid grid-cols-3 text-sm border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/30'}`}>
                <div className="p-4 font-medium">{feature}</div>
                <div className="p-4 text-center text-muted-foreground border-x border-border">{free}</div>
                <div className="p-4 text-center text-primary font-semibold">{premium}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-10 border border-primary/20">
            <h2 className="text-3xl font-bold mb-3">Ready to find your match? 💘</h2>
            <p className="text-muted-foreground mb-6">Join 3M+ premium members who found love faster with Spark Premium.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button
                onClick={() => tiers[1] && handleSubscribe(tiers[1].stripe_price_id, tiers[1].id)}
                className="gradient-primary text-white border-0 h-12 px-8 rounded-2xl text-base font-semibold"
              >
                Start with Gold →
              </Button>
              <Button variant="outline" onClick={() => navigate('/coins')} className="h-12 px-6 rounded-2xl">
                🪙 Buy Coins Instead
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Cancel anytime · Secure payment via Stripe</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
