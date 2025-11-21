/**
 * Voice Assistant Utilities
 * Text-to-Speech and Voice Interaction
 */

export function speakText(text: string, options?: { rate?: number; pitch?: number; volume?: number }): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis is not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-IN'; // Indian English
    utterance.rate = options?.rate || 0.95; // Slightly slower for natural conversation
    utterance.pitch = options?.pitch || 1.1; // Slightly higher pitch for friendliness
    utterance.volume = options?.volume || 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);

    window.speechSynthesis.speak(utterance);
  });
}

// Speak with pauses for natural conversation
export async function speakConversationally(text: string): Promise<void> {
  // Split text by sentences for natural pauses
  const sentences = text.split(/([.!?]+\s+)/).filter(s => s.trim().length > 0);
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 0) {
      await speakText(sentence, { rate: 0.95, pitch: 1.1 });
      // Small pause between sentences for natural flow
      if (i < sentences.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

// Conversational questions for each step
export const stepQuestions = {
  1: "Hi! I'm here to help you create the perfect ad campaign. First, let's start with your goal. What are you trying to achieve? Are you looking to build brand awareness, drive engagement, increase conversions, or bring more traffic? Just select one that matches your objective.",
  2: "Great choice! Now, tell me about what you're promoting. What's your product or service? I'd love to hear the details - what makes it special, who it's for, and what you want people to know about it. Feel free to describe it in your own words, or use the microphone to speak your description.",
  3: "Perfect! Now, let's talk about your audience. Who are you trying to reach? Tell me about your ideal customers - what age group are they in? What's their income level? What are their interests? The more details you share, the better I can help you find the right ad spaces. You can type your answer or use the microphone to speak.",
  4: "Excellent! Now, let's talk budget. How much are you planning to invest in this campaign? You can adjust the slider or enter a specific amount. Don't worry, I'll help you get the best value for your investment.",
  5: "Almost there! When do you want to launch this campaign? Pick your start date, and if you have an end date in mind, you can add that too. This helps me find ad spaces that are available during your campaign period.",
  6: "Perfect! Let's review everything we've discussed. Take a moment to check all your details. If everything looks good, click Generate Plan and I'll find the best ad spaces for your campaign!"
};

// Follow-up prompts for better interaction
export const followUpPrompts = {
  goalSelected: "Nice! That's a great goal. Let's move forward.",
  productEntered: "Sounds interesting! I'm getting a good picture of what you're offering.",
  audienceEntered: "Perfect! I understand your target audience now.",
  budgetSet: "Good budget! I'll make sure to find options that fit within this range.",
  datesSelected: "Great timing! Let me find the best ad spaces for your campaign period."
};

