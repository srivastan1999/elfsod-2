'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { 
  Users, 
  MapPin, 
  LayoutGrid, 
  TrendingUp, 
  DollarSign, 
  Eye,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalAdSpaces: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  pendingApprovals: number;
}

export default function AdminPortalDashboard() {
  const { adminUser, loading } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAdSpaces: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingApprovals: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (adminUser) {
      fetchDashboardStats();
    } else {
      setLoadingStats(false);
    }
  }, [adminUser]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('elfsod-admin-token');
      const response = await fetch('/api/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const statCards = [
    {
      title: 'Total Ad Spaces',
      value: stats.totalAdSpaces,
      icon: LayoutGrid,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-[#E91E63] to-[#F50057]',
      bgColor: 'bg-pink-50',
      textColor: 'text-[#E91E63]',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Ad Spaces',
      description: 'Add, edit, or delete ad spaces',
      icon: LayoutGrid,
      href: '/ad-spaces',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: Users,
      href: '/users',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Manage Categories',
      description: 'Add or edit categories',
      icon: MapPin,
      href: '/categories',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'View Bookings',
      description: 'Monitor all bookings',
      icon: Eye,
      href: '/bookings',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  // Show sign-in prompt if not authenticated
  if (!loading && !adminUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-4 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Authentication Required</h1>
          <p className="text-slate-400 mb-6">Please sign in to access the Control Center</p>
          <Link
            href="/auth/signin"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="container-app px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Control Center</h1>
              <p className="text-slate-400 mt-1">
                Welcome back, <span className="text-blue-400 font-medium">{adminUser?.full_name}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg">
                System Status: <span className="text-green-400">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-slate-600 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-indigo-700/20 border border-blue-500/30">
                  <stat.icon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-white">
                  {loadingStats ? (
                    <span className="animate-pulse text-slate-500">--</span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-slate-900 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-blue-500/50 hover:shadow-xl hover:scale-[1.02] transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                <p className="text-sm text-slate-400">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Users</h2>
              <Link
                href="/users"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {loadingStats ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Recent Bookings</h2>
              <Link
                href="/bookings"
                className="text-sm text-blue-400 hover:text-blue-300 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {loadingStats ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No recent bookings
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

