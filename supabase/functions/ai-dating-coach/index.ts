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

    const { sessionType, userQuery, userProfile, matchProfile } = await req.json();

    const ONSPACE_AI_API_KEY = Deno.env.get('ONSPACE_AI_API_KEY');
    const ONSPACE_AI_BASE_URL = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!ONSPACE_AI_API_KEY || !ONSPACE_AI_BASE_URL) {
      throw new Error('AI service not configured');
    }

    // Build system prompt based on session type
    let systemPrompt = '';
    
    switch (sessionType) {
      case 'profile_review':
        systemPrompt = `You are an expert dating coach specializing in online dating profiles. Review the user's profile and provide specific, actionable advice to make it more attractive and authentic. Be encouraging but honest. Focus on photos, bio, interests, and overall presentation.`;
        break;
      
      case 'conversation_tips':
        systemPrompt = `You are a dating communication expert. Help the user start or maintain engaging conversations. Provide specific message suggestions based on the match's profile. Be creative, authentic, and avoid generic openers.`;
        break;
      
      case 'date_advice':
        systemPrompt = `You are a relationship expert providing date planning and dating advice. Help users plan memorable dates, handle dating situations, and build meaningful connections. Be practical and considerate of both parties.`;
        break;
      
      case 'general_advice':
        systemPrompt = `You are a supportive dating coach and relationship expert. Provide thoughtful, personalized advice on dating, relationships, and self-improvement. Be empathetic, non-judgmental, and encouraging.`;
        break;
    }

    // Add context to user message
    let contextualQuery = userQuery;
    if (userProfile) {
      contextualQuery += `\n\nMy profile info: Age ${userProfile.age}, ${userProfile.gender}, looking for ${userProfile.looking_for}. Bio: "${userProfile.bio || 'Not set'}". Interests: ${userProfile.interests?.join(', ') || 'None listed'}.`;
    }
    if (matchProfile) {
      contextualQuery += `\n\nMatch info: ${matchProfile.display_name}, age ${matchProfile.age}. Bio: "${matchProfile.bio || 'Not set'}". Interests: ${matchProfile.interests?.join(', ') || 'None listed'}.`;
    }

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
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: contextualQuery
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI service error: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'No response generated';

    return new Response(
      JSON.stringify({ advice: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('AI Dating Coach error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
