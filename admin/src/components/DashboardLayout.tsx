"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  FolderOpen,
  Package,
  Percent,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  FileText,
  Star,
  Package2,
  Layers,
  BarChart,
  Mail,
  Gift,
  Target,
  UserCheck,
  MessageSquare,
  FileText as ContentIcon,
  Image as SliderIcon,
  Newspaper as ArticleIcon,
  Info as AboutIcon,
  Video,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Database,
  Utensils,
  Award,
  Heart,
  Key,
  ChevronUp,
  Store,
  FileCheck
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Breadcrumb from "@/components/Breadcrumb";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import { fetchCsrfToken } from "@/lib/csrfClient";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showBreadcrumb?: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  children?: NavigationItem[];
  path?: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    path: "/dashboard",
    children: [
      { id: "quick-insights", label: "Quick Insights", icon: TrendingUp, path: "/dashboard" }
    ]
  },
  {
    id: "categories",
    label: "Categories",
    icon: FolderOpen,
    path: "/dashboard/categories"
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    path: "/dashboard/products"
  },
  {
    id: "email-subscriptions",
    label: "Email Subscriptions",
    icon: Mail,
    path: "/dashboard/email-subscriptions"
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { id: "all-orders", label: "All Orders", icon: FileText, path: "/dashboard/orders" }
    ]
  },
  {
    id: "inquiries",
    label: "Inquiries",
    icon: MessageSquare,
    path: "/dashboard/inquiries"
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    children: [
      { id: "all-customers", label: "All Customers", icon: UserCheck, path: "/dashboard/customers" },
      { id: "reviews", label: "Reviews & Ratings", icon: Star, path: "/dashboard/reviews" }
    ]
  },
  {
    id: "sales",
    label: "Sales",
    icon: DollarSign,
    children: [
      { id: "discounts", label: "Discounts", icon: Percent, path: "/dashboard/discounts" },
      { id: "promotions", label: "Promotions", icon: Gift, path: "/dashboard/promotions" },
      { id: "email-marketing", label: "Email Marketing", icon: Mail, path: "/dashboard/email-marketing" },
      { id: "email-subscriptions-sales", label: "Email Subscriptions", icon: Mail, path: "/dashboard/email-subscriptions" }
    ]
  },
  {
    id: "content",
    label: "Content",
    icon: Layers,
    children: [
      { id: "hero-section", label: "Hero Section", icon: SliderIcon, path: "/dashboard/content/hero-section" },
      { id: "testimonials", label: "Testimonials", icon: Star, path: "/dashboard/content/testimonials" },
      { id: "services", label: "Services", icon: SliderIcon, path: "/dashboard/content/services" },
      { id: "videos", label: "Videos", icon: Video, path: "/dashboard/content/videos" },
      { id: "banners", label: "Banners", icon: SliderIcon, path: "/dashboard/content/banners" },
      { id: "about", label: "About", icon: AboutIcon, path: "/dashboard/content/about" }
    ]
  },
  {
    id: "analytics",
    label: "Analytics & Reports",
    icon: BarChart3,
    children: [
      { id: "analytics", label: "Website Analytics", icon: BarChart3, path: "/dashboard/analytics" },
      { id: "sales-analytics", label: "Sales Analytics", icon: TrendingUp, path: "/dashboard/sales-analytics" },
      { id: "product-performance", label: "Product Performance", icon: BarChart, path: "/dashboard/product-performance" },
      { id: "customer-analytics", label: "Customer Analytics", icon: Users, path: "/dashboard/customer-analytics" },
      { id: "marketing-performance", label: "Marketing Performance", icon: Target, path: "/dashboard/marketing-performance" }
    ]
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    children: [
      { id: "site-settings", label: "Site Settings", icon: Settings, path: "/dashboard/settings" },
      { id: "users", label: "User Configuration", icon: UserCheck, path: "/dashboard/users" },
      { id: "password", label: "Password Management", icon: Key, path: "/dashboard/settings/password" }
    ]
  }
];

// Create a map of routes for quick lookup
const ROUTE_MAP = NAVIGATION_ITEMS.reduce((acc, item) => {
  if (item.path) {
    acc[item.id] = item.path;
  }
  if (item.children) {
    item.children.forEach(child => {
      if (child.path) {
        acc[child.id] = child.path;
      }
      if (child.children) {
        child.children.forEach(grandChild => {
          if (grandChild.path) {
            acc[grandChild.id] = grandChild.path;
          }
        });
      }
    });
  }
  return acc;
}, {} as Record<string, string>);

export default function DashboardLayout({
  children,
  title = "Dashboard",
  showBackButton = false,
  showBreadcrumb = true
}: DashboardLayoutProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Memoize screen size detection
  const checkScreenSize = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const desktop = width >= 1024;
      setIsDesktop(desktop);
      setIsMobile(width < 768);
      setSidebarOpen(desktop);
    }
  }, []);

  useEffect(() => {
    checkScreenSize();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkScreenSize);
      return () => window.removeEventListener('resize', checkScreenSize);
    }
  }, [checkScreenSize]);

  useEffect(() => {
    fetchCsrfToken().catch(() => { });
  }, []);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const handleNavigation = useCallback((itemId: string, parentId?: string) => {
    const path = ROUTE_MAP[itemId];

    // Navigate if path exists
    if (path) {
      router.push(path);
    }

    // Toggle section if it has children
    const item = NAVIGATION_ITEMS.find(i => i.id === itemId) ||
      NAVIGATION_ITEMS.flatMap(i => i.children || []).find(i => i.id === itemId) ||
      NAVIGATION_ITEMS.flatMap(i => (i.children || []).flatMap(c => c.children || [])).find(i => i.id === itemId);

    if (item?.children?.length) {
      toggleSection(itemId);
    }

    // Close mobile sidebar after navigation
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, router, toggleSection]);

  // Determine if a navigation item is active based on current path
  const isNavItemActive = useCallback((itemId: string) => {
    const path = ROUTE_MAP[itemId];
    if (!path) return false;

    // Exact match or partial match for parent routes
    return pathname === path || (pathname.startsWith(path) && path !== '/dashboard');
  }, [pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (userMenuOpen) setUserMenuOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  // Navigation component for better organization
  const Navigation = useMemo(() => (
    <nav className="flex-1 overflow-y-auto px-3 py-6 scrollbar-hide" style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}>
      <div className="space-y-1">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedSections.has(item.id);
          const hasChildren = !!item.children?.length;
          const isActive = isNavItemActive(item.id);

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleSection(item.id);
                  } else {
                    handleNavigation(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-3 font-medium text-2xl rounded-lg transition-colors ${isActive
                    ? 'bg-blue-50 text-black border-r-2 border-blue-700'
                    : 'text-black hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <Icon className="w-5 h-5 mr-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate text-xl text-black">
                      {item.label}
                    </span>
                  )}
                </div>
                {!isCollapsed && hasChildren && (
                  <div
                    className="flex-shrink-0 ml-2"
                    style={{ transform: `rotate(${isExpanded ? 90 : 0}deg)` }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </button>

              {hasChildren && isExpanded && !isCollapsed && (
                <div className="relative ml-6 mt-1 space-y-1">
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>

                  {item.children!.map((child) => {
                    const ChildIcon = child.icon;
                    const hasGrandChildren = !!child.children?.length;
                    const isChildExpanded = expandedSections.has(child.id);
                    const isChildActive = isNavItemActive(child.id);

                    return (
                      <div key={child.id} className="relative">
                        <div className="absolute left-0 top-1/2 w-6 h-3 transform -translate-y-1/2 border-l-2 border-b-2 border-gray-300 rounded-bl-2xl"></div>

                        <button
                          onClick={() => {
                            if (hasGrandChildren) {
                              toggleSection(child.id);
                            } else {
                              handleNavigation(child.id, item.id);
                            }
                          }}
                          className={`w-full flex items-center pl-8 pr-3 py-3 font-medium rounded-lg transition-colors relative ${isChildActive
                              ? 'bg-blue-50 text-black'
                              : 'text-black hover:bg-gray-50'
                            }`}
                        >
                          <ChildIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                          <span className="truncate text-lg text-black">{child.label}</span>
                          {hasGrandChildren && (
                            <div
                              className="flex-shrink-0 ml-2"
                              style={{ transform: `rotate(${isChildExpanded ? 90 : 0}deg)` }}
                            >
                              <ChevronRight className="w-3 h-3" />
                            </div>
                          )}
                        </button>

                        {hasGrandChildren && isChildExpanded && (
                          <div className="relative ml-6 mt-1 space-y-1">
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>

                            {child.children!.map((grandChild) => {
                              const GrandChildIcon = grandChild.icon;
                              const isGrandChildActive = isNavItemActive(grandChild.id);

                              return (
                                <div key={grandChild.id} className="relative">
                                  <div className="absolute left-0 top-1/2 w-6 h-3 transform -translate-y-1/2 border-l-2 border-b-2 border-gray-300 rounded-bl-2xl"></div>

                                  <button
                                    onClick={() => handleNavigation(grandChild.id, child.id)}
                                    className={`w-full flex items-center pl-8 pr-3 py-3 font-medium rounded-lg transition-colors relative ${isGrandChildActive
                                        ? 'bg-blue-50 text-black'
                                        : 'text-black hover:bg-gray-50'
                                      }`}
                                  >
                                    <GrandChildIcon className="w-3 h-3 mr-3 flex-shrink-0" />
                                    <span className="truncate text-base text-black">{grandChild.label}</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  ), [expandedSections, isCollapsed, isNavItemActive, handleNavigation, toggleSection]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && !isDesktop && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`
            ${isDesktop ? 'relative' : 'fixed inset-y-0 left-0 z-50'}
            ${isDesktop ? (isCollapsed ? 'w-16' : 'w-1/5') : (sidebarOpen ? 'w-96' : 'w-0')}
            ${isDesktop ? 'translate-x-0' : (sidebarOpen ? 'translate-x-0' : '-translate-x-full')}
            flex-shrink-0 bg-white shadow-lg flex flex-col
          `}
        >
          {/* Fixed Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8">
                <Image
                  src="/celeb.jpg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-black">
                  Admin CMS
                </span>
              )}
            </div>
            <button
              onClick={() => setIsCollapsed(v => !v)}
              className="p-2 rounded-md text-black hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            {!isDesktop && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-md text-black hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {Navigation}

          {/* Fixed Footer */}
          <div className="p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center text-xl px-3 py-2 text-black hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`lg:hidden p-2 rounded-md transition-colors ${sidebarOpen
                      ? 'text-black bg-blue-50 hover:bg-blue-100'
                      : 'text-black hover:bg-gray-100'
                    }`}
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                {showBackButton && (
                  <button
                    onClick={() => router.back()}
                    className="p-2 rounded-md text-black hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                {showBreadcrumb ? (
                  <div className="flex items-center">
                    <Breadcrumb />
                  </div>
                ) : (
                  <h1 className="text-xl sm:text-2xl font-bold text-black truncate">
                    {title}
                  </h1>
                )}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-base font-medium text-black hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="hidden sm:inline">Welcome back, {user?.fullname || 'Admin'}</span>
                    <span className="sm:hidden">{user?.fullname || 'Admin'}</span>
                    {userMenuOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <button
                        onClick={() => {
                          setShowChangePasswordModal(true);
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-base font-medium text-black hover:bg-gray-100 transition-colors"
                      >
                        <Key className="w-4 h-4" />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-base font-medium text-black hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {showChangePasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <ChangePasswordModal
                    onClose={() => setShowChangePasswordModal(false)}
                    userId={user?.id || ''}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Quick Actions */}
          {isMobile && (
            <div className="bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <button
                  onClick={() => handleNavigation('products')}
                  className="flex-shrink-0 px-3 py-2 font-bold text-black bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Products
                </button>
                <button
                  onClick={() => handleNavigation('all-orders')}
                  className="flex-shrink-0 px-3 py-2 font-bold text-black bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Orders
                </button>
                <button
                  onClick={() => handleNavigation('all-customers')}
                  className="flex-shrink-0 px-3 py-2 font-bold text-black bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Customers
                </button>
                <button
                  onClick={() => handleNavigation('sales-analytics')}
                  className="flex-shrink-0 px-3 py-2 font-bold text-black bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  Analytics
                </button>
              </div>
            </div>
          )}

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}