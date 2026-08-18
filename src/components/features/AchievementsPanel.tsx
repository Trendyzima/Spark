import { useState, useEffect } from 'react';
import { Trophy, Lock, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Achievement, UserAchievement } from '@/types';

export function AchievementsPanel() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      const [allAchievements, earned] = await Promise.all([
        api.getAchievements(),
        api.getUserAchievements(user.id),
      ]);

      setAchievements(allAchievements);
      setUserAchievements(earned);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const isEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-cyan-400 to-blue-500';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-300 to-gray-400';
      default: return 'from-orange-400 to-red-500';
    }
  };

  const getTierBorder = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'border-cyan-500/50';
      case 'gold': return 'border-yellow-500/50';
      case 'silver': return 'border-gray-400/50';
      default: return 'border-orange-500/50';
    }
  };

  const totalPoints = userAchievements.reduce((sum, ua) => {
    const achievement = achievements.find(a => a.id === ua.achievement_id);
    return sum + (achievement?.points || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Achievements</h3>
          <p className="text-sm text-muted-foreground">
            {userAchievements.length} of {achievements.length} unlocked
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-500">{totalPoints}</span>
          </div>
          <p className="text-xs text-muted-foreground">Total Points</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
            style={{ width: `${(userAchievements.length / achievements.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground">
          {Math.round((userAchievements.length / achievements.length) * 100)}% Complete
        </p>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const earned = isEarned(achievement.id);
          const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);

          return (
            <div
              key={achievement.id}
              className={`relative rounded-2xl p-4 border-2 transition-all ${
                earned
                  ? `bg-gradient-to-br ${getTierColor(achievement.tier)}/10 ${getTierBorder(achievement.tier)}`
                  : 'bg-card border-border opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div className="text-center mb-3">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                  earned
                    ? `bg-gradient-to-br ${getTierColor(achievement.tier)} text-white shadow-lg`
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {earned ? (
                    <span className="text-3xl">{achievement.icon}</span>
                  ) : (
                    <Lock className="w-8 h-8" />
                  )}
                </div>
              </div>

              {/* Achievement Info */}
              <div className="text-center space-y-1">
                <h4 className="font-semibold text-sm line-clamp-1">{achievement.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-bold text-yellow-500">{achievement.points} pts</span>
                </div>
              </div>

              {/* Tier Badge */}
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  earned
                    ? `bg-gradient-to-r ${getTierColor(achievement.tier)} text-white`
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {achievement.tier}
                </span>
              </div>

              {/* Earned Date */}
              {earned && userAchievement && (
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[10px] text-center text-muted-foreground">
                    Earned {new Date(userAchievement.earned_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
