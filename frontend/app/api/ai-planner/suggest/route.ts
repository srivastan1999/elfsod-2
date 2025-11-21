import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CampaignData {
  goal: 'brand_awareness' | 'engagement' | 'conversions' | 'traffic';
  productDescription: string;
  targetAudience: string;
  budget: number;
  startDate: string;
  endDate?: string;
}

interface AdSpace {
  id: string;
  title: string;
  description: string;
  category: { name: string; description?: string } | null;
  location: { city: string; state: string; address?: string } | null;
  display_type: string;
  price_per_day: number;
  price_per_month: number;
  daily_impressions: number;
  availability_status: string;
  images?: string[];
  route?: any;
}

export async function POST(request: NextRequest) {
  try {
    const campaignData: CampaignData = await request.json();

    // Validate campaign data
    if (!campaignData.goal || !campaignData.productDescription || !campaignData.targetAudience || !campaignData.budget) {
      return NextResponse.json({
        success: false,
        error: 'Missing required campaign data'
      }, { status: 400 });
    }

    // Fetch all available ad spaces
    let supabase;
    try {
      supabase = await createClient();
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError);
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to database'
      }, { status: 500 });
    }

    const { data: adSpaces, error: fetchError } = await supabase
      .from('ad_spaces')
      .select(`
        id,
        title,
        description,
        category:categories(id, name, description),
        location:locations(id, city, state, address),
        display_type,
        price_per_day,
        price_per_month,
        daily_impressions,
        availability_status,
        images,
        route
      `)
      .eq('availability_status', 'available')
      .limit(100);

    if (fetchError) {
      console.error('❌ Error fetching ad spaces:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch ad spaces',
        details: fetchError.message
      }, { status: 500 });
    }

    if (!adSpaces || adSpaces.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'No available ad spaces found'
      });
    }

    // Transform ad spaces to match AdSpace interface
    // Supabase returns category and location as arrays due to joins, but we need single objects
    const transformedAdSpaces: AdSpace[] = adSpaces.map((space: any) => {
      // Extract first category from array (Supabase join returns array)
      const categoryData = Array.isArray(space.category) ? space.category[0] : space.category;
      // Extract first location from array (Supabase join returns array)
      const locationData = Array.isArray(space.location) ? space.location[0] : space.location;

      return {
        id: space.id,
        title: space.title,
        description: space.description,
        category: categoryData ? {
          name: categoryData.name || '',
          description: categoryData.description
        } : null,
        location: locationData ? {
          city: locationData.city || '',
          state: locationData.state || '',
          address: locationData.address
        } : null,
        display_type: space.display_type,
        price_per_day: space.price_per_day,
        price_per_month: space.price_per_month,
        daily_impressions: space.daily_impressions || 0,
        availability_status: space.availability_status,
        images: space.images,
        route: space.route
      };
    });

    // Prepare ad spaces data for AI
    const adSpacesForAI = transformedAdSpaces.map((space) => ({
      id: space.id,
      title: space.title,
      description: space.description,
      category: space.category?.name || 'Unknown',
      location: space.location ? `${space.location.city}, ${space.location.state}` : 'Unknown',
      displayType: space.display_type,
      pricePerDay: space.price_per_day,
      pricePerMonth: space.price_per_month,
      dailyImpressions: space.daily_impressions || 0,
      isMovable: !!space.route
    }));

    // Check if Groq API key is configured (free API)
    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      // Fallback: Use rule-based matching if Groq is not configured
      console.log('⚠️ GROQ_API_KEY not configured, using rule-based matching');
      return NextResponse.json({
        success: true,
        suggestions: getRuleBasedSuggestions(campaignData, transformedAdSpaces),
        method: 'rule-based'
      });
    }

    // Call Groq API (free tier)
    try {
      const suggestions = await getAISuggestions(campaignData, adSpacesForAI, groqApiKey);
      return NextResponse.json({
        success: true,
        suggestions,
        method: 'ai-powered'
      });
    } catch (aiError) {
      console.error('❌ Groq API error:', aiError);
      // Fallback to rule-based matching
      return NextResponse.json({
        success: true,
        suggestions: getRuleBasedSuggestions(campaignData, transformedAdSpaces),
        method: 'rule-based',
        aiError: aiError instanceof Error ? aiError.message : String(aiError)
      });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

async function getAISuggestions(
  campaignData: CampaignData,
  adSpaces: any[],
  apiKey: string
): Promise<any[]> {
  const goalDescriptions: Record<string, string> = {
    brand_awareness: 'Increase brand visibility and recognition',
    engagement: 'Drive audience interaction and engagement',
    conversions: 'Generate sales and leads',
    traffic: 'Drive website or store visits'
  };

  // Calculate campaign duration in days
  const startDate = new Date(campaignData.startDate);
  const endDate = campaignData.endDate ? new Date(campaignData.endDate) : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const daysInCampaign = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format currency in Indian Rupees
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const prompt = `You are an expert advertising strategist working in India. Analyze the following campaign requirements and suggest the best ad spaces from the available options. All prices are in Indian Rupees (₹).

CAMPAIGN REQUIREMENTS:
- Goal: ${goalDescriptions[campaignData.goal]} (${campaignData.goal})
- Product/Service: ${campaignData.productDescription}
- Target Audience: ${campaignData.targetAudience}
- Budget: ${formatCurrency(campaignData.budget)} (Indian Rupees)
- Duration: ${daysInCampaign} days (${campaignData.startDate}${campaignData.endDate ? ` to ${campaignData.endDate}` : ''})

AVAILABLE AD SPACES:
${adSpaces.map((space, idx) => `
${idx + 1}. ${space.title}
   - Category: ${space.category}
   - Location: ${space.location}
   - Display Type: ${space.displayType}
   - Price/Day: ${formatCurrency(space.pricePerDay)}
   - Price/Month: ${formatCurrency(space.pricePerMonth)}
   - Daily Impressions: ${space.dailyImpressions.toLocaleString('en-IN')}
   - Description: ${space.description}
   - ID: ${space.id}
`).join('\n')}

TASK:
Analyze each ad space and rank them by how well they match the campaign requirements. Consider:
1. Relevance to target audience
2. Alignment with campaign goal
3. Budget efficiency (total cost should fit within budget in Indian Rupees)
4. Location and reach potential
5. Display type effectiveness

Calculate for each ad space:
- estimatedReach: daily_impressions × ${daysInCampaign} days
- estimatedCost: price_per_day × ${daysInCampaign} days (in Indian Rupees)

Return a JSON array of the top 10 most suitable ad spaces, each with:
- id: The ad space ID
- matchScore: A score from 0-100 indicating how well it matches
- reasoning: A brief explanation (2-3 sentences) of why this ad space is recommended
- estimatedReach: Estimated total impressions for the campaign duration
- estimatedCost: Estimated total cost for the campaign duration (in Indian Rupees)

Format your response as valid JSON only, no markdown or additional text. Example format:
[{"id":"...","matchScore":85,"reasoning":"...","estimatedReach":150000,"estimatedCost":30000}]`;

  // Use Groq API (free tier) - fast and free
  // Available models: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Latest 70B model on Groq (replacement for decommissioned llama-3.1-70b-versatile)
      // Alternative models if this doesn't work: 'llama-3.1-8b-instant' (faster) or 'mixtral-8x7b-32768'
      messages: [
        {
          role: 'system',
          content: 'You are an expert advertising strategist. Always respond with valid JSON only, no markdown formatting, no code blocks, just the JSON array.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from Groq API');
  }

  // Parse JSON from response (handle markdown code blocks if present)
  let suggestions;
  try {
    // Try to parse as direct JSON first
    const parsed = JSON.parse(content);
    
    // Handle if response is wrapped in an object with a suggestions/result key
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      suggestions = parsed.suggestions;
    } else if (parsed.result && Array.isArray(parsed.result)) {
      suggestions = parsed.result;
    } else if (Array.isArray(parsed)) {
      suggestions = parsed;
    } else {
      // Try to extract array from text
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No array found in response');
      }
    }
  } catch (parseError) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Invalid JSON response from AI');
  }

  // Enrich suggestions with full ad space data
  return suggestions.map((suggestion: any) => {
    const fullSpace = adSpaces.find(s => s.id === suggestion.id);
    if (!fullSpace) return null;
    
    // Calculate actual estimated values if not provided
    const estimatedReach = suggestion.estimatedReach || (fullSpace.dailyImpressions * daysInCampaign);
    const estimatedCost = suggestion.estimatedCost || (fullSpace.pricePerDay * daysInCampaign);
    
    return {
      ...fullSpace,
      matchScore: suggestion.matchScore || 0,
      reasoning: suggestion.reasoning || 'Recommended based on campaign requirements',
      estimatedReach: estimatedReach,
      estimatedCost: estimatedCost
    };
  }).filter(Boolean); // Remove null entries
}

function getRuleBasedSuggestions(
  campaignData: CampaignData,
  adSpaces: AdSpace[]
): any[] {
  // Simple rule-based matching as fallback
  const suggestions = adSpaces
    .map(space => {
      let score = 50; // Base score

      // Budget matching (prefer spaces within budget)
      const daysInCampaign = campaignData.endDate && campaignData.startDate
        ? Math.ceil((new Date(campaignData.endDate).getTime() - new Date(campaignData.startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 30; // Default to 30 days

      const estimatedCost = space.price_per_day * daysInCampaign;
      if (estimatedCost <= campaignData.budget) {
        score += 20; // Within budget
      } else if (estimatedCost <= campaignData.budget * 1.2) {
        score += 10; // Slightly over but close
      } else {
        score -= 20; // Too expensive
      }

      // Goal-based scoring
      if (campaignData.goal === 'brand_awareness' && space.daily_impressions > 1000) {
        score += 15; // High impressions for brand awareness
      }
      if (campaignData.goal === 'conversions' && space.category?.name?.toLowerCase().includes('retail')) {
        score += 15; // Retail spaces for conversions
      }
      if (campaignData.goal === 'traffic' && space.location?.city) {
        score += 10; // Location-based for traffic
      }

      // Category relevance (simple keyword matching)
      const productLower = campaignData.productDescription.toLowerCase();
      const categoryLower = space.category?.name?.toLowerCase() || '';
      if (productLower.includes('food') && categoryLower.includes('restaurant')) {
        score += 20;
      }
      if (productLower.includes('retail') && categoryLower.includes('retail')) {
        score += 20;
      }

      return {
        ...space,
        matchScore: Math.min(100, Math.max(0, score)),
        reasoning: `Recommended based on budget fit and campaign goal alignment. ${space.category?.name ? `Category: ${space.category.name}` : ''} All prices are in Indian Rupees (₹).`,
        estimatedReach: space.daily_impressions * daysInCampaign,
        estimatedCost: estimatedCost
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);

  return suggestions;
}

