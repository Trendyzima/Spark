import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Video, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { PromptsManager } from '@/components/features/PromptsManager';
import { api } from '@/lib/api';

const MAX_PHOTOS = 10;
const MAX_VIDEOS = 5;

export function SetupProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [lookingFor, setLookingFor] = useState<'male' | 'female' | 'everyone'>('female');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [datingGoal, setDatingGoal] = useState<string>('relationship');
  const [starSign, setStarSign] = useState('');
  const [spotifyArtist, setSpotifyArtist] = useState('');
  const [vaccineStatus, setVaccineStatus] = useState<string>('prefer_not_to_say');
  const [politicalViews, setPoliticalViews] = useState<string>('moderate');

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await api.getProfile(user.id);
      if (profile) {
        setDisplayName(profile.display_name || '');
        setAge(profile.age?.toString() || '');
        setGender(profile.gender || 'male');
        setLookingFor(profile.looking_for || 'female');
        setBio(profile.bio || '');
        setLocation(profile.location || '');
        setPhotos(profile.photos || []);
        setVideos(profile.videos || []);
        setInterests(profile.interests || []);
        setDatingGoal(profile.dating_goal || 'relationship');
        setStarSign(profile.star_sign || '');
        setSpotifyArtist(profile.spotify_artist || '');
        setVaccineStatus(profile.vaccine_status || 'prefer_not_to_say');
        setPoliticalViews(profile.political_views || 'moderate');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (photos.length >= MAX_PHOTOS) {
      toast({
        title: 'Limit Reached',
        description: `You can upload maximum ${MAX_PHOTOS} photos`,
        variant: 'destructive',
      });
      return;
    }

    setUploadingPhoto(true);
    try {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const url = await api.uploadFile('profile-photos', path, file);
      setPhotos([...photos, url]);
      toast({ title: 'Photo uploaded successfully' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (videos.length >= MAX_VIDEOS) {
      toast({
        title: 'Limit Reached',
        description: `You can upload maximum ${MAX_VIDEOS} videos`,
        variant: 'destructive',
      });
      return;
    }

    setUploadingVideo(true);
    try {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const url = await api.uploadFile('profile-videos', path, file);
      setVideos([...videos, url]);
      toast({ title: 'Video uploaded successfully' });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (photos.length === 0) {
      toast({
        title: 'Add at least one photo',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        id: user.id,
        display_name: displayName,
        age: parseInt(age),
        gender,
        looking_for: lookingFor,
        bio,
        location,
        photos,
        videos,
        interests,
        dating_goal: datingGoal,
        star_sign: starSign,
        spotify_artist: spotifyArtist,
        vaccine_status: vaccineStatus,
        political_views: politicalViews,
      };

      const existing = await api.getProfile(user.id);
      if (existing) {
        await api.updateProfile(user.id, profileData);
      } else {
        await api.createProfile(profileData);
      }

      toast({ title: 'Profile saved successfully!' });
      navigate('/discover');
    } catch (error: any) {
      toast({
        title: 'Error saving profile',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">Let others know who you are</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Photos ({photos.length}/{MAX_PHOTOS})</h3>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto || photos.length >= MAX_PHOTOS}
                />
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Add Photo</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Videos ({videos.length}/{MAX_VIDEOS})</h3>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo || videos.length >= MAX_VIDEOS}
                />
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  {uploadingVideo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">Add Video</span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {videos.map((video, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                  <video src={video} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            
            <div>
              <label className="text-sm font-medium">Display Name *</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Age *</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min="18"
                max="100"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Looking For *</label>
              <select
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value as any)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
                required
              >
                <option value="male">Men</option>
                <option value="female">Women</option>
                <option value="everyone">Everyone</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>

          {/* Interests */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold">Interests</h3>
            
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
              />
              <Button type="button" onClick={addInterest}>Add</Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <div
                  key={interest}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary flex items-center gap-2"
                >
                  <span className="text-sm">{interest}</span>
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="hover:opacity-70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dating Preferences */}
          <div className="bg-card rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold">Dating Preferences</h3>
            
            <div>
              <label className="text-sm font-medium">What are you looking for?</label>
              <select
                value={datingGoal}
                onChange={(e) => setDatingGoal(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
              >
                <option value="relationship">Long-term relationship</option>
                <option value="casual">Something casual</option>
                <option value="friendship">New friends</option>
                <option value="figuring_it_out">Still figuring it out</option>
                <option value="marriage">Marriage</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Star Sign</label>
              <Input
                value={starSign}
                onChange={(e) => setStarSign(e.target.value)}
                placeholder="Aries, Taurus, etc."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Favorite Artist/Band</label>
              <Input
                value={spotifyArtist}
                onChange={(e) => setSpotifyArtist(e.target.value)}
                placeholder="Your music taste"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">COVID Vaccine Status</label>
              <select
                value={vaccineStatus}
                onChange={(e) => setVaccineStatus(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
              >
                <option value="vaccinated">Vaccinated</option>
                <option value="not_vaccinated">Not vaccinated</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Political Views</label>
              <select
                value={politicalViews}
                onChange={(e) => setPoliticalViews(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
              >
                <option value="liberal">Liberal</option>
                <option value="moderate">Moderate</option>
                <option value="conservative">Conservative</option>
                <option value="apolitical">Not political</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Prompts */}
          <div className="bg-card rounded-2xl p-6">
            <PromptsManager />
          </div>

          <Button
            type="submit"
            className="w-full h-12 gradient-primary text-white text-lg"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
