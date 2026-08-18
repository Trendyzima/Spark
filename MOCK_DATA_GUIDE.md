# Mock Data Guide for Spark Dating App

This guide explains how to add realistic mock data to make your app feel alive.

## Quick Setup

The app now includes:
- ✅ 35 diverse date ideas (coffee, dinner, activities, outdoor, nightlife, culture)
- ✅ 21 virtual gifts (from roses to rockets, $0.99 to $29.99)

## Adding Mock Profiles

Since profiles require actual authenticated users, here's how to create realistic test accounts:

### Method 1: Create Accounts via the App

1. Sign up with test emails:
   - emma@test.com
   - liam@test.com
   - sophia@test.com
   - noah@test.com
   - olivia@test.com

2. For each account, fill out profile with:

**Emma Johnson (25)**
- Bio: "Adventure seeker 🌍 | Coffee addict ☕ | Dog mom 🐕 | Always up for spontaneous road trips!"
- Location: New York, NY
- Occupation: Marketing Manager
- Education: Bachelor's Degree
- Interests: Travel, Fitness, Coffee, Hiking, Photography
- Photos: Upload 3-4 photos
- Videos: Upload 1-2 short videos (optional)

**Liam Chen (27)**
- Bio: "Tech enthusiast 💻 | Fitness junkie 🏋️ | Foodie at heart 🍜 | Let's explore hidden gems in the city"
- Location: Los Angeles, CA
- Occupation: Software Engineer
- Education: Master's Degree
- Interests: Technology, Fitness, Food, Gaming, Music
- Photos: Upload 3-4 photos
- Videos: Upload 1-2 short videos (optional)

**Sophia Martinez (23)**
- Bio: "Artist & dreamer 🎨 | Yoga lover 🧘 | Plant mom 🌿 | Looking for someone to share sunsets with"
- Location: Miami, FL
- Occupation: Graphic Designer
- Education: Bachelor's Degree
- Interests: Art, Yoga, Nature, Reading, Wine
- Photos: Upload 3-4 photos

**Noah Williams (29)**
- Bio: "Entrepreneur 💼 | Travel addict ✈️ | Music festival lover 🎵 | Life is too short for boring conversations"
- Location: Austin, TX
- Occupation: Entrepreneur
- Education: MBA
- Interests: Travel, Music, Entrepreneurship, Concerts, Adventure
- Photos: Upload 3-4 photos
- Videos: Upload 1-2 short videos (optional)

**Olivia Garcia (26)**
- Bio: "Bookworm 📚 | Wine enthusiast 🍷 | Beach lover 🏖️ | Searching for my partner in crime"
- Location: Chicago, IL
- Occupation: Content Writer
- Education: Bachelor's Degree
- Interests: Reading, Wine, Beach, Writing, Brunch
- Photos: Upload 3-4 photos

### Method 2: Use Demo Images

If you don't want to upload photos, use these Unsplash URLs in the profile photos array:

```javascript
// Female profiles
[
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=1000&fit=crop"
]

// Male profiles
[
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=1000&fit=crop"
]
```

### Method 3: Add Stories

After creating profiles, add stories:

1. Go to Discover page
2. Click "Your Story" button
3. Upload a photo or video
4. Add caption like:
   - "Perfect morning vibes ☀️"
   - "Crushing my fitness goals! 💪"
   - "Weekend adventures begin! 🌄"
   - "Coffee and good books 📚☕"

### Testing Features

Once you have multiple accounts:

1. **Matching**: 
   - Log in as Emma
   - Swipe right on Liam
   - Log in as Liam
   - Swipe right on Emma
   - See the match animation!

2. **Messaging**:
   - Send messages between matched users
   - Try sending photos and videos

3. **Super Likes**:
   - Use the blue star button to super like someone
   - They'll get notified!

4. **Stories**:
   - View stories by clicking profile circles
   - Watch them auto-advance after 5 seconds

5. **Gifts**:
   - Send virtual gifts in chats
   - Choose from 21 different gift options

6. **Video Feeds**:
   - Upload videos to profiles
   - Swipe through video feeds TikTok-style

## Sample Profile Questions

Add these to profiles for more personality:

**"My ideal Sunday"**
- "Brunch with friends, then exploring the city or relaxing at a cozy café"
- "Long hike in the mountains followed by a good book and wine"
- "Farmer's market, cooking a big meal, and movie marathon"

**"I'm looking for"**
- "Someone who loves adventure, good conversations, and doesn't take life too seriously"
- "A partner in crime who's up for spontaneous trips and deep talks"
- "Someone authentic who values experiences over things"

**"My love language"**
- "Quality time and acts of service - nothing beats meaningful moments together"
- "Physical touch and words of affirmation - I love giving and receiving affection"
- "Gift giving and quality time - I express love through thoughtful gestures"

## Realistic Interaction Patterns

To make the app feel alive:

1. **Stagger activity**: Have different users online at different times
2. **Vary response times**: Don't respond instantly to every message
3. **Use different features**: Some users focus on stories, others on video feeds
4. **Create variety**: Mix premium and free users, verified and unverified

## Database Stats

The app now has:
- 10 default subscription tier features
- 35 date ideas across 6 categories
- 21 virtual gift options ($0.99 - $29.99)
- Support for unlimited user-generated content

## Next Steps

After adding mock data:
1. Test the discovery algorithm
2. Try the compatibility scoring
3. Experiment with profile boosts
4. Test the rewind feature (premium)
5. Explore all premium features

---

**Pro Tip**: Create accounts with different subscription tiers to test premium features like:
- Unlimited likes
- See who liked you
- Rewind swipes
- Profile boost
- Advanced filters
