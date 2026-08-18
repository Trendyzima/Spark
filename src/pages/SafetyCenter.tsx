import { useState, useEffect } from 'react';
import { Shield, Plus, X, Phone, Mail, MapPin, Calendar, Check } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { SafetyContact, DateCheckin, Match } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SafetyCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<SafetyContact[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showScheduleDate, setShowScheduleDate] = useState(false);

  // Add contact form
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Schedule date form
  const [selectedMatch, setSelectedMatch] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [contactsData, matchesData] = await Promise.all([
        api.getSafetyContacts(user.id),
        api.getMatches(user.id),
      ]);

      setContacts(contactsData);
      setMatches(matchesData);
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

  const handleAddContact = async () => {
    if (!user || !contactName.trim() || !contactPhone.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.addSafetyContact(user.id, contactName, contactPhone, contactEmail);
      toast({ title: 'Safety contact added' });
      setShowAddContact(false);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await api.deleteSafetyContact(contactId);
      toast({ title: 'Contact removed' });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleScheduleDate = async () => {
    if (!user || !selectedMatch || !dateTime || !location.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const sharedWith = contacts.map(c => c.contact_email || c.contact_phone);
      await api.createDateCheckin(user.id, selectedMatch, dateTime, location, sharedWith);
      
      toast({
        title: 'Date Details Shared',
        description: 'Your safety contacts have been notified',
      });

      setShowScheduleDate(false);
      setSelectedMatch('');
      setDateTime('');
      setLocation('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-24 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-3xl font-bold">Safety Center</h1>
            <p className="text-muted-foreground">
              Share your date details with trusted contacts for peace of mind
            </p>
          </div>

          {/* Safety Contacts */}
          <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Safety Contacts</h3>
              <Button onClick={() => setShowAddContact(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Contact
              </Button>
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm mb-3">
                  No safety contacts yet
                </p>
                <Button onClick={() => setShowAddContact(true)} variant="outline">
                  Add Your First Contact
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{contact.contact_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {contact.contact_phone}
                        </span>
                        {contact.contact_email && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.contact_email}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 hover:bg-destructive/10 rounded-full text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Share Date Details */}
          <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
            <h3 className="text-lg font-semibold">Share Date Details</h3>
            <p className="text-sm text-muted-foreground">
              Let your safety contacts know when and where you're meeting someone
            </p>

            {contacts.length === 0 ? (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Add safety contacts first to share date details
                </p>
              </div>
            ) : (
              <Button
                onClick={() => setShowScheduleDate(true)}
                className="w-full"
                variant="outline"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule & Share Date
              </Button>
            )}
          </div>

          {/* Safety Tips */}
          <div className="bg-card rounded-2xl p-6 border border-border space-y-3">
            <h3 className="text-lg font-semibold mb-4">Safety Tips</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Meet in public</p>
                  <p className="text-xs text-muted-foreground">Always choose well-lit, public places for first dates</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Tell someone</p>
                  <p className="text-xs text-muted-foreground">Share your plans with friends or family</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Stay in control</p>
                  <p className="text-xs text-muted-foreground">Arrange your own transportation and keep your phone charged</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Trust your instincts</p>
                  <p className="text-xs text-muted-foreground">If something feels off, it's okay to leave</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />

      {/* Add Contact Modal */}
      {showAddContact && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Add Safety Contact</h3>
              <button onClick={() => setShowAddContact(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name *</label>
                <Input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Mom, Best Friend, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone Number *</label>
                <Input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Email (Optional)</label>
                <Input
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddContact(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddContact} className="flex-1 gradient-primary text-white">
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Date Modal */}
      {showScheduleDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-3xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Share Date Details</h3>
              <button onClick={() => setShowScheduleDate(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Who are you meeting? *</label>
                <select
                  value={selectedMatch}
                  onChange={(e) => setSelectedMatch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                >
                  <option value="">Select a match...</option>
                  {matches.map((match) => (
                    <option key={match.id} value={match.id}>
                      {match.profile?.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">When? *</label>
                <Input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Where? *</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Starbucks on Main St"
                />
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  This information will be shared with: {contacts.map(c => c.contact_name).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowScheduleDate(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleScheduleDate} className="flex-1 gradient-primary text-white">
                Share Details
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
