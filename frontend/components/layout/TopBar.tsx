'use client';

import { useState } from 'react';
import { Bell, User, MapPin, Calendar, ChevronDown, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { useLocationStore } from '@/store/useLocationStore';
import { useCampaignDatesStore } from '@/store/useCampaignDatesStore';
import LocationDateModal from '@/components/common/LocationDateModal';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function TopBar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'location' | 'dates'>('location');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { selectedCity } = useLocationStore();
  const { startDate, endDate } = useCampaignDatesStore();
  const { user, supabaseUser, signOut, isAdmin, loading } = useAuth();
  const router = useRouter();

  const formatDateRange = () => {
    if (!startDate || !endDate) return 'Select dates';
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  const handleSearch = () => {
    router.push('/search');
  };

  const openModal = (tab: 'location' | 'dates') => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="h-24 bg-white border-b border-gray-200 flex items-center justify-center px-6 relative z-50">
        {/* Airbnb-style Search Bar - Centered, 40% width */}
        <div className="w-[40%] flex items-center justify-between gap-4 px-8 py-5 rounded-2xl border-2 border-gray-300 shadow-md hover:shadow-xl hover:border-gray-400 transition-all bg-white">
          {/* Location Section - Clickable */}
          <button
            onClick={() => openModal('location')}
            className="flex items-center gap-3 flex-1 pr-6 border-r-2 border-gray-300 group/location hover:opacity-80 transition-opacity"
          >
            <MapPin className="w-6 h-6 text-gray-600 group-hover/location:text-gray-900" />
            <span className="text-base font-semibold text-gray-900">{selectedCity}</span>
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover/location:text-gray-900 transition-transform group-hover/location:translate-y-0.5" />
          </button>

          {/* Date Section - Clickable */}
          <button
            onClick={() => openModal('dates')}
            className="flex items-center gap-3 flex-1 pl-2 group/dates hover:opacity-80 transition-opacity"
          >
            <Calendar className="w-6 h-6 text-gray-600 group-hover/dates:text-gray-900" />
            <span className="text-base text-gray-700 group-hover/dates:text-gray-900">{formatDateRange()}</span>
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover/dates:text-gray-900 ml-auto transition-transform group-hover/dates:translate-y-0.5" />
          </button>
        </div>

        {/* User Actions - Absolute Right */}
        <div className="absolute right-6 flex items-center space-x-4 z-10">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-[#E91E63] rounded-full animate-spin"></div>
            </div>
          ) : (user || supabaseUser) ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#E91E63] to-[#F50057] rounded-full flex items-center justify-center text-white font-semibold">
                  {(user?.full_name || supabaseUser?.user_metadata?.full_name || supabaseUser?.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.full_name || supabaseUser?.user_metadata?.full_name || supabaseUser?.email || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || supabaseUser?.email}
                    </p>
                    <span className="inline-block mt-1 text-xs bg-[#E91E63]/10 text-[#E91E63] px-2 py-1 rounded-full capitalize">
                      {(user?.user_type ||
                        (supabaseUser?.user_metadata?.user_type as 'advertiser' | 'publisher' | 'admin') ||
                        'advertiser')}
                    </span>
                  </div>
                  
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}
                  
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                      router.push('/');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#E91E63] to-[#F50057] rounded-lg hover:shadow-lg transition-all cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      <LocationDateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSearch={handleSearch}
        initialTab={modalTab}
      />
    </>
  );
}
