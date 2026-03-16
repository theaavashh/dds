'use client';

import { useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ChangePasswordModal from '@/components/ChangePasswordModal';
// import DeleteAccountModal from '@/components/DeleteAccountModal';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import {
  Shield,
  Lock,
  Key,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Mail,
  Activity,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Edit2,
  Save,
  X,
  Trash2,
  Upload,
  Settings,
  Bell,
  CreditCard,
  Globe,
  Smartphone,
  LogOut,
  Shield as ShieldIcon,
  User as UserIcon,
  Mail as MailIcon,
  Briefcase,
  MapPin,
  Calendar,
  Phone,
  Globe as GlobeIcon,
  UserCheck,
  Pencil,
  Check,
  Loader2,
  Star,
  Award,
  Target,
  TrendingUp,
  Database,
  Server,
  Cpu,
  HardDrive,
  Network,
  ShieldAlert,
  BellRing,
  Wifi,
  Battery,
  Zap as ZapIcon,
  Cloud,
  Database as DatabaseIcon,
  Layers,
  BarChart,
  PieChart,
  LineChart,
  Activity as ActivityIcon,
  AlertOctagon,
  AlertCircle as AlertCircleIcon,
  Info,
  HelpCircle,
  FileText,
  Download,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  UserPlus,
  Users as UsersIcon,
  KeyRound,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Shield as ShieldIcon2,
  ShieldOff,
  ShieldQuestion,
  ShieldMinus,
  ShieldPlus,
  ShieldX,
  CreditCard as CreditCardIcon,
  Smartphone as SmartphoneIcon,
  Globe as Globe2,
  LogOut as LogOutIcon,
  Database as Database2,
  Server as ServerIcon,
  HardDrive as HardDriveIcon,
  Network as NetworkIcon,
  Bell as BellIcon,
  Mail as Mail2,
  Shield as Shield3,
  Wifi as WifiIcon,
  Battery as BatteryIcon,
  Cloud as CloudIcon
} from 'lucide-react';

export default function ProfileManagementPage() {
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateProfile } = useAuth();

  // Profile form state
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || '',
    department: user?.department || 'Administration',
    role: user?.role || 'Administrator',
    language: user?.language || 'English',
    timezone: user?.timezone || 'UTC+5:30',
    lastLogin: '2 hours ago',
    accountCreated: 'Jan 15, 2024',
    notifications: {
      email: true,
      push: true,
      marketing: false,
      security: true,
    }
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        // In a real app, you would upload to your server here
        // await uploadProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      // Show success message
    } catch (error) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      fullName: user?.fullName || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      location: user?.location || '',
      website: user?.website || '',
      jobTitle: user?.jobTitle || '',
      company: user?.company || '',
      department: user?.department || 'Administration',
      role: user?.role || 'Administrator',
      language: user?.language || 'English',
      timezone: user?.timezone || 'UTC+5:30',
      lastLogin: '2 hours ago',
      accountCreated: 'Jan 15, 2024',
      notifications: {
        email: true,
        push: true,
        marketing: false,
        security: true,
      }
    });
    setIsEditing(false);
  };

  const securityMetrics = [
    {
      label: 'Password Strength',
      value: 'Strong',
      icon: ShieldCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progress: 90
    },
    {
      label: 'Last Changed',
      value: '30 days ago',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      progress: 60
    },
    {
      label: 'Account Status',
      value: 'Active',
      icon: ActivityIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      progress: 100
    },
    {
      label: 'Login Attempts',
      value: 'Today: 3',
      icon: ShieldAlert,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      progress: 30
    }
  ];

  const systemMetrics = [
    {
      label: 'CPU Usage',
      value: '42%',
      icon: Cpu,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      status: 'normal'
    },
    {
      label: 'Memory',
      value: '3.2/8 GB',
      icon: Database2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      status: 'normal'
    },
    {
      label: 'Storage',
      value: '128/256 GB',
      icon: HardDriveIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      status: 'warning'
    },
    {
      label: 'Network',
      value: '45 Mbps',
      icon: NetworkIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      status: 'good'
    }
  ];

  const quickActions = [
    {
      icon: KeyRound,
      label: 'Change Password',
      description: 'Update your login credentials',
      color: 'blue',
      action: () => setShowChangePasswordModal(true)
    },
    {
      icon: BellRing,
      label: 'Notifications',
      description: 'Configure alert preferences',
      color: 'purple',
      action: () => console.log('Notifications')
    },
    {
      icon: ShieldIcon2,
      label: 'Security',
      description: 'View security settings',
      color: 'green',
      action: () => console.log('Security')
    },
    {
      icon: Trash2,
      label: 'Delete Account',
      description: 'Permanently delete account',
      color: 'red',
      action: () => setShowDeleteAccountModal(true)
    }
  ];

  const accountInfo = [
    { label: 'Account ID', value: 'ADM-' + (user?.id?.slice(0, 8) || '00000000'), icon: UserCheck },
    { label: 'Member Since', value: profileData.accountCreated, icon: Calendar },
    { label: 'Timezone', value: profileData.timezone, icon: Globe2 },
    { label: 'Language', value: profileData.language, icon: GlobeIcon },
    { label: 'Department', value: profileData.department, icon: Briefcase },
  ];

  const securityFeatures = [
    {
      icon: ShieldCheck,
      title: 'Two-Factor Authentication',
      description: 'Add an extra layer of security to your account',
      status: 'Enabled',
      color: 'green'
    },
    {
      icon: Lock,
      title: 'Session Management',
      description: 'View and manage active sessions',
      status: 'Active',
      color: 'blue'
    },
    {
      icon: Bell,
      title: 'Security Alerts',
      description: 'Get notified about suspicious activity',
      status: 'Enabled',
      color: 'purple'
    },
    {
      icon: DatabaseIcon,
      title: 'Data Encryption',
      description: 'Your data is encrypted at rest and in transit',
      status: 'Active',
      color: 'indigo'
    }
  ];

  const connectedDevices = [
    {
      name: 'MacBook Pro',
      type: 'Laptop',
      icon: Cpu,
      lastActive: 'Now',
      location: 'New York, US',
      status: 'active'
    },
    {
      name: 'iPhone 14 Pro',
      type: 'Mobile',
      icon: SmartphoneIcon,
      lastActive: '2 hours ago',
      location: 'New York, US',
      status: 'active'
    },
    {
      name: 'iPad Air',
      type: 'Tablet',
      icon: SmartphoneIcon,
      lastActive: '1 day ago',
      location: 'Home',
      status: 'inactive'
    },
    {
      name: 'Desktop Workstation',
      type: 'Desktop',
      icon: Cpu,
      lastActive: '3 days ago',
      location: 'Office',
      status: 'inactive'
    }
  ];

  return (
    <DashboardLayout title="Profile Management" showBackButton={false} showBreadcrumb={true}>
      <div className="space-y-8">
        {/* Page Title Header */}
        <div className=" p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3">
                  <Settings className="w-8 h-8 text-[#cca43b]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 title-regular">Profile Management</h1>
                  <p className="text-gray-600 mt-1">Manage your account settings, security, and personal information</p>
                </div>
              </div>
             
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="flex items-center gap-2 px-4 py-4  text-gray-700 rounded-full border border-gray-300 hover:bg-gray-200 transition-colors font-medium"
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-1 bg-[#cca43b] text-white rounded-full transition-colors font-medium"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel Editing
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

    {/* Profile Header */}
<div className="p-6">
  <div className="flex flex-col items-center justify-center text-center w-full">
    <div className='flex flex-row items-center justify-center gap-4'>
    <div className="relative mb-4">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl">
        {profileImage ? (
          <Image
            src={profileImage}
            alt="Profile"
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
            <UserIcon className="w-12 h-12 text-blue-600" />
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-1 right-1 p-2 bg-white text-blue-600 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </div>

    <div className='flex flex-col items-center justify-center'>
    
    <h1 className="text-3xl font-bold text-gray-900 mb-2">
      {profileData.fullName || profileData.username}
    </h1>

    <p className="text-gray-600 mb-3">
      {profileData.role} • {profileData.department}
    </p>

    </div>
    
    

    </div> 
    
  
   
  </div>
</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Quick Stats & Actions */}
          <div className="lg:col-span-1 ">
            {/* Account Information */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Account Information
              </h3>
              <div className="space-y-4">
                {accountInfo.map((info, index) => {
                  const Icon = info.icon;
                  return (
                    <div key={index} className="flex items-center justify-between hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{info.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{info.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 my-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ZapIcon className="w-5 h-5 text-orange-600" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  const colorClasses = {
                    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100',
                    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100',
                    green: 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100',
                    red: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100',
                    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100',
                  }[action.color];

                  return (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl transition-colors ${colorClasses}`}
                    >
                      <Icon className="w-6 h-6 mb-2" />
                      <span className="text-xs font-medium text-center">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-700" />
                  Personal Information
                </h3>
                <p className="text-sm text-gray-600 mt-1">Update your personal details and contact information</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border text-black ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'border-gray-200 bg-gray-50'} rounded-xl transition-all`}
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border text-black ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'border-gray-200 bg-gray-50'} rounded-xl transition-all`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Mail className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border  text-black ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'border-gray-200 bg-gray-50'} rounded-xl transition-all`}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border text-black ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'border-gray-200 bg-gray-50'} rounded-xl transition-all`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border  text-black ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'border-gray-200 bg-gray-50'} rounded-xl transition-all`}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border text-black ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'border-gray-200 bg-gray-50'} rounded-xl transition-all`}
                      />
                    </div>
                  </div>

                  {/* Job Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Award className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={profileData.jobTitle}
                        onChange={(e) => setProfileData({ ...profileData, jobTitle: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border text-black ${isEditing ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : 'border-gray-200 bg-gray-50'} rounded-xl transition-all`}
                      />
                    </div>
                  </div>

                
                 
                </div>

                {/* Form Actions */}
                {isEditing && (
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCancelEdit}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

           
          </div>
          
        </div>

         {/* Delete Account Section */}
            <div className="bg-white rounded-2xl border border-red-200 shadow-lg overflow-hidden">
              <div className="border-b border-red-200 px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Account Deletion
                </h3>
                <p className="text-sm text-gray-600 mt-1">Permanently delete your account and all associated data</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Warning
                    </h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>All your data will be permanently deleted</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>This action cannot be undone</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>You will lose access to all your content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>Any subscriptions will be canceled</span>
                      </li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Once deleted, your account cannot be recovered.</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteAccountModal(true)}
                      className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium shadow-md flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>

        {/* Modals */}
        {showChangePasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <ChangePasswordModal
              onClose={() => setShowChangePasswordModal(false)}
              userId={user?.id || ''}
            />
          </div>
        )}

        {showDeleteAccountModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <DeleteAccountModal
              onClose={() => setShowDeleteAccountModal(false)}
              userId={user?.id || ''}
              username={profileData.username}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}