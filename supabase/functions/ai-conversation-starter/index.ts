import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { matchProfile, userProfile } = await req.json();

    const ONSPACE_AI_API_KEY = Deno.env.get('ONSPACE_AI_API_KEY');
    const ONSPACE_AI_BASE_URL = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!ONSPACE_AI_API_KEY || !ONSPACE_AI_BASE_URL) {
      throw new Error('AI service not configured');
    }

    // Build personalized prompt
    const prompt = `Generate 3 creative, personalized conversation starters for a dating app match. Make them fun, authentic, and based on the match's profile.

Match Profile:
- Name: ${matchProfile.display_name}
- Age: ${matchProfile.age}
- Bio: ${matchProfile.bio || 'No bio provided'}
- Interests: ${matchProfile.interests?.join(', ') || 'No interests listed'}
${matchProfile.occupation ? `- Occupation: ${matchProfile.occupation}` : ''}

User Profile:
- Age: ${userProfile.age}
- Interests: ${userProfile.interests?.join(', ') || 'No interests listed'}

Requirements:
1. Make them specific to their profile (reference their interests, bio, or occupation)
2. Keep them light, friendly, and fun
3. Avoid generic openers like "Hey, how are you?"
4. Make them easy to respond to (ask questions or make interesting statements)
5. Each should be 1-2 sentences max

Return ONLY a JSON array of 3 strings, like: ["starter 1", "starter 2", "starter 3"]`;

    // Call OnSpace AI
    const response = await fetch(`${ONSPACE_AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ONSPACE_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI service error: ${errorText}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0]?.message?.content || '[]';
    
    // Extract JSON array from response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      aiResponse = jsonMatch[0];
    }
    
    const starters = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify({ starters }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('AI Conversation Starter error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
