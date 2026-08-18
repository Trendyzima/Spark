import { useState } from 'react';
import { MessageCircle, Sparkles, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { Profile } from '@/types';

interface AIDatingCoachProps {
  userProfile?: Profile | null;
  matchProfile?: Profile | null;
  defaultType?: 'profile_review' | 'conversation_tips' | 'date_advice' | 'general_advice';
}

export function AIDatingCoach({ userProfile, matchProfile, defaultType = 'general_advice' }: AIDatingCoachProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionType, setSessionType] = useState(defaultType);
  const [query, setQuery] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (!user || !query.trim()) return;

    setLoading(true);
    try {
      const response = await api.getAIDatingCoach(
        sessionType,
        query,
        userProfile,
        matchProfile
      );

      setAdvice(response.advice);

      // Save session
      await api.saveCoachSession(user.id, sessionType, query, response.advice);

      toast({
        title: '✨ Advice Generated',
        description: 'Your AI dating coach has responded',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = {
    profile_review: [
      'Review my entire profile and suggest improvements',
      'How can I make my bio more attractive?',
      'Are my photos good for dating?',
    ],
    conversation_tips: [
      'Help me start a conversation with this match',
      'What should I ask to keep the conversation going?',
      'How do I suggest meeting up?',
    ],
    date_advice: [
      'Where should we go for a first date?',
      'How do I make a great first impression?',
      'What topics should I avoid on a first date?',
    ],
    general_advice: [
      'How can I improve my dating success?',
      'Why am I not getting matches?',
      'How do I know if someone is interested?',
    ],
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold">AI Dating Coach</h3>
          <p className="text-sm text-muted-foreground">Get personalized dating advice powered by AI</p>
        </div>
      </div>

      {/* Session Type Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'profile_review', label: 'Profile Review', icon: '📝' },
          { key: 'conversation_tips', label: 'Conversation Tips', icon: '💬' },
          { key: 'date_advice', label: 'Date Advice', icon: '🌹' },
          { key: 'general_advice', label: 'General Advice', icon: '💡' },
        ].map((type) => (
          <button
            key={type.key}
            onClick={() => setSessionType(type.key as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              sessionType === type.key
                ? 'gradient-primary text-white'
                : 'bg-card border border-border hover:bg-accent'
            }`}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      {/* Quick Prompts */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Quick Questions:</p>
        <div className="space-y-2">
          {quickPrompts[sessionType].map((prompt, index) => (
            <button
              key={index}
              onClick={() => setQuery(prompt)}
              className="w-full text-left px-4 py-3 rounded-xl bg-card border border-border hover:bg-accent transition-colors text-sm"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask your dating coach anything..."
          className="min-h-[100px] resize-none"
        />
        <Button
          onClick={handleGetAdvice}
          disabled={loading || !query.trim()}
          className="w-full gradient-primary text-white"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Advice...
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4 mr-2" />
              Get AI Advice
            </>
          )}
        </Button>
      </div>

      {/* Response */}
      {advice && (
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-2">AI Coach Says:</h4>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{advice}</div>
            </div>
          </div>

          {/* Feedback */}
          <div className="flex items-center gap-2 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Was this helpful?</span>
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
