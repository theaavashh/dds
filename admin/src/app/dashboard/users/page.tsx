'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { getApiBaseUrl } from '@/lib/api';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Shield,
  Save,
  X,
  Check,
  Filter,
  MoreVertical,
  Mail,
  User,
  Key,
  Shield as ShieldIcon,
  Lock,
  Unlock,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Bell,
  Settings,
  UserCheck,
  UserCog,
  KeyRound,
  BarChart,
  AlertCircle,
  ShieldCheck,
  UserX,
  UserPlus as UserPlusIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon
} from 'lucide-react';

interface AdminUser {
  id: string;
  fullname: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  adminRoles?: {
    id: string;
    role: {
      id: string;
      name: string;
      description: string;
      color?: string;
    };
  }[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  color?: string;
}

export default function UsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    role: 'admin',
    selectedRoles: [] as string[]
  });

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/admins`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setAdmins(data.data);
      } else {
        // If data is not an array or success is false, set empty array
        setAdmins([]);
        console.warn('Invalid data format received:', data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load users');
      // Ensure admins is always an array even on error
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAdmins();
    setIsRefreshing(false);
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/roles`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRoles(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const apiUrl = getApiBaseUrl();
      const url = editingAdmin 
        ? `${apiUrl}/admins/${editingAdmin.id}`
        : `${apiUrl}/admins`;

      const method = editingAdmin ? 'PUT' : 'POST';
      
      const payload: any = {
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        role: formData.role
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (formData.selectedRoles.length > 0) {
        payload.roleIds = formData.selectedRoles;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save user');
      }

      toast.success(`User ${editingAdmin ? 'updated' : 'created'} successfully`);
      resetForm();
      fetchAdmins();
    } catch (error: unknown) {
      console.error('Error saving user:', error);
      const err = error as { message?: string };
      toast.error(err?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${getApiBaseUrl()}/admins/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success('User deleted successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/admins/${id}/toggle`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }

      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchAdmins();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setFormData({
      fullname: admin.fullname,
      username: admin.username,
      email: admin.email,
      password: '',
      role: admin.role,
      selectedRoles: admin.adminRoles?.map(ar => ar.role.id) || []
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      fullname: '',
      username: '',
      email: '',
      password: '',
      role: 'admin',
      selectedRoles: []
    });
    setEditingAdmin(null);
    setShowForm(false);
  };

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredAdmins.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredAdmins.map(user => user.id));
    }
  };

  const filteredAdmins = Array.isArray(admins) ? admins.filter((admin) => {
    const matchesSearch =
      admin.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' 
      ? true 
      : filterStatus === 'active' 
        ? admin.isActive 
        : !admin.isActive;

    const matchesRole = filterRole === 'all' || admin.role === filterRole;

    return matchesSearch && matchesFilter && matchesRole;
  }) : [];

  const stats = {
    total: Array.isArray(admins) ? admins.length : 0,
    active: Array.isArray(admins) ? admins.filter(u => u.isActive).length : 0,
    inactive: Array.isArray(admins) ? admins.filter(u => !u.isActive).length : 0,
    admins: Array.isArray(admins) ? admins.filter(u => u.role === 'admin').length : 0,
    managers: Array.isArray(admins) ? admins.filter(u => u.role === 'manager').length : 0,
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-blue-100 text-blue-800',
      manager: 'bg-purple-100 text-purple-800',
      editor: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800',
      superadmin: 'bg-red-100 text-red-800',
    };
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout title="User Configuration" showBackButton={false} showBreadcrumb={true}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">User Configuration</h1>
                  <p className="text-blue-100 mt-1">Manage team members, roles, and permissions</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white">
                  <Users className="w-4 h-4" />
                  {stats.total} Total Users
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/20 text-green-100">
                  <CheckCircle className="w-4 h-4" />
                  {stats.active} Active
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-100">
                  <UserCog className="w-4 h-4" />
                  {stats.admins} Administrators
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg"
              >
                <UserPlusIcon className="w-4 h-4" />
                Add New User
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                <span>All team members</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Currently active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inactive}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <UserX className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>Deactivated accounts</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.admins}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <KeyRound className="w-4 h-4" />
                <span>Full access users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-50"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              {selectedUsers.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <span>{selectedUsers.length} selected</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterStatus('all')}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                        filterStatus === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus('active')}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                        filterStatus === 'active'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterStatus('inactive')}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors ${
                        filterStatus === 'inactive'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Inactive
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingAdmin ? 'Edit User' : 'Add New User'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingAdmin ? 'Update user information' : 'Create a new team member'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullname}
                        onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="johndoe"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <KeyRound className="w-4 h-4" />
                        Password {editingAdmin ? '(optional)' : '*'}
                      </label>
                      <input
                        type="password"
                        required={!editingAdmin}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder={editingAdmin ? 'Leave blank to keep current' : 'Enter secure password'}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <ShieldIcon className="w-4 h-4" />
                        Primary Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      >
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                {roles.length > 0 && (
                  <div className="pt-6 border-t border-gray-200">
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Additional Roles & Permissions
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roles.map((role) => (
                        <label key={role.id} className="flex items-start gap-3 p-4 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.selectedRoles.includes(role.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selectedRoles: [...formData.selectedRoles, role.id]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedRoles: formData.selectedRoles.filter(id => id !== role.id)
                                });
                              }
                            }}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role.name)}`}>
                                {role.name}
                              </div>
                            </div>
                            {role.description && (
                              <div className="text-sm text-gray-600 mt-2">{role.description}</div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingAdmin ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredAdmins.length && filteredAdmins.length > 0}
                      onChange={selectAllUsers}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role & Permissions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                        <p className="text-gray-500">Loading users...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No users found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm ? 'Try adjusting your search' : 'Add your first team member'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(admin.id)}
                          onChange={() => toggleUserSelection(admin.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                            <span className="text-white font-semibold text-lg">
                              {admin.fullname.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">{admin.fullname}</span>
                              {admin.isActive && (
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">@{admin.username}</div>
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${admin.email}`} className="text-sm hover:text-blue-600">
                            {admin.email}
                          </a>
                        </div>
                        {admin.lastLogin && (
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                            <Clock className="w-3 h-3" />
                            <span>Last login: {new Date(admin.lastLogin).toLocaleDateString()}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                            {admin.role}
                          </span>
                          {admin.adminRoles && admin.adminRoles.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {admin.adminRoles.map((ar) => (
                                <span
                                  key={ar.id}
                                  className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600"
                                >
                                  {ar.role.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {admin.isActive ? (
                            <>
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-green-700">Active</span>
                            </>
                          ) : (
                            <>
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-600">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(admin.id, admin.isActive)}
                            className={`p-2 rounded-lg transition-colors ${
                              admin.isActive
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                            title={admin.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {admin.isActive ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(admin)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredAdmins.length}</span> of{' '}
                <span className="font-semibold">{admins.length}</span> users
              </div>
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                  <button className="text-sm text-red-600 hover:text-red-700">
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}