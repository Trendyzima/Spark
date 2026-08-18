import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '@/types';

// Pages
import { Landing } from '@/pages/Landing';
import { Auth } from '@/pages/Auth';
import { SetupProfile } from '@/pages/SetupProfile';
import { Discover } from '@/pages/Discover';
import { Matches } from '@/pages/Matches';
import { Chat } from '@/pages/Chat';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';
import { Premium } from '@/pages/Premium';
import { FansOnly } from '@/pages/FansOnly';
import { Insights } from '@/pages/Insights';
import { VideoFeeds } from '@/pages/VideoFeeds';
import { Standouts } from '@/pages/Standouts';
import { SafetyCenter } from '@/pages/SafetyCenter';
import { Events } from '@/pages/Events';
import { Coins } from '@/pages/Coins';
import { VideoDate } from '@/pages/VideoDate';
import { Notifications } from '@/pages/Notifications';

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

function App() {
  const { user, loading, login, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) login(mapSupabaseUser(session.user));
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (event === 'SIGNED_IN' && session?.user) {
          login(mapSupabaseUser(session.user));
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          useAuthStore.getState().logout();
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          login(mapSupabaseUser(session.user));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-3xl">💝</span>
          </div>
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/setup-profile" element={<SetupProfile />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/chat/:matchId" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/fansonly" element={<FansOnly />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/video-feeds" element={<VideoFeeds />} />
            <Route path="/standouts" element={<Standouts />} />
            <Route path="/safety" element={<SafetyCenter />} />
            <Route path="/events" element={<Events />} />
            <Route path="/coins" element={<Coins />} />
            <Route path="/video-date" element={<VideoDate />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="*" element={<Navigate to="/discover" replace />} />
          </>
        )}
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
