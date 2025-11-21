'use client';

import { useState } from 'react';
import { ArrowRight, Megaphone, Users, ShoppingCart, ArrowRight as Traffic, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Goal = 'brand_awareness' | 'engagement' | 'conversions' | 'traffic' | null;

const goals = [
  { 
    id: 'brand_awareness' as const, 
    icon: Megaphone, 
    title: 'Brand Awareness', 
    description: 'Increase brand visibility',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    id: 'engagement' as const, 
    icon: Users, 
    title: 'Engagement', 
    description: 'Drive audience interaction',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    id: 'conversions' as const, 
    icon: ShoppingCart, 
    title: 'Conversions', 
    description: 'Generate sales & leads',
    color: 'from-green-500 to-green-600'
  },
  { 
    id: 'traffic' as const, 
    icon: Traffic, 
    title: 'Traffic', 
    description: 'Drive website/store visits',
    color: 'from-pink-500 to-pink-600'
  },
];

export default function CampaignGoalPage() {
  const router = useRouter();
  const [selectedGoal, setSelectedGoal] = useState<Goal>(null);

  const handleContinue = () => {
    if (selectedGoal) {
      // Save to localStorage
      localStorage.setItem('ai-campaign-goal', selectedGoal);
      // Navigate to product page
      router.push('/ai-planner/product');
    }
  };

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
                style={{ width: '33%' }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 min-w-[80px] text-right">
              Step 1 of 2
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                What's your campaign goal?
              </h2>
              <p className="text-gray-600">Choose the primary objective for your campaign</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {goals.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoal === goal.id;
                return (
                  <button
                    key={goal.id}
                    onClick={() => {
                      setSelectedGoal(goal.id);
                    }}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-[#E91E63] bg-[#E91E63]/5 scale-[1.02]'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-1 text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                    {isSelected && (
                      <div className="mt-4 flex items-center justify-center gap-2 text-[#E91E63]">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="bg-white border-t border-gray-200 px-8 py-4">
          <div className="flex items-center justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedGoal}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                selectedGoal
                  ? 'bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

