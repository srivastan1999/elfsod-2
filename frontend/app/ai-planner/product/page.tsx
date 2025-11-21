'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VoiceTextarea from '@/components/common/VoiceTextarea';

export default function ProductServicesPage() {
  const router = useRouter();
  const [productDescription, setProductDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [goal, setGoal] = useState<string | null>(null);

  useEffect(() => {
    // Get goal from localStorage
    const savedGoal = localStorage.getItem('ai-campaign-goal');
    if (!savedGoal) {
      // If no goal, redirect back to goal page
      router.push('/ai-planner/goal');
      return;
    }
    setGoal(savedGoal);

    // Get existing product description if any
    const savedProduct = localStorage.getItem('ai-campaign-product');
    if (savedProduct) {
      setProductDescription(savedProduct);
    }
  }, [router]);

  const handleContinue = async () => {
    if (productDescription.length < 20) {
      return;
    }

    // Save product description
    localStorage.setItem('ai-campaign-product', productDescription);

    // Set default values for other required fields if not present
    const defaultAudience = localStorage.getItem('ai-campaign-audience') || 'General audience';
    const defaultBudget = localStorage.getItem('ai-campaign-budget') || '50000';
    
    if (!localStorage.getItem('ai-campaign-audience')) {
      localStorage.setItem('ai-campaign-audience', defaultAudience);
    }
    if (!localStorage.getItem('ai-campaign-budget')) {
      localStorage.setItem('ai-campaign-budget', defaultBudget);
    }

    // Start analysis
    setIsAnalyzing(true);

    // Prepare campaign data
    const campaignData = {
      goal: goal || '',
      productDescription: productDescription,
      targetAudience: defaultAudience,
      budget: parseInt(defaultBudget),
      startDate: '',
      endDate: ''
    };

    try {
      // Call AI suggestion API
      const response = await fetch('/api/ai-planner/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

      const data = await response.json();

      if (data.success) {
        // Navigate to recommendations with URL params
        const params = new URLSearchParams({
          goal: campaignData.goal,
          product: campaignData.productDescription,
          audience: campaignData.targetAudience,
          budget: campaignData.budget.toString(),
        });
        
        router.push(`/ai-planner/recommendations?${params.toString()}`);
      } else {
        // Still navigate to recommendations, it will handle the error
        const params = new URLSearchParams({
          goal: campaignData.goal,
          product: campaignData.productDescription,
          audience: campaignData.targetAudience,
          budget: campaignData.budget.toString(),
        });
        
        router.push(`/ai-planner/recommendations?${params.toString()}`);
      }
    } catch (error) {
      console.error('Error analyzing campaign:', error);
      // Navigate anyway, recommendations page will handle error
      const params = new URLSearchParams({
        goal: campaignData.goal,
        product: campaignData.productDescription,
        audience: campaignData.targetAudience,
        budget: campaignData.budget.toString(),
      });
      
      router.push(`/ai-planner/recommendations?${params.toString()}`);
    }
  };

  const handleBack = () => {
    router.push('/ai-planner/goal');
  };

  if (isAnalyzing) {
    return (
      <div className="h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Loader2 className="w-16 h-16 text-[#E91E63] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Analyzing Your Campaign...</h2>
          <p className="text-gray-600 mb-2">Our AI is analyzing your campaign goal and product details</p>
          <p className="text-sm text-gray-500">Finding the perfect ad spaces for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E91E63] to-[#F50057] rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Campaign Planner</h1>
                <p className="text-sm text-gray-600">Let AI find the perfect ad spaces for your campaign</p>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#E91E63] to-[#F50057] transition-all duration-500"
                style={{ width: '66%' }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 min-w-[80px] text-right">
              Step 2 of 2
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Tell us about your product or service
              </h2>
              <p className="text-gray-600">Describe what you're promoting in detail. Our AI will analyze this and find the perfect ad spaces for you.</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <VoiceTextarea
                value={productDescription}
                onChange={setProductDescription}
                placeholder="E.g., We're launching a new eco-friendly water bottle that keeps drinks cold for 24 hours. It's made from recycled materials and comes in 5 vibrant colors... Or click the microphone icon to speak your description."
                className="h-64"
                rows={10}
                minLength={20}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-500">Minimum 20 characters • Click mic icon for voice input</span>
                <span className={`text-sm font-medium ${productDescription.length >= 20 ? 'text-[#4CAF50]' : 'text-gray-400'}`}>
                  {productDescription.length} characters
                </span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 Tip:</span> The more details you provide, the better our AI can match your product with the perfect ad spaces. Include information about your target market, unique selling points, and campaign objectives.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white border-t border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={productDescription.length < 20}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                productDescription.length >= 20
                  ? 'bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              Analyze & Get Recommendations
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

