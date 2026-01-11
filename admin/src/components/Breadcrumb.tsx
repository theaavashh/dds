"use client";

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-4 h-4" /> }
    ];

    // Map path segments to readable labels
    const segmentLabels: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'products': 'Products',
      'orders': 'Orders',
      'customers': 'Customers',
      'sales': 'Sales',
      'analytics': 'Analytics',
      'settings': 'Settings',
      'category': 'Categories',
      'discounts': 'Discounts',
      'media': 'Media',
      'popup-banner': 'Pop-up Banner',
      'popup-management': 'Popup Management',
      'top-banner': 'Top Banner',
      'hero-section': 'Hero Section',
      'promotional-banners': 'Promotional Banners',
      'testimonials': 'Testimonials',
      'sliders': 'Sliders',
      'about': 'About',
      'cancellations': 'Cancellations',
      'refunds': 'Refunds',
      'returns': 'Returns',
      'shipped-delivered': 'Shipped/Delivered',
      'product-performance': 'Product Performance',
      'sales-analytics': 'Sales Analytics'
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Skip the first 'dashboard' segment since we already added it as root
      if (segment === 'dashboard' && index === 0) {
        return;
      }
      
      breadcrumbs.push({
        label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
        href: isLast ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav className={`flex items-center space-x-1 text-base text-gray-600 ${className}`} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
            
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="flex items-center space-x-1 hover:text-gray-900 transition-colors duration-200 custom-font font-medium"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center space-x-1 custom-font font-semibold ${
                isLast ? 'text-gray-900' : 'text-gray-600'
              }`}>
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;