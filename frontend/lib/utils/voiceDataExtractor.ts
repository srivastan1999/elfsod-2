/**
 * Extract structured data from voice transcript
 */

export interface ExtractedData {
  productDescription?: string;
  targetAudience?: string;
  ageRange?: string;
  incomeLevel?: string;
  budget?: number;
  goal?: string;
}

export function extractDataFromSpeech(transcript: string, currentStep: number): ExtractedData {
  const lowerTranscript = transcript.toLowerCase();
  const data: ExtractedData = {};

  // Extract goal (Step 1)
  if (currentStep === 1) {
    if (lowerTranscript.includes('brand awareness') || lowerTranscript.includes('awareness')) {
      data.goal = 'brand_awareness';
    } else if (lowerTranscript.includes('engagement') || lowerTranscript.includes('interaction')) {
      data.goal = 'engagement';
    } else if (lowerTranscript.includes('conversion') || lowerTranscript.includes('sales') || lowerTranscript.includes('leads')) {
      data.goal = 'conversions';
    } else if (lowerTranscript.includes('traffic') || lowerTranscript.includes('visits') || lowerTranscript.includes('website')) {
      data.goal = 'traffic';
    }
  }

  // Extract product description (Step 2)
  if (currentStep === 2) {
    data.productDescription = transcript;
  }

  // Extract audience info (Step 3)
  if (currentStep === 3) {
    data.targetAudience = transcript;
    
    // Extract age range
    if (lowerTranscript.includes('18') || lowerTranscript.includes('twenty') || lowerTranscript.includes('teen')) {
      data.ageRange = '18-24';
    } else if (lowerTranscript.includes('25') || lowerTranscript.includes('thirty')) {
      data.ageRange = '25-34';
    } else if (lowerTranscript.includes('35') || lowerTranscript.includes('forty')) {
      data.ageRange = '35-44';
    } else if (lowerTranscript.includes('45') || lowerTranscript.includes('fifty') || lowerTranscript.includes('older')) {
      data.ageRange = '45+';
    }
    
    // Extract income level
    if (lowerTranscript.includes('lower') || lowerTranscript.includes('low income')) {
      data.incomeLevel = 'Lower';
    } else if (lowerTranscript.includes('middle') || lowerTranscript.includes('average')) {
      data.incomeLevel = 'Middle';
    } else if (lowerTranscript.includes('upper middle') || lowerTranscript.includes('upper-middle')) {
      data.incomeLevel = 'Upper Middle';
    } else if (lowerTranscript.includes('high') || lowerTranscript.includes('affluent') || lowerTranscript.includes('wealthy')) {
      data.incomeLevel = 'High';
    }
  }

  // Extract budget (Step 4)
  if (currentStep === 4) {
    // Extract numbers from transcript (rupees, lakhs, crores)
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
    } else {
      // Try to extract just numbers
      const simpleNumber = transcript.match(/\d+(?:,\d+)*(?:\.\d+)?/);
      if (simpleNumber) {
        data.budget = parseFloat(simpleNumber[0].replace(/,/g, ''));
      }
    }
  }

  return data;
}

export function generateResponse(transcript: string, currentStep: number, extractedData: ExtractedData): string {
  const lowerTranscript = transcript.toLowerCase();
  
  switch (currentStep) {
    case 1:
      if (extractedData.goal) {
        const goalNames: Record<string, string> = {
          'brand_awareness': 'Brand Awareness',
          'engagement': 'Engagement',
          'conversions': 'Conversions',
          'traffic': 'Traffic'
        };
        return `Perfect! I've selected ${goalNames[extractedData.goal]} as your campaign goal. That's a great choice! Let's move to the next step.`;
      }
      return "I understand. Could you please select one of the goal options: Brand Awareness, Engagement, Conversions, or Traffic?";
    
    case 2:
      if (extractedData.productDescription && transcript.length > 20) {
        return `Excellent! I've captured your product description. ${transcript.length > 50 ? "That sounds really interesting!" : "Tell me more about it if you'd like."} Ready to move forward?`;
      }
      return "I heard that, but could you provide a bit more detail? Please describe your product or service in more detail (at least 20 characters).";
    
    case 3:
      let response = "Great! I've noted your target audience information.";
      if (extractedData.ageRange) {
        response += ` Age range: ${extractedData.ageRange}.`;
      }
      if (extractedData.incomeLevel) {
        response += ` Income level: ${extractedData.incomeLevel}.`;
      }
      if (transcript.length > 10) {
        response += " This gives me a clear picture of your ideal customers. Let's continue!";
      } else {
        response += " Could you tell me a bit more about your target audience?";
      }
      return response;
    
    case 4:
      if (extractedData.budget) {
        return `Perfect! I've set your budget to ₹${extractedData.budget.toLocaleString('en-IN')}. That's a good budget for your campaign. Let's proceed!`;
      }
      return "I heard that, but could you tell me the specific budget amount? For example, you can say 'fifty thousand rupees' or 'one lakh rupees'.";
    
    case 5:
      return "Got it! I've noted your campaign dates. Let's review everything before we generate your plan.";
    
    default:
      return "Thank you for that information. I've saved it.";
  }
}

