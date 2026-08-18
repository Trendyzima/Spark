export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface Profile {
  id: string;
  display_name: string;
  bio?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  looking_for: 'male' | 'female' | 'everyone';
  location?: string;
  photos: string[];
  videos: string[];
  interests: string[];
  is_active: boolean;
  is_premium: boolean;
  is_verified: boolean;
  height_cm?: number;
  body_type?: string;
  education?: string;
  occupation?: string;
  religion?: string;
  smoking?: string;
  drinking?: string;
  children?: string;
  languages?: string[];
  dating_goal?: 'relationship' | 'casual' | 'friendship' | 'figuring_it_out' | 'marriage';
  star_sign?: string;
  spotify_artist?: string;
  spotify_anthem?: string;
  vaccine_status?: 'vaccinated' | 'not_vaccinated' | 'prefer_not_to_say';
  political_views?: 'liberal' | 'moderate' | 'conservative' | 'apolitical' | 'other';
  created_at: string;
  updated_at: string;
}

export interface Like {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  profile?: Profile;
  unread_count?: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price_cents: number;
  stripe_price_id: string;
  features: string[];
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  tier_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  subscription_tiers?: SubscriptionTier;
}

export interface FansOnlyContent {
  id: string;
  creator_id: string;
  content_type: 'photo' | 'video';
  file_url: string;
  thumbnail_url?: string;
  caption?: string;
  price_cents: number;
  is_public: boolean;
  views_count: number;
  likes_count: number;
  created_at: string;
  profiles?: {
    display_name: string;
    photos: string[];
  };
}

export interface SuperLike {
  id: string;
  liker_id: string;
  liked_id: string;
  created_at: string;
}

export interface ProfileBoost {
  id: string;
  user_id: string;
  boost_type: '1hour' | '3hours' | '24hours';
  started_at: string;
  expires_at: string;
  created_at: string;
}

export interface ProfileQuestion {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  caption?: string;
  views_count: number;
  created_at: string;
  expires_at: string;
  profile?: Profile;
  viewed_by_me?: boolean;
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
}

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  price_cents: number;
  created_at: string;
}

export interface GiftTransaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  gift_id: string;
  message?: string;
  created_at: string;
  gift?: Gift;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason?: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface DateIdea {
  id: string;
  title: string;
  description?: string;
  category: 'coffee' | 'dinner' | 'activity' | 'outdoor' | 'nightlife' | 'culture';
  location_type?: string;
  created_at: string;
}

export interface UserActivity {
  user_id: string;
  last_active: string;
  is_online: boolean;
}

export interface ProfileInsights {
  views_count: number;
  likes_received: number;
  super_likes_received: number;
  matches_count: number;
  response_rate: number;
}

export interface PromptLibrary {
  id: string;
  prompt_text: string;
  category: 'personality' | 'lifestyle' | 'dating' | 'fun' | 'deep';
  created_at: string;
}

export interface UserPrompt {
  id: string;
  user_id: string;
  prompt_id: string;
  answer_type: 'text' | 'voice' | 'video';
  answer_text?: string;
  answer_media_url?: string;
  display_order: number;
  created_at: string;
  prompt?: PromptLibrary;
}

export interface TravelPlan {
  id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyStandout {
  id: string;
  user_id: string;
  standout_profile_id: string;
  date: string;
  compatibility_score: number;
  created_at: string;
  profile?: Profile;
}

export interface Rose {
  id: string;
  sender_id: string;
  recipient_id: string;
  message?: string;
  created_at: string;
}

export interface Icebreaker {
  id: string;
  text: string;
  category: 'funny' | 'thoughtful' | 'flirty' | 'casual';
  created_at: string;
}

export interface Compliment {
  id: string;
  sender_id: string;
  recipient_id: string;
  compliment_type: 'smile' | 'style' | 'bio' | 'vibe' | 'photos';
  message?: string;
  is_read: boolean;
  created_at: string;
  profile?: Profile;
}

export interface SecretAdmirer {
  id: string;
  user_id: string;
  admirer_id: string;
  revealed_at?: string;
  created_at: string;
}

export interface PhotoVerification {
  id: string;
  user_id: string;
  verification_photo_url: string;
  status: 'pending' | 'approved' | 'rejected';
  verified_at?: string;
  created_at: string;
}

export interface SafetyContact {
  id: string;
  user_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  created_at: string;
}

export interface DateCheckin {
  id: string;
  user_id: string;
  match_id: string;
  date_time: string;
  location: string;
  shared_with: string[];
  check_in_time?: string;
  created_at: string;
}

export interface IncognitoSession {
  id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
}

export interface SpotlightSession {
  id: string;
  user_id: string;
  duration_minutes: number;
  started_at: string;
  expires_at: string;
  views_count: number;
  created_at: string;
}

export interface ProfileBadge {
  id: string;
  user_id: string;
  badge_type: 'verified' | 'early_adopter' | 'popular' | 'super_swiper' | 'conversation_starter' | 'photo_verified' | 'video_verified';
  earned_at: string;
}

// Ads & Monetization Types
export interface AdCampaign {
  id: string;
  name: string;
  advertiser_name: string;
  campaign_type: 'banner' | 'interstitial' | 'native' | 'video' | 'sponsored_profile';
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget_cents: number;
  spent_cents: number;
  start_date: string;
  end_date: string;
  target_demographics: Record<string, any>;
  target_interests: string[];
  priority: number;
  daily_budget_cents?: number;
  max_impressions?: number;
  max_clicks?: number;
  created_at: string;
  updated_at: string;
}

export interface AdCreative {
  id: string;
  campaign_id: string;
  creative_type: 'image' | 'video' | 'html';
  media_url: string;
  thumbnail_url?: string;
  headline?: string;
  description?: string;
  call_to_action?: string;
  destination_url?: string;
  width?: number;
  height?: number;
  duration_seconds?: number;
  is_active: boolean;
  created_at: string;
}

export interface AdPlacement {
  id: string;
  placement_key: string;
  name: string;
  description?: string;
  supported_formats: string[];
  max_ads_per_session: number;
  min_interval_seconds: number;
  created_at: string;
}

export interface AdImpression {
  id: string;
  campaign_id: string;
  creative_id: string;
  placement_id: string;
  user_id?: string;
  impression_time: string;
  session_id?: string;
  created_at: string;
}

export interface AdClick {
  id: string;
  impression_id: string;
  campaign_id: string;
  creative_id: string;
  user_id?: string;
  click_time: string;
  created_at: string;
}

export interface SponsoredProfile {
  id: string;
  profile_id: string;
  sponsor_name: string;
  campaign_id?: string;
  priority: number;
  target_demographics: Record<string, any>;
  impressions_count: number;
  clicks_count: number;
  budget_cents: number;
  spent_cents: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  profile?: Profile;
}

export interface SponsoredDateIdea {
  id: string;
  date_idea_id: string;
  sponsor_name: string;
  sponsor_logo_url?: string;
  sponsor_website?: string;
  campaign_id?: string;
  priority: number;
  impressions_count: number;
  clicks_count: number;
  is_active: boolean;
  created_at: string;
  date_idea?: DateIdea;
}

export interface TargetedAd {
  campaign_id: string;
  creative_id: string;
  campaign_name: string;
  creative_type: 'image' | 'video' | 'html';
  media_url: string;
  headline?: string;
  description?: string;
  call_to_action?: string;
  destination_url?: string;
  priority: number;
}

// AI-Powered Features
export interface AIDatingCoachSession {
  id: string;
  user_id: string;
  session_type: 'profile_review' | 'conversation_tips' | 'date_advice' | 'general_advice';
  user_query: string;
  ai_response: string;
  rating?: number;
  created_at: string;
}

export interface PhotoAnalysis {
  id: string;
  user_id: string;
  photo_url: string;
  quality_score: number;
  attractiveness_score: number;
  suggestions: string[];
  analysis_data: Record<string, any>;
  created_at: string;
}

export interface ProfileStrength {
  user_id: string;
  overall_score: number;
  photo_score: number;
  bio_score: number;
  completeness_score: number;
  engagement_score: number;
  suggestions: Array<{ type: string; message: string }>;
  last_calculated: string;
}

export interface Achievement {
  id: string;
  achievement_key: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface ActivityStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  total_active_days: number;
}

export interface AIConversationStarter {
  id: string;
  match_id: string;
  starter_text: string;
  based_on: Record<string, any>;
  was_used: boolean;
  created_at: string;
}

export interface PersonalityTest {
  id: string;
  test_key: string;
  name: string;
  description: string;
  questions: Array<{ question: string; options: string[] }>;
  created_at: string;
}

export interface UserPersonalityResult {
  id: string;
  user_id: string;
  test_id: string;
  results: Record<string, any>;
  personality_type?: string;
  created_at: string;
  test?: PersonalityTest;
}

export interface UserAnalytics {
  user_id: string;
  peak_activity_hours: number[];
  average_response_time_minutes: number;
  match_quality_score: number;
  conversation_quality_score: number;
  profile_optimization_suggestions: string[];
  weekly_stats: Record<string, any>;
  monthly_stats: Record<string, any>;
  last_calculated: string;
}

export interface MLMatchScore {
  id: string;
  user_id: string;
  recommended_profile_id: string;
  ml_score: number;
  factors: Record<string, any>;
  shown_to_user: boolean;
  user_action?: 'liked' | 'passed' | 'super_liked' | 'pending';
  created_at: string;
  profile?: Profile;
}
