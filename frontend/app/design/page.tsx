'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Image, Clock, Sparkles, Palette, Upload, Users, FileImage } from 'lucide-react';

export default function DesignPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin?redirect=/design');
    }
  }, [authLoading, user, router]);

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E91E63]"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-3xl w-full">
        {/* Icon Section */}
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="w-40 h-40 bg-gradient-to-br from-[#E91E63] to-[#F50057] rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <Palette className="w-20 h-20 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-3 shadow-lg animate-bounce">
              <Sparkles className="w-8 h-8 text-[#E91E63]" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Design Studio
        </h1>
        
        {/* Coming Soon Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E91E63] to-[#F50057] text-white px-6 py-2 rounded-full mb-6 shadow-lg">
          <Clock className="w-5 h-5" />
          <span className="text-lg font-semibold">Coming Soon!</span>
        </div>

        {/* Description */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          We're working on bringing you an amazing design experience. Upload and manage your campaign designs, use templates, and collaborate with your team.
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload Designs</h3>
            <p className="text-sm text-gray-600">Upload and manage your campaign designs easily</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileImage className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Templates</h3>
            <p className="text-sm text-gray-600">Choose from professional ad templates</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Collaborate</h3>
            <p className="text-sm text-gray-600">Work together with your team seamlessly</p>
          </div>
        </div>

        {/* Launch Date */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-white rounded-full px-6 py-3 inline-flex border border-gray-200 shadow-sm">
          <Clock className="w-4 h-4" />
          <span>Launching Q2 2025</span>
        </div>
      </div>
    </div>
  );
}
