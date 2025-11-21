import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let transcript = '';
  let currentStep = 1;
  let context = {};
  
  try {
    const body = await request.json();
    transcript = body.transcript || '';
    currentStep = body.currentStep || 1;
    context = body.context || {};
  } catch (e) {
    return NextResponse.json({
      extractedData: {},
      aiResponse: "I didn't catch that. Could you repeat?",
      shouldContinue: false
    }, { status: 400 });
  }
  
  try {

    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      // Fallback to simple extraction
      return NextResponse.json({
        extractedData: extractSimpleData(transcript, currentStep),
        aiResponse: generateSimpleResponse(transcript, currentStep),
        shouldContinue: false
      });
    }

    const stepContext = getStepContext(currentStep, context);
    
    const prompt = `You are a helpful AI assistant helping a user fill out a campaign planning form. The user just spoke: "${transcript}"

Current step: ${currentStep}
${stepContext}

Your task:
1. Extract relevant information from what the user said
2. Generate a friendly, conversational response acknowledging what they said
3. Determine if we have enough information to proceed

For step ${currentStep}, extract:
${getExtractionInstructions(currentStep)}

Respond in JSON format:
{
  "extractedData": {
    "goal": "brand_awareness|engagement|conversions|traffic" (only for step 1),
    "productDescription": "full description" (only for step 2),
    "targetAudience": "audience description" (only for step 3),
    "ageRange": "18-24|25-34|35-44|45+" (only for step 3),
    "incomeLevel": "Lower|Middle|Upper Middle|High" (only for step 3),
    "budget": number in rupees (only for step 4)
  },
  "aiResponse": "friendly conversational response acknowledging what they said and confirming the data",
  "shouldContinue": true/false (true if we have enough info to move forward)
}

Only include fields relevant to the current step. Be conversational and friendly like ChatGPT.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant like ChatGPT. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    
    return NextResponse.json({
      extractedData: parsed.extractedData || {},
      aiResponse: parsed.aiResponse || "Thank you for that information!",
      shouldContinue: parsed.shouldContinue || false
    });
  } catch (error) {
    console.error('AI processing error:', error);
    // Fallback to simple extraction
    return NextResponse.json({
      extractedData: extractSimpleData(transcript, currentStep),
      aiResponse: generateSimpleResponse(transcript, currentStep),
      shouldContinue: false
    });
  }
}

function getStepContext(currentStep: number, context: any): string {
  switch (currentStep) {
    case 1:
      return 'User needs to select a campaign goal: Brand Awareness, Engagement, Conversions, or Traffic.';
    case 2:
      return `User needs to describe their product or service. ${context?.productDescription ? 'Previous description: ' + context.productDescription : ''}`;
    case 3:
      return `User needs to describe their target audience, age range, and income level. ${context?.targetAudience ? 'Previous: ' + context.targetAudience : ''}`;
    case 4:
      return `User needs to specify their budget in Indian Rupees. ${context?.budget ? 'Current budget: ₹' + context.budget : ''}`;
    case 5:
      return 'User needs to select campaign dates.';
    default:
      return 'Review step.';
  }
}

function getExtractionInstructions(currentStep: number): string {
  switch (currentStep) {
    case 1:
      return '- goal: one of "brand_awareness", "engagement", "conversions", or "traffic"';
    case 2:
      return '- productDescription: full description of the product or service';
    case 3:
      return '- targetAudience: description of ideal customers\n- ageRange: "18-24", "25-34", "35-44", or "45+"\n- incomeLevel: "Lower", "Middle", "Upper Middle", or "High"';
    case 4:
      return '- budget: numeric value in Indian Rupees (convert lakhs/crores to rupees)';
    default:
      return 'No specific extraction needed.';
  }
}

function extractSimpleData(transcript: string, currentStep: number): any {
  const lowerTranscript = transcript.toLowerCase();
  const data: any = {};

  if (currentStep === 1) {
    if (lowerTranscript.includes('brand awareness') || lowerTranscript.includes('awareness')) {
      data.goal = 'brand_awareness';
    } else if (lowerTranscript.includes('engagement')) {
      data.goal = 'engagement';
    } else if (lowerTranscript.includes('conversion') || lowerTranscript.includes('sales')) {
      data.goal = 'conversions';
    } else if (lowerTranscript.includes('traffic') || lowerTranscript.includes('visits')) {
      data.goal = 'traffic';
    }
  } else if (currentStep === 2) {
    data.productDescription = transcript;
  } else if (currentStep === 3) {
    data.targetAudience = transcript;
    if (lowerTranscript.includes('25') || lowerTranscript.includes('thirty')) {
      data.ageRange = '25-34';
    } else if (lowerTranscript.includes('35') || lowerTranscript.includes('forty')) {
      data.ageRange = '35-44';
    } else if (lowerTranscript.includes('45') || lowerTranscript.includes('fifty')) {
      data.ageRange = '45+';
    }
    if (lowerTranscript.includes('middle')) {
      data.incomeLevel = 'Middle';
    } else if (lowerTranscript.includes('high')) {
      data.incomeLevel = 'High';
    } else if (lowerTranscript.includes('lower')) {
      data.incomeLevel = 'Lower';
    }
  } else if (currentStep === 4) {
    const numberMatch = transcript.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lakhs|l|cr|crore|crores|thousand|k)?/i);
    if (numberMatch) {
      let amount = parseFloat(numberMatch[1].replace(/,/g, ''));
      const unit = numberMatch[2]?.toLowerCase();
      if (unit === 'lakh' || unit === 'lakhs' || unit === 'l') {
        amount = amount * 100000;
      } else if (unit === 'crore' || unit === 'crores' || unit === 'cr') {
        amount = amount * 10000000;
      } else if (unit === 'thousand' || unit === 'k') {
        amount = amount * 1000;
      }
      data.budget = Math.round(amount);
    }
  }

  return data;
}

function generateSimpleResponse(transcript: string, currentStep: number): string {
  switch (currentStep) {
    case 1:
      return "I understand. Could you please select one of the goal options?";
    case 2:
      return transcript.length > 20 
        ? "Great! I've captured your product description. Let's continue!"
        : "Could you provide a bit more detail about your product?";
    case 3:
      return "Perfect! I've noted your target audience information. This helps me understand your customers better.";
    case 4:
      return "Got it! I've set your budget. Let's proceed!";
    default:
      return "Thank you for that information!";
  }
}

