'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Sparkles, MapPin, DollarSign, Users, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatINR, formatINRFull, formatIndianNumber } from '@/lib/utils/currency';

interface AdSpaceSuggestion {
  id: string;
  title: string;
  description: string;
  category: { name: string; description?: string } | null;
  location: { city: string; state: string; address?: string } | null;
  display_type: string;
  price_per_day: number;
  price_per_month: number;
  daily_impressions: number;
  images?: string[];
  matchScore: number;
  reasoning: string;
  estimatedReach: number;
  estimatedCost: number;
}

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<AdSpaceSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<'ai-powered' | 'rule-based'>('rule-based');

  useEffect(() => {
    // Get campaign data from URL params or localStorage
    const campaignData = {
      goal: searchParams.get('goal') || localStorage.getItem('ai-campaign-goal') || '',
      productDescription: searchParams.get('product') || localStorage.getItem('ai-campaign-product') || '',
      targetAudience: searchParams.get('audience') || localStorage.getItem('ai-campaign-audience') || '',
      budget: parseInt(searchParams.get('budget') || localStorage.getItem('ai-campaign-budget') || '50000'),
      startDate: searchParams.get('startDate') || localStorage.getItem('ai-campaign-startDate') || '',
      endDate: searchParams.get('endDate') || localStorage.getItem('ai-campaign-endDate') || ''
    };

    if (!campaignData.goal || !campaignData.productDescription) {
      setError('Missing campaign data. Please start over.');
      setLoading(false);
      return;
    }

    // Call AI suggestion API
    fetch('/api/ai-planner/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuggestions(data.suggestions || []);
          setMethod(data.method || 'rule-based');
        } else {
          setError(data.error || 'Failed to get suggestions');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching suggestions:', err);
        setError('Failed to load recommendations. Please try again.');
        setLoading(false);
      });
  }, [searchParams]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Consider';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#E91E63] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Campaign...</h2>
          <p className="text-gray-600">Our AI is finding the perfect ad spaces for you</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Recommendations</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/ai-planner/goal')}
            className="px-6 py-3 bg-[#E91E63] text-white rounded-lg font-medium hover:bg-[#F50057] transition-colors"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/ai-planner/goal')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E91E63] to-[#F50057] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
                  <p className="text-sm text-gray-600">
                    {method === 'ai-powered' ? 'Powered by AI' : 'Rule-based matching'}
                    {suggestions.length > 0 && ` • ${suggestions.length} suggestions`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {suggestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Recommendations Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find ad spaces matching your requirements.</p>
            <button
              onClick={() => router.push('/ai-planner/goal')}
              className="px-6 py-3 bg-[#E91E63] text-white rounded-lg font-medium hover:bg-[#F50057] transition-colors"
            >
              Adjust Your Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {suggestions.map((space, index) => (
              <div
                key={space.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#E91E63] to-[#F50057] text-white rounded-lg font-bold text-sm">
                          #{index + 1}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{space.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{space.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {space.category && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Category:</span>
                            {space.category.name}
                          </span>
                        )}
                        {space.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {space.location.city}, {space.location.state}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Type:</span>
                          {space.display_type}
                        </span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border ${getScoreColor(space.matchScore)}`}>
                      <div className="text-xs font-medium mb-1">{getScoreLabel(space.matchScore)}</div>
                      <div className="text-2xl font-bold">{space.matchScore}</div>
                      <div className="text-xs opacity-75">Match Score</div>
                    </div>
                  </div>

                  {/* AI Reasoning */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Why This Works</h4>
                        <p className="text-sm text-blue-800">{space.reasoning}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Price/Day</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatINR(space.price_per_day)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">Daily Reach</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatIndianNumber(space.daily_impressions)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Est. Total Reach</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatIndianNumber(space.estimatedReach)}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Est. Total Cost</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatINR(space.estimatedCost)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/ad-space/${space.id}`}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-center"
                    >
                      View Details
                    </Link>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#E91E63] animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Recommendations...</h2>
            <p className="text-gray-600">Preparing your personalized ad space suggestions</p>
          </div>
        </div>
      }
    >
      <RecommendationsContent />
    </Suspense>
  );
}

