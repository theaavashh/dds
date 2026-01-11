'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { useAuth } from '@/contexts/AuthContext';
import { Key, Lock, Shield } from 'lucide-react';

export default function PasswordManagementPage() {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const { user } = useAuth();

  const securityTips = [
    {
      icon: Lock,
      title: 'Use a Strong Password',
      description: 'Choose a password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.'
    },
    {
      icon: Shield,
      title: 'Don\'t Reuse Passwords',
      description: 'Use a unique password for this account. Avoid using passwords from other services or websites.'
    },
    {
      icon: Key,
      title: 'Change Regularly',
      description: 'Update your password periodically to maintain account security, especially if you suspect unauthorized access.'
    }
  ];

  return (
    <DashboardLayout title="Password Management" showBackButton={false} showBreadcrumb={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Password Management</h1>
            <p className="text-gray-600 mt-1">Manage your account security settings</p>
          </div>
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Key className="w-5 h-5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Security Overview */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Account Security</h2>
              <p className="text-gray-600 text-sm">
                Keep your account secure by using a strong, unique password and updating it regularly. 
                For enhanced security, consider enabling two-factor authentication if available.
              </p>
            </div>
          </div>
        </div>

        {/* Current Account Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Username</span>
              <span className="text-sm font-semibold text-gray-900">{user?.username || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Email</span>
              <span className="text-sm font-semibold text-gray-900">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-gray-600">Account Status</span>
              <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Security Tips</h3>
          <div className="space-y-4">
            {securityTips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{tip.title}</h4>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change Password Modal */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <ChangePasswordModal
              onClose={() => setShowChangePasswordModal(false)}
              userId={user?.id || ''}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}






