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

    const { photoUrl } = await req.json();

    const ONSPACE_AI_API_KEY = Deno.env.get('ONSPACE_AI_API_KEY');
    const ONSPACE_AI_BASE_URL = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!ONSPACE_AI_API_KEY || !ONSPACE_AI_BASE_URL) {
      throw new Error('AI service not configured');
    }

    const prompt = `Analyze this dating profile photo and provide feedback. Rate it on:
1. Quality (lighting, clarity, composition) - score 0-100
2. Dating appeal (attractiveness, approachability) - score 0-100
3. Provide 3-5 specific improvement suggestions

Return ONLY a JSON object in this exact format:
{
  "quality_score": 85,
  "attractiveness_score": 90,
  "suggestions": [
    "Good natural lighting - keep using outdoor photos",
    "Smile is warm and genuine - great for first impression",
    "Consider adding variety - try a photo doing an activity",
    "Background could be less cluttered",
    "Crop tighter to focus on your face"
  ]
}`;

    // Call OnSpace AI with vision
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
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: { url: photoUrl }
              }
            ]
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI service error: ${errorText}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiResponse = jsonMatch[0];
    }
    
    const analysis = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('AI Photo Analyzer error:', error);
    return new Response(
      JSON.stringify({ 
        quality_score: 70,
        attractiveness_score: 70,
        suggestions: ['Unable to analyze photo - please try again']
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
