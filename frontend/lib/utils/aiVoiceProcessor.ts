/**
 * AI-Powered Voice Processing
 * Uses Groq API to understand speech and extract data intelligently
 */

export interface ExtractedData {
  productDescription?: string;
  targetAudience?: string;
  ageRange?: string;
  incomeLevel?: string;
  budget?: number;
  goal?: string;
  confidence?: number;
}

export interface VoiceResponse {
  extractedData: ExtractedData;
  aiResponse: string;
  shouldContinue?: boolean;
}

export async function processVoiceWithAI(
  transcript: string,
  currentStep: number,
  context: {
    goal?: string;
    productDescription?: string;
    targetAudience?: string;
    budget?: number;
  }
): Promise<VoiceResponse> {
  try {
    // Call our API route (server-side processing)
    const response = await fetch('/api/ai-voice/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transcript,
        currentStep,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      extractedData: data.extractedData || {},
      aiResponse: data.aiResponse || "Thank you for that information!",
      shouldContinue: data.shouldContinue || false
    };
  } catch (error) {
    console.error('AI processing error:', error);
    // Fallback to simple extraction
    return {
      extractedData: extractSimpleData(transcript, currentStep),
      aiResponse: generateSimpleResponse(transcript, currentStep),
      shouldContinue: false
    };
  }
}

function getStepContext(currentStep: number, context: any): string {
  switch (currentStep) {
    case 1:
      return 'User needs to select a campaign goal: Brand Awareness, Engagement, Conversions, or Traffic.';
    case 2:
      return `User needs to describe their product or service. ${context.productDescription ? 'Previous description: ' + context.productDescription : ''}`;
    case 3:
      return `User needs to describe their target audience, age range, and income level. ${context.targetAudience ? 'Previous: ' + context.targetAudience : ''}`;
    case 4:
      return `User needs to specify their budget in Indian Rupees. ${context.budget ? 'Current budget: ₹' + context.budget : ''}`;
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

function extractSimpleData(transcript: string, currentStep: number): ExtractedData {
  const lowerTranscript = transcript.toLowerCase();
  const data: ExtractedData = {};

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

