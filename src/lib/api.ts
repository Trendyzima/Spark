import { supabase } from './supabase';
import type { Profile, Match, Message } from '@/types';

export const api = {
  supabase,

  // File upload
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  },

  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  },

  // Profile operations
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createProfile(profile: Omit<Profile, 'created_at' | 'updated_at' | 'is_active'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  // Discovery operations
  async getDiscoverProfiles(userId: string, gender: string, limit = 20): Promise<Profile[]> {
    const { data: likedIds } = await supabase
      .from('likes')
      .select('liked_id')
      .eq('liker_id', userId);

    const { data: passedIds } = await supabase
      .from('profile_passes')
      .select('passed_profile_id')
      .eq('user_id', userId);

    const excludeIds = [
      userId, 
      ...(likedIds?.map(l => l.liked_id) || []),
      ...(passedIds?.map(p => p.passed_profile_id) || [])
    ];

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .limit(limit);

    // Only add exclude filter if there are IDs to exclude
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }

    if (gender !== 'everyone') {
      query = query.eq('gender', gender);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  },

  // Like operations
  async likeProfile(likerId: string, likedId: string) {
    const { data, error } = await supabase
      .from('likes')
      .insert([{ liker_id: likerId, liked_id: likedId }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async passProfile(userId: string, passedId: string) {
    const { error } = await supabase
      .from('profile_passes')
      .insert([{ user_id: userId, passed_profile_id: passedId }]);
    
    if (error) throw error;
  },

  // Match operations
  async getMatches(userId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user1:user1_id(id),
        user2:user2_id(id)
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    const matchesWithProfiles = await Promise.all(
      (data || []).map(async (match) => {
        const otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        const profile = await this.getProfile(otherUserId);
        
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('match_id', match.id)
          .eq('read', false)
          .neq('sender_id', userId);

        return {
          ...match,
          profile,
          unread_count: count || 0,
        };
      })
    );

    return matchesWithProfiles;
  },

  // Message operations
  async getMessages(matchId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async sendMessage(matchId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{ match_id: matchId, sender_id: senderId, content }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async markMessagesAsRead(matchId: string, userId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('match_id', matchId)
      .neq('sender_id', userId);
    
    if (error) throw error;
  },

  // Subscription operations
  async getSubscriptionTiers() {
    const { data, error } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('price_cents', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getUserSubscription(userId: string) {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_tiers(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createCheckoutSession(priceId: string) {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: { priceId },
    });

    if (error) throw error;
    return data;
  },

  // FansOnly operations
  async getFansOnlyContent() {
    const { data, error } = await supabase
      .from('fansonly_content')
      .select('*, profiles!fansonly_content_creator_id_fkey(display_name, photos)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMyFansOnlyContent(userId: string) {
    const { data, error } = await supabase
      .from('fansonly_content')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createFansOnlyContent(creatorId: string, contentData: any) {
    const { data, error } = await supabase
      .from('fansonly_content')
      .insert([{ creator_id: creatorId, ...contentData }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteFansOnlyContent(contentId: string) {
    const { error } = await supabase
      .from('fansonly_content')
      .delete()
      .eq('id', contentId);

    if (error) throw error;
  },

  async createFansOnlyCheckout(contentId: string) {
    const { data, error } = await supabase.functions.invoke('create-fansonly-checkout', {
      body: { contentId },
    });

    if (error) throw error;
    return data;
  },

  async getFansOnlyPurchases(userId: string) {
    const { data, error } = await supabase
      .from('fansonly_purchases')
      .select('content_id')
      .eq('buyer_id', userId);

    if (error) throw error;
    return new Set((data || []).map(p => p.content_id));
  },

  // Super Likes
  async superLikeProfile(likerId: string, likedId: string) {
    const { data, error } = await supabase
      .from('super_likes')
      .insert([{ liker_id: likerId, liked_id: likedId }])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    
    // Also create a regular like
    await this.likeProfile(likerId, likedId);
    
    return data;
  },

  async getSuperLikesReceived(userId: string) {
    const { data, error } = await supabase
      .from('super_likes')
      .select('*, profiles!super_likes_liker_id_fkey(*)')
      .eq('liked_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getSuperLikesCount(userId: string, date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from('super_likes')
      .select('*', { count: 'exact', head: true })
      .eq('liker_id', userId)
      .gte('created_at', startOfDay.toISOString());

    if (error) throw error;
    return count || 0;
  },

  // Profile Boost
  async activateBoost(userId: string, boostType: '1hour' | '3hours' | '24hours') {
    const hours = boostType === '1hour' ? 1 : boostType === '3hours' ? 3 : 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hours);

    const { data, error } = await supabase
      .from('profile_boosts')
      .insert([{
        user_id: userId,
        boost_type: boostType,
        expires_at: expiresAt.toISOString(),
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getActiveBoost(userId: string) {
    const { data, error } = await supabase
      .from('profile_boosts')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Rewind
  async rewindLastAction(userId: string) {
    // Get the last action (like or pass)
    const { data: lastLike } = await supabase
      .from('likes')
      .select('*')
      .eq('liker_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: lastPass } = await supabase
      .from('profile_passes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let lastAction = null;
    let actionType: 'like' | 'pass' | 'super_like' = 'like';
    let profileId = '';

    if (lastLike && lastPass) {
      if (new Date(lastLike.created_at) > new Date(lastPass.created_at)) {
        lastAction = lastLike;
        actionType = 'like';
        profileId = lastLike.liked_id;
      } else {
        lastAction = lastPass;
        actionType = 'pass';
        profileId = lastPass.passed_profile_id;
      }
    } else if (lastLike) {
      lastAction = lastLike;
      actionType = 'like';
      profileId = lastLike.liked_id;
    } else if (lastPass) {
      lastAction = lastPass;
      actionType = 'pass';
      profileId = lastPass.passed_profile_id;
    }

    if (!lastAction) return null;

    // Save to rewind history
    await supabase
      .from('rewind_history')
      .insert([{
        user_id: userId,
        rewound_profile_id: profileId,
        action_type: actionType,
      }]);

    // Delete the action
    if (actionType === 'like') {
      await supabase
        .from('likes')
        .delete()
        .eq('id', lastAction.id);
    } else {
      await supabase
        .from('profile_passes')
        .delete()
        .eq('id', lastAction.id);
    }

    return { profileId, actionType };
  },

  // Profile Questions
  async getProfileQuestions(userId: string) {
    const { data, error } = await supabase
      .from('profile_questions')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async saveProfileQuestions(userId: string, questions: Array<{ question: string; answer: string }>) {
    // Delete existing questions
    await supabase
      .from('profile_questions')
      .delete()
      .eq('user_id', userId);

    // Insert new questions
    const questionsToInsert = questions.map((q, index) => ({
      user_id: userId,
      question: q.question,
      answer: q.answer,
      display_order: index,
    }));

    const { data, error } = await supabase
      .from('profile_questions')
      .insert(questionsToInsert)
      .select();

    if (error) throw error;
    return data;
  },

  // Stories
  async getStories() {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data, error } = await supabase
      .from('stories')
      .select('*, profiles!stories_user_id_fkey(*)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Check if current user has viewed each story
    const storiesWithViewStatus = await Promise.all(
      (data || []).map(async (story) => {
        if (currentUserId) {
          const { data: viewData } = await supabase
            .from('story_views')
            .select('id')
            .eq('story_id', story.id)
            .eq('viewer_id', currentUserId)
            .maybeSingle();
          
          return {
            ...story,
            viewed_by_me: !!viewData,
          };
        }
        return {
          ...story,
          viewed_by_me: false,
        };
      })
    );
    
    return storiesWithViewStatus;
  },

  async createStory(userId: string, mediaType: 'photo' | 'video', mediaUrl: string, caption?: string) {
    const { data, error } = await supabase
      .from('stories')
      .insert([{
        user_id: userId,
        media_type: mediaType,
        media_url: mediaUrl,
        caption,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async viewStory(storyId: string, viewerId: string) {
    const { error } = await supabase
      .from('story_views')
      .insert([{ story_id: storyId, viewer_id: viewerId }]);

    if (error && error.code !== '23505') throw error; // Ignore duplicate constraint

    // Increment views count
    await supabase.rpc('increment_story_views', { story_id: storyId });
  },

  async deleteStory(storyId: string) {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) throw error;
  },

  // Gifts
  async getGifts() {
    const { data, error } = await supabase
      .from('gifts')
      .select('*')
      .order('price_cents', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendGift(senderId: string, recipientId: string, giftId: string, message?: string) {
    const { data, error } = await supabase
      .from('gift_transactions')
      .insert([{
        sender_id: senderId,
        recipient_id: recipientId,
        gift_id: giftId,
        message,
      }])
      .select('*, gifts(*)')
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getReceivedGifts(userId: string) {
    const { data, error } = await supabase
      .from('gift_transactions')
      .select('*, gifts(*), profiles!gift_transactions_sender_id_fkey(*)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Block & Report
  async blockUser(blockerId: string, blockedId: string, reason?: string) {
    const { data, error } = await supabase
      .from('blocked_users')
      .insert([{
        blocker_id: blockerId,
        blocked_id: blockedId,
        reason,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async unblockUser(blockerId: string, blockedId: string) {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);

    if (error) throw error;
  },

  async getBlockedUsers(userId: string) {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('*, profiles!blocked_users_blocked_id_fkey(*)')
      .eq('blocker_id', userId);

    if (error) throw error;
    return data || [];
  },

  async reportUser(reporterId: string, reportedId: string, reason: string, details?: string) {
    const { data, error } = await supabase
      .from('reports')
      .insert([{
        reporter_id: reporterId,
        reported_id: reportedId,
        reason,
        details,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Date Ideas
  async getDateIdeas(category?: string) {
    let query = supabase
      .from('date_ideas')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // User Activity
  async updateActivity(userId: string) {
    await supabase.rpc('update_user_activity', { p_user_id: userId });
  },

  async getUserActivity(userId: string) {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Profile Views
  async recordProfileView(viewerId: string, viewedId: string) {
    const { error } = await supabase
      .from('profile_views')
      .insert([{
        viewer_id: viewerId,
        viewed_profile_id: viewedId,
      }]);

    if (error && error.code !== '23505') throw error;
  },

  async getProfileViewers(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('profile_views')
      .select('*, profiles!profile_views_viewer_id_fkey(*)')
      .eq('viewed_profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Compatibility Score
  async getCompatibilityScore(user1Id: string, user2Id: string) {
    const { data, error } = await supabase.rpc('calculate_compatibility', {
      user1_id: user1Id,
      user2_id: user2Id,
    });

    if (error) throw error;
    return data || 0;
  },

  // Profile Insights
  async getProfileInsights(userId: string) {
    const [viewsResult, likesResult, superLikesResult, matchesResult] = await Promise.all([
      supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_profile_id', userId),
      supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('liked_id', userId),
      supabase
        .from('super_likes')
        .select('*', { count: 'exact', head: true })
        .eq('liked_id', userId),
      supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`),
    ]);

    return {
      views_count: viewsResult.count || 0,
      likes_received: likesResult.count || 0,
      super_likes_received: superLikesResult.count || 0,
      matches_count: matchesResult.count || 0,
      response_rate: 0, // TODO: Calculate based on messages
    };
  },

  // Voice Messages
  async sendVoiceMessage(matchId: string, senderId: string, voiceUrl: string, duration: number) {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        match_id: matchId,
        sender_id: senderId,
        content: '',
        message_type: 'voice',
        voice_url: voiceUrl,
        voice_duration: duration,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Prompts/Vibes
  async getPromptLibrary() {
    const { data, error } = await supabase
      .from('prompt_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getUserPrompts(userId: string) {
    const { data, error } = await supabase
      .from('user_prompts')
      .select('*, prompt:prompt_id(prompt_text, category)')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async saveUserPrompt(userId: string, promptId: string, answerType: 'text' | 'voice' | 'video', answerText?: string, answerMediaUrl?: string) {
    const { data, error } = await supabase
      .from('user_prompts')
      .insert([{
        user_id: userId,
        prompt_id: promptId,
        answer_type: answerType,
        answer_text: answerText,
        answer_media_url: answerMediaUrl,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteUserPrompt(promptId: string) {
    const { error } = await supabase
      .from('user_prompts')
      .delete()
      .eq('id', promptId);

    if (error) throw error;
  },

  // Travel Mode
  async createTravelPlan(userId: string, destination: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('travel_plans')
      .insert([{
        user_id: userId,
        destination,
        start_date: startDate,
        end_date: endDate,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getTravelPlans(userId: string) {
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async deactivateTravelPlan(planId: string) {
    const { error } = await supabase
      .from('travel_plans')
      .update({ is_active: false })
      .eq('id', planId);

    if (error) throw error;
  },

  // Daily Standouts/Top Picks
  async getDailyStandouts(userId: string) {
    // Generate standouts if not already done for today
    await supabase.rpc('generate_daily_standouts', { p_user_id: userId });

    const { data, error } = await supabase
      .from('daily_standouts')
      .select('*, profile:standout_profile_id(*)')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .order('compatibility_score', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Roses
  async sendRose(senderId: string, recipientId: string, message?: string) {
    const { data, error } = await supabase
      .from('roses')
      .insert([{
        sender_id: senderId,
        recipient_id: recipientId,
        message,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getReceivedRoses(userId: string) {
    const { data, error } = await supabase
      .from('roses')
      .select('*, profile:sender_id(*)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Icebreakers
  async getIcebreakers(category?: string) {
    let query = supabase
      .from('icebreakers')
      .select('*');

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  // Compliments
  async sendCompliment(senderId: string, recipientId: string, complimentType: string, message?: string) {
    const { data, error } = await supabase
      .from('compliments')
      .insert([{
        sender_id: senderId,
        recipient_id: recipientId,
        compliment_type: complimentType,
        message,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getReceivedCompliments(userId: string) {
    const { data, error } = await supabase
      .from('compliments')
      .select('*, profile:sender_id(*)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markComplimentAsRead(complimentId: string) {
    const { error } = await supabase
      .from('compliments')
      .update({ is_read: true })
      .eq('id', complimentId);

    if (error) throw error;
  },

  // Secret Admirer
  async getSecretAdmirers(userId: string) {
    const { data, error } = await supabase
      .from('secret_admirers')
      .select('*')
      .eq('user_id', userId)
      .is('revealed_at', null);

    if (error) throw error;
    return data || [];
  },

  // Photo Verification
  async submitPhotoVerification(userId: string, photoUrl: string) {
    const { data, error } = await supabase
      .from('photo_verifications')
      .insert([{
        user_id: userId,
        verification_photo_url: photoUrl,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getPhotoVerificationStatus(userId: string) {
    const { data, error } = await supabase
      .from('photo_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Safety Center
  async getSafetyContacts(userId: string) {
    const { data, error } = await supabase
      .from('safety_contacts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async addSafetyContact(userId: string, name: string, phone: string, email?: string) {
    const { data, error } = await supabase
      .from('safety_contacts')
      .insert([{
        user_id: userId,
        contact_name: name,
        contact_phone: phone,
        contact_email: email,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteSafetyContact(contactId: string) {
    const { error } = await supabase
      .from('safety_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  },

  async createDateCheckin(userId: string, matchId: string, dateTime: string, location: string, sharedWith: string[]) {
    const { data, error } = await supabase
      .from('date_checkins')
      .insert([{
        user_id: userId,
        match_id: matchId,
        date_time: dateTime,
        location,
        shared_with: sharedWith,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async checkInDate(checkinId: string) {
    const { error } = await supabase
      .from('date_checkins')
      .update({ check_in_time: new Date().toISOString() })
      .eq('id', checkinId);

    if (error) throw error;
  },

  // Incognito Mode
  async toggleIncognitoMode(userId: string, enabled: boolean) {
    if (enabled) {
      const { data, error } = await supabase
        .from('incognito_sessions')
        .insert([{ user_id: userId }])
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    } else {
      const { error } = await supabase
        .from('incognito_sessions')
        .update({ ended_at: new Date().toISOString(), is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
    }
  },

  async getIncognitoStatus(userId: string) {
    const { data, error } = await supabase
      .from('incognito_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Spotlight
  async activateSpotlight(userId: string, durationMinutes: number) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

    const { data, error } = await supabase
      .from('spotlight_sessions')
      .insert([{
        user_id: userId,
        duration_minutes: durationMinutes,
        expires_at: expiresAt.toISOString(),
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getActiveSpotlight(userId: string) {
    const { data, error } = await supabase
      .from('spotlight_sessions')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Profile Badges
  async getProfileBadges(userId: string) {
    const { data, error } = await supabase
      .from('profile_badges')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async awardBadge(userId: string, badgeType: string) {
    const { data, error } = await supabase
      .from('profile_badges')
      .insert([{
        user_id: userId,
        badge_type: badgeType,
      }])
      .select()
      .maybeSingle();

    if (error && error.code !== '23505') throw error; // Ignore duplicates
    return data;
  },

  // Ads & Monetization
  async getTargetedAd(userId: string, placementKey: string) {
    const { data, error } = await supabase.rpc('get_targeted_ad', {
      p_user_id: userId,
      p_placement_key: placementKey,
      p_limit: 1,
    });

    if (error) throw error;
    return data?.[0] || null;
  },

  async trackAdImpression(campaignId: string, creativeId: string, placementKey: string, userId: string, sessionId?: string) {
    // Get placement ID
    const { data: placement } = await supabase
      .from('ad_placements')
      .select('id')
      .eq('placement_key', placementKey)
      .maybeSingle();

    if (!placement) return null;

    const { data, error } = await supabase.rpc('track_ad_impression', {
      p_campaign_id: campaignId,
      p_creative_id: creativeId,
      p_placement_id: placement.id,
      p_user_id: userId,
      p_session_id: sessionId,
    });

    if (error) throw error;
    return data;
  },

  async trackAdClick(impressionId: string, userId: string) {
    const { data, error } = await supabase.rpc('track_ad_click', {
      p_impression_id: impressionId,
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  },

  async getSponsoredProfiles(limit = 3) {
    const { data, error } = await supabase
      .from('sponsored_profiles')
      .select('*, profile:profile_id(*)')
      .eq('is_active', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getSponsoredDateIdeas(limit = 5) {
    const { data, error } = await supabase
      .from('sponsored_date_ideas')
      .select('*, date_idea:date_idea_id(*)')
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async trackSponsoredProfileView(sponsoredProfileId: string) {
    const { error } = await supabase
      .from('sponsored_profiles')
      .update({ impressions_count: supabase.raw('impressions_count + 1') })
      .eq('id', sponsoredProfileId);

    if (error) console.error('Error tracking sponsored profile view:', error);
  },

  async trackSponsoredProfileClick(sponsoredProfileId: string) {
    const { error } = await supabase
      .from('sponsored_profiles')
      .update({ 
        clicks_count: supabase.raw('clicks_count + 1'),
        spent_cents: supabase.raw('spent_cents + 15'), // $0.15 per click
      })
      .eq('id', sponsoredProfileId);

    if (error) console.error('Error tracking sponsored profile click:', error);
  },

  // AI-Powered Features
  async getAIDatingCoach(sessionType: string, userQuery: string, userProfile?: any, matchProfile?: any) {
    const { data, error } = await supabase.functions.invoke('ai-dating-coach', {
      body: { sessionType, userQuery, userProfile, matchProfile },
    });

    if (error) throw error;
    return data;
  },

  async getAIConversationStarters(matchProfile: any, userProfile: any) {
    const { data, error } = await supabase.functions.invoke('ai-conversation-starter', {
      body: { matchProfile, userProfile },
    });

    if (error) throw error;
    return data;
  },

  async analyzePhoto(photoUrl: string) {
    const { data, error } = await supabase.functions.invoke('ai-photo-analyzer', {
      body: { photoUrl },
    });

    if (error) throw error;
    return data;
  },

  async getProfileStrength(userId: string) {
    const { data, error } = await supabase.rpc('calculate_profile_strength', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data;
  },

  async getAchievements() {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('tier', { ascending: true })
      .order('points', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievement_id(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActivityStreak(userId: string) {
    await supabase.rpc('update_activity_streak', { p_user_id: userId });
    
    const { data, error } = await supabase
      .from('activity_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getPersonalityTests() {
    const { data, error } = await supabase
      .from('personality_tests')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async submitPersonalityTest(userId: string, testId: string, results: any, personalityType?: string) {
    const { data, error } = await supabase
      .from('user_personality_results')
      .insert([{
        user_id: userId,
        test_id: testId,
        results,
        personality_type: personalityType,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getUserPersonalityResults(userId: string) {
    const { data, error } = await supabase
      .from('user_personality_results')
      .select('*, test:test_id(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  },

  async getUserAnalytics(userId: string) {
    const { data, error } = await supabase
      .from('user_analytics')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getMLRecommendations(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('ml_match_scores')
      .select('*, profile:recommended_profile_id(*)')
      .eq('user_id', userId)
      .eq('shown_to_user', false)
      .order('ml_score', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async saveCoachSession(userId: string, sessionType: string, userQuery: string, aiResponse: string) {
    const { data, error } = await supabase
      .from('ai_coach_sessions')
      .insert([{
        user_id: userId,
        session_type: sessionType,
        user_query: userQuery,
        ai_response: aiResponse,
      }])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getCoachSessions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('ai_coach_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // === SPARK COINS ===
  async getCoinPackages() {
    const { data, error } = await supabase
      .from('coin_packages')
      .select('*')
      .order('price_cents', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getUserCoins(userId: string) {
    const { data, error } = await supabase
      .from('user_coins')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getCoinTransactions(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  async awardCoins(userId: string, amount: number, description: string) {
    const { data, error } = await supabase.rpc('add_coins', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
      p_type: 'bonus',
    });
    if (error) throw error;
    return data;
  },

  async spendCoins(userId: string, amount: number, description: string, type = 'spend') {
    const { data, error } = await supabase.rpc('spend_coins', {
      p_user_id: userId,
      p_amount: amount,
      p_description: description,
      p_type: type,
    });
    if (error) throw error;
    return data;
  },

  // === DATING EVENTS ===
  async getDatingEvents(type?: string) {
    let query = supabase
      .from('dating_events')
      .select('*, registrations_count:event_registrations(count)')
      .eq('is_active', true)
      .order('scheduled_at', { ascending: true });
    if (type) query = query.eq('event_type', type);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((e: any) => ({
      ...e,
      registrations_count: e.registrations_count?.[0]?.count || 0,
    }));
  },

  async getUserEventRegistrations(userId: string) {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },

  async registerForEvent(userId: string, eventId: string, paymentMethod: string) {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{ event_id: eventId, user_id: userId, payment_method: paymentMethod }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // === VIDEO DATES ===
  async scheduleVideoDate(matchId: string, requesterId: string, recipientId: string, scheduledAt: string, durationMinutes: number, notes?: string) {
    const roomId = `vd-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const { data, error } = await supabase
      .from('video_dates')
      .insert([{
        match_id: matchId,
        requester_id: requesterId,
        recipient_id: recipientId,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
        notes,
        room_id: roomId,
      }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getVideoDates(userId: string) {
    const { data, error } = await supabase
      .from('video_dates')
      .select('*, requester:requester_id(*), recipient:recipient_id(*)')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('scheduled_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async respondToVideoDate(dateId: string, status: 'accepted' | 'declined') {
    const { error } = await supabase
      .from('video_dates')
      .update({ status })
      .eq('id', dateId);
    if (error) throw error;
  },

  // === USER MOOD ===
  async setUserMood(userId: string, mood: string, customStatus?: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const { data, error } = await supabase
      .from('user_mood')
      .upsert([{ user_id: userId, mood, custom_status: customStatus, expires_at: expiresAt.toISOString() }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getUserMood(userId: string) {
    const { data, error } = await supabase
      .from('user_mood')
      .select('*')
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // === REFERRALS ===
  async createReferral(referrerId: string, referredEmail: string) {
    const { data, error } = await supabase
      .from('referrals')
      .insert([{ referrer_id: referrerId, referred_email: referredEmail }])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getReferrals(userId: string) {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};
