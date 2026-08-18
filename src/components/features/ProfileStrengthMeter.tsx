import { useState, useEffect } from 'react';
import { TrendingUp, Camera, FileText, CheckCircle, Zap, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { ProfileStrength } from '@/types';

export function ProfileStrengthMeter() {
  const { user } = useAuth();
  const [strength, setStrength] = useState<ProfileStrength | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStrength();
    }
  }, [user]);

  const loadStrength = async () => {
    if (!user) return;

    try {
      const data = await api.getProfileStrength(user.id);
      setStrength(data);
    } catch (error) {
      console.error('Error loading profile strength:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !strength) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Outstanding! 🌟';
    if (score >= 80) return 'Excellent! 🔥';
    if (score >= 70) return 'Great! 👍';
    if (score >= 60) return 'Good 😊';
    if (score >= 50) return 'Average 😐';
    if (score >= 40) return 'Needs Work 😕';
    return 'Weak 😰';
  };

  const categories = [
    { label: 'Photos', score: strength.photo_score, max: 30, icon: Camera },
    { label: 'Bio', score: strength.bio_score, max: 25, icon: FileText },
    { label: 'Completeness', score: strength.completeness_score, max: 30, icon: CheckCircle },
    { label: 'Engagement', score: strength.engagement_score, max: 15, icon: Zap },
  ];

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Profile Strength</h3>
          <p className="text-sm text-muted-foreground">Optimize for better matches</p>
        </div>
        <button
          onClick={loadStrength}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <TrendingUp className="w-5 h-5" />
        </button>
      </div>

      {/* Overall Score Circle */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Background circle */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                className="fill-none stroke-muted stroke-[8]"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                className={`fill-none stroke-[8] transition-all duration-1000`}
                style={{
                  stroke: strength.overall_score >= 80 ? '#10b981' : 
                         strength.overall_score >= 60 ? '#f59e0b' :
                         strength.overall_score >= 40 ? '#f97316' : '#ef4444',
                  strokeDasharray: `${2 * Math.PI * 70}`,
                  strokeDashoffset: `${2 * Math.PI * 70 * (1 - strength.overall_score / 100)}`,
                }}
              />
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(strength.overall_score)}`}>
                {strength.overall_score}
              </span>
              <span className="text-sm text-muted-foreground">out of 100</span>
              <span className="text-xs font-semibold mt-1">
                {getScoreLabel(strength.overall_score)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4 mb-6">
        {categories.map((category) => (
          <div key={category.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <category.icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{category.label}</span>
              </div>
              <span className="text-muted-foreground">
                {category.score}/{category.max}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getScoreBg(strength.overall_score)} transition-all duration-500`}
                style={{ width: `${(category.score / category.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {strength.suggestions && strength.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm mb-3">Improvement Suggestions:</h4>
          {strength.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 group hover:bg-primary/10 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">{index + 1}</span>
              </div>
              <p className="text-sm flex-1">{suggestion.message}</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {strength.overall_score < 80 && (
        <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
          <p className="text-sm text-center">
            <span className="font-semibold">Level up your profile!</span>
            <br />
            <span className="text-muted-foreground">
              Profiles with 80+ score get 3x more matches
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
