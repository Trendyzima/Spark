import { useState, useEffect } from 'react';
import { Eye, Heart, Zap, Users, TrendingUp, Star, Sparkles, Trophy, Flame, Crown } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AdUnit } from '@/components/features/AdUnit';
import { AIDatingCoach } from '@/components/features/AIDatingCoach';
import { ProfileStrengthMeter } from '@/components/features/ProfileStrengthMeter';
import { AchievementsPanel } from '@/components/features/AchievementsPanel';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { ProfileInsights, Profile, SponsoredDateIdea, ActivityStreak, UserAnalytics } from '@/types';

export function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<ProfileInsights | null>(null);
  const [viewers, setViewers] = useState<any[]>([]);
  const [superLikes, setSuperLikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sponsoredDateIdeas, setSponsoredDateIdeas] = useState<SponsoredDateIdea[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-coach' | 'achievements'>('overview');
  const [streak, setStreak] = useState<ActivityStreak | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user]);

  const loadInsights = async () => {
    if (!user) return;

    try {
      const [
        insightsData,
        viewersData,
        superLikesData,
        sponsoredIdeas,
        profile,
        streakData,
        analyticsData,
      ] = await Promise.all([
        api.getProfileInsights(user.id),
        api.getProfileViewers(user.id, 10),
        api.getSuperLikesReceived(user.id),
        api.getSponsoredDateIdeas(5),
        api.getProfile(user.id),
        api.getActivityStreak(user.id),
        api.getUserAnalytics(user.id),
      ]);

      setInsights(insightsData);
      setViewers(viewersData);
      setSuperLikes(superLikesData);
      setSponsoredDateIdeas(sponsoredIdeas);
      setUserProfile(profile);
      setStreak(streakData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !insights) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Profile Views',
      value: insights.views_count,
      icon: Eye,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Likes Received',
      value: insights.likes_received,
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      label: 'Super Likes',
      value: insights.super_likes_received,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Matches',
      value: insights.matches_count,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Profile Insights</h1>
            <p className="text-muted-foreground">AI-powered analytics and recommendations</p>
          </div>

          {/* Activity Streak Banner */}
          {streak && streak.current_streak > 0 && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl p-6 border-2 border-orange-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <Flame className="w-8 h-8 text-white fill-current" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{streak.current_streak} Day Streak! 🔥</h3>
                    <p className="text-sm text-muted-foreground">
                      Longest: {streak.longest_streak} days • Total active: {streak.total_active_days} days
                    </p>
                  </div>
                </div>
                {userProfile?.is_premium && (
                  <Crown className="w-8 h-8 text-yellow-500 fill-current" />
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'ai-coach', label: 'AI Coach', icon: Sparkles },
              { key: 'achievements', label: 'Achievements', icon: Trophy },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Strength */}
              <ProfileStrengthMeter />

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Analytics Insights */}
              {analytics && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-xl font-bold mb-4">Advanced Analytics</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        Match Quality Score
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Your score</span>
                          <span className="font-bold">{(analytics.match_quality_score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                            style={{ width: `${analytics.match_quality_score * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Conversation Quality
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg response time</span>
                          <span className="font-bold">{analytics.average_response_time_minutes} min</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Quality score</span>
                          <span className="font-bold">{(analytics.conversation_quality_score * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Who Viewed Your Profile */}
              {viewers.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Who Viewed Your Profile
                  </h2>
                  <div className="space-y-3">
                    {viewers.map((view) => {
                      const profile = view.profiles;
                      const photo = profile?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

                      return (
                        <div
                          key={view.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{profile?.display_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(view.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {profile?.is_verified && (
                            <Star className="w-5 h-5 text-blue-500 fill-current" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Super Likes Received */}
              {superLikes.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500 fill-current" />
                    Super Likes Received
                  </h2>
                  <div className="space-y-3">
                    {superLikes.map((like) => {
                      const profile = like.profiles;
                      const photo = profile?.photos?.[0] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

                      return (
                        <div
                          key={like.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors cursor-pointer"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden relative">
                            <img src={photo} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 to-transparent" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">{profile?.display_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(like.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Zap className="w-6 h-6 text-yellow-500 fill-current" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ad Unit for free users */}
              {!userProfile?.is_premium && (
                <AdUnit placementKey="insights_page" className="my-4" />
              )}

              {/* Sponsored Date Ideas */}
              {sponsoredDateIdeas.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold">Date Ideas</h2>
                  </div>
                  <div className="space-y-3">
                    {sponsoredDateIdeas.map((sponsored) => {
                      const idea = sponsored.date_idea;
                      if (!idea) return null;

                      return (
                        <div
                          key={sponsored.id}
                          className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg mb-1">{idea.title}</h4>
                              {idea.description && (
                                <p className="text-sm text-muted-foreground mb-2">{idea.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                  {idea.category}
                                </span>
                                <span className="text-xs text-muted-foreground">Sponsored</span>
                              </div>
                            </div>
                            {sponsored.sponsor_logo_url && (
                              <img
                                src={sponsored.sponsor_logo_url}
                                alt={sponsored.sponsor_name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Brought to you by <span className="font-semibold">{sponsored.sponsor_name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Coach Tab */}
          {activeTab === 'ai-coach' && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <AIDatingCoach userProfile={userProfile} />
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <AchievementsPanel />
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
