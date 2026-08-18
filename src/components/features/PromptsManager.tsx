import { useState, useEffect } from 'react';
import { Plus, X, Mic, Video as VideoIcon, Type } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { PromptLibrary, UserPrompt } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function PromptsManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [promptLibrary, setPromptLibrary] = useState<PromptLibrary[]>([]);
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [answerType, setAnswerType] = useState<'text' | 'voice' | 'video'>('text');
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [library, prompts] = await Promise.all([
        api.getPromptLibrary(),
        api.getUserPrompts(user.id),
      ]);

      setPromptLibrary(library);
      setUserPrompts(prompts);
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

  const handleSave = async () => {
    if (!user || !selectedPrompt || !answerText.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select a prompt and provide an answer',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await api.saveUserPrompt(user.id, selectedPrompt, answerType, answerText);
      
      toast({
        title: 'Prompt Saved!',
        description: 'Your profile has been updated',
      });

      setShowAddModal(false);
      setSelectedPrompt('');
      setAnswerText('');
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (promptId: string) => {
    try {
      await api.deleteUserPrompt(promptId);
      toast({ title: 'Prompt removed' });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personality': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300';
      case 'lifestyle': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'dating': return 'bg-pink-500/10 text-pink-700 dark:text-pink-300';
      case 'fun': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'deep': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profile Prompts</h3>
          <p className="text-sm text-muted-foreground">Show your personality beyond photos</p>
        </div>
        {userPrompts.length < 3 && (
          <Button onClick={() => setShowAddModal(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Prompt
          </Button>
        )}
      </div>

      {/* User's Prompts */}
      <div className="space-y-3">
        {userPrompts.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground mb-3">No prompts yet</p>
            <Button onClick={() => setShowAddModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Prompt
            </Button>
          </div>
        ) : (
          userPrompts.map((up) => (
            <div key={up.id} className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-sm mb-2">{up.prompt?.prompt_text}</p>
                  {up.answer_text && (
                    <p className="text-muted-foreground">{up.answer_text}</p>
                  )}
                  {up.answer_media_url && (
                    <div className="mt-2">
                      {up.answer_type === 'voice' && (
                        <audio src={up.answer_media_url} controls className="w-full" />
                      )}
                      {up.answer_type === 'video' && (
                        <video src={up.answer_media_url} controls className="w-full rounded-lg" />
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(up.id)}
                  className="p-1.5 hover:bg-destructive/10 rounded-full text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {up.prompt && (
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(up.prompt.category)}`}>
                  {up.prompt.category}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Prompt Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Add a Prompt</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select a Prompt</label>
                <Select value={selectedPrompt} onValueChange={setSelectedPrompt}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a prompt..." />
                  </SelectTrigger>
                  <SelectContent>
                    {promptLibrary
                      .filter(p => !userPrompts.find(up => up.prompt_id === p.id))
                      .map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.id}>
                          <div className="flex items-center gap-2">
                            <span>{prompt.prompt_text}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(prompt.category)}`}>
                              {prompt.category}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Answer Type</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={answerType === 'text' ? 'default' : 'outline'}
                    onClick={() => setAnswerType('text')}
                    className="flex-1"
                  >
                    <Type className="w-4 h-4 mr-1" />
                    Text
                  </Button>
                  <Button
                    type="button"
                    variant={answerType === 'voice' ? 'default' : 'outline'}
                    onClick={() => setAnswerType('voice')}
                    className="flex-1"
                  >
                    <Mic className="w-4 h-4 mr-1" />
                    Voice
                  </Button>
                  <Button
                    type="button"
                    variant={answerType === 'video' ? 'default' : 'outline'}
                    onClick={() => setAnswerType('video')}
                    className="flex-1"
                  >
                    <VideoIcon className="w-4 h-4 mr-1" />
                    Video
                  </Button>
                </div>
              </div>

              {answerType === 'text' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Answer</label>
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                  />
                </div>
              )}

              {(answerType === 'voice' || answerType === 'video') && (
                <div className="text-center py-6 border-2 border-dashed border-border rounded-2xl">
                  <p className="text-sm text-muted-foreground">
                    {answerType === 'voice' ? 'Voice' : 'Video'} recording coming soon!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For now, please use text answers
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !selectedPrompt || !answerText.trim()}
                className="flex-1 gradient-primary text-white"
              >
                {saving ? 'Saving...' : 'Save Prompt'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
