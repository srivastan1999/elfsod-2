'use client';

import { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Settings as SettingsIcon, User, Lock, Bell, Shield } from 'lucide-react';

export default function AdminSettingsPage() {
  const { adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'permissions', label: 'Permissions', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="container-app px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-slate-400 mt-1">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 p-8">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Profile Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={adminUser?.full_name}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={adminUser?.email}
                        disabled
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 text-slate-400 rounded-lg cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Role
                      </label>
                      <div className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
                        <span className="text-white capitalize">{adminUser?.role}</span>
                        {adminUser?.role === 'super_admin' && (
                          <span className="ml-2 text-xs text-indigo-400">⭐ Super Admin</span>
                        )}
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg">
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg">
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div>
                        <div className="font-medium text-white">Email Notifications</div>
                        <div className="text-sm text-slate-400">Receive email updates about platform activity</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div>
                        <div className="font-medium text-white">Booking Alerts</div>
                        <div className="text-sm text-slate-400">Get notified when new bookings are created</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div>
                        <div className="font-medium text-white">System Updates</div>
                        <div className="text-sm text-slate-400">Receive important system and maintenance updates</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5" defaultChecked />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'permissions' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Permissions</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="font-medium text-white mb-2">Your Role: {adminUser?.role}</div>
                      <div className="text-sm text-slate-400">
                        {adminUser?.role === 'super_admin' 
                          ? 'You have full access to all administrative functions including user management, ad space management, and system settings.'
                          : 'You have access to manage ad spaces, view bookings, and manage categories.'}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="font-medium text-white mb-2">Available Actions</div>
                      <ul className="text-sm text-slate-400 space-y-1 mt-2">
                        <li>✓ View and manage all ad spaces</li>
                        <li>✓ View and manage all users</li>
                        <li>✓ View and manage all bookings</li>
                        <li>✓ Manage categories</li>
                        {adminUser?.role === 'super_admin' && (
                          <>
                            <li>✓ Create and manage admin users</li>
                            <li>✓ Access system settings</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

