'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, easeOut, AnimatePresence, Variants } from 'framer-motion';
import { User, Search, Menu, X, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { Distributor } from '@/store/userSlice';
import { clearUser } from '@/store/userSlice';

// Animation constants
const SCROLL_THRESHOLD = 50;
const ANIMATION_DURATION = 0.3;

// Background animation variants
const backgroundVariants = {
  hidden: {
    height: '100%',
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
  },
  visible: {
    height: '100%',
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)'
  }
}

// Icon color animation variants
const iconVariants = {
  hidden: { color: '#FFFFFF' },
  visible: { color: '#000000' }
}

// Tooltip animation variants
const tooltipVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

const searchInputVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 }
  }
}

const sidebarVariants: Variants = {
  closed: {
    x: "100%",
    transition: { type: "tween", duration: 0.4 }
  },
  open: {
    x: 0,
    transition: { type: "tween", duration: 0.4 }
  }
};

const menuItems = [
  { label: 'HOME', href: '/' },
  { label: 'ABOUT US', href: '/about' },
  {
    label: 'JEWELLERY',
    href: '/jewelry',
    hasSubmenu: true,
    submenu: [
      { label: 'NECKLACE', href: '/jewelry/necklace' },
      { label: 'EARRING', href: '/jewelry/earring' },
      { label: 'LADIES RING', href: '/jewelry/ladies-ring' },
      { label: 'BANGLE', href: '/jewelry/bangle' },
      { label: 'OVAL BANGLE', href: '/jewelry/oval-bangle' },
      { label: 'CHOCKER', href: '/jewelry/chocker' },
      { label: 'CHOCKER EARRING', href: '/jewelry/chocker-earring' },
      { label: 'PENDENT', href: '/jewelry/pendent' },
      { label: 'MANGALSUTRA', href: '/jewelry/mangalsutra' },
      { label: 'LADIES BRACELET', href: '/jewelry/ladies-bracelet' },
      { label: 'CHOKER HANDMADE', href: '/jewelry/choker-handmade' },
      { label: 'CHOKER HANDMADE EARRING', href: '/jewelry/choker-handmade-earring' },
      { label: 'MENS RING', href: '/jewelry/mens-ring' },
      { label: 'MENS BRACELATE', href: '/jewelry/mens-bracelate' },
    ]
  },
  { label: 'COLLECTION', href: '/collection', hasSubmenu: true },
  { label: 'EVENTS', href: '/events' },
  { label: 'PRIVACY POLICY', href: '/privacy-policy' },
  { label: 'TERMS & CONDITIONS', href: '/terms-conditions' },
  { label: 'FAQ', href: '/faq' },
  { label: 'BLOG', href: '/blog' },
  { label: 'CONTACT US', href: '/contact' },
];

// Header props interface
interface HeaderProps {
  logoSrc?: string
  logoAlt?: string
  logoWidth?: number
  logoHeight?: number
}

export default function Header({
  logoSrc = '/celeb.jpg',
  logoAlt = 'Logo',
  logoWidth = 64,
  logoHeight = 64
}: HeaderProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const router = useRouter()
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Get user data from Redux store
  const userState: any = useSelector((state: RootState) => state.user)
  const distributor: Distributor | null = userState.distributor
  const isAuthenticated: boolean = userState.isAuthenticated
  const dispatch = useDispatch<AppDispatch>()

  // Handle click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle scroll events for header animation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search results page
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      // Hide search input after submission
      setShowSearch(false)
    }
  }

  // Tooltip handlers
  const showTooltip = (tooltip: string) => setActiveTooltip(tooltip)
  const hideTooltip = () => setActiveTooltip(null)

  // Toggle search input visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (!showSearch) {
      setSearchQuery('')
    }
  }

  // Toggle user dropdown
  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown)
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      // Use the API URL from environment variables or default to /api
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/distributors/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // Clear the Redux state regardless of API response
      dispatch(clearUser());
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, clear the local state
      dispatch(clearUser());
    } finally {
      // Redirect to home page
      router.push('/');
      // Refresh the page to update the state
      router.refresh();
    }
  }

  // Render a single icon with tooltip
  const renderIconWithTooltip = (
    icon: React.ReactNode,
    tooltipText: string,
    action?: () => void,
    href?: string
  ) => (
    <div
      className="relative"
      onMouseEnter={() => showTooltip(tooltipText)}
      onMouseLeave={hideTooltip}
    >
      <motion.div
        initial="hidden"
        animate={scrolled ? "visible" : "hidden"}
        variants={iconVariants}
        transition={{
          color: { duration: ANIMATION_DURATION, ease: easeOut }
        }}
      >
        {href ? (
          <Link href={href} className="transition-colors">
            {icon}
          </Link>
        ) : (
          <button
            onClick={action}
            className="transition-colors"
            aria-label={tooltipText}
          >
            {icon}
          </button>
        )}
      </motion.div>

      {activeTooltip === tooltipText && (
        <motion.div
          className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50"
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.2 }}
        >
          <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-4 border-l-transparent border-r-transparent border-b-white border-opacity-80"></div>
          {tooltipText}
        </motion.div>
      )}
    </div>
  )

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 ">
        {/* Animated background overlay */}
        <motion.div
          className="absolute top-0 left-0 w-full "
          initial="hidden"
          animate={scrolled ? "visible" : "hidden"}
          variants={{
            hidden: {
              backgroundColor: 'rgba(255, 255, 255, 0)',
              height: '0%'
            },
            visible: {
              backgroundColor: 'white',
              height: '100%'
            }
          }}
          transition={{
            backgroundColor: { duration: ANIMATION_DURATION, ease: easeOut },
            height: { duration: ANIMATION_DURATION, ease: easeOut }
          }}
        />

        <div className="px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center py-3">
            {/* Logo Section */}
            <div className="flex flex-col items-center">
              <Link href="/" className="flex flex-col items-center">
                <Image
                  src={logoSrc}
                  alt={logoAlt}
                  width={logoWidth}
                  height={logoHeight}
                />
              </Link>
            </div>

            {/* Center Search Input */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 w-1/3"
              initial="hidden"
              animate={showSearch ? "visible" : "hidden"}
              variants={searchInputVariants}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </motion.div>

            {/* Right Icons */}
            <div className="flex items-center space-x-5">
              {isAuthenticated && distributor ? (
                // Show user dropdown when authenticated
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center space-x-1 transition-colors"
                    aria-label="User menu"
                  >
                    <motion.div
                      initial="hidden"
                      animate={scrolled ? "visible" : "hidden"}
                      variants={iconVariants}
                      transition={{
                        color: { duration: ANIMATION_DURATION, ease: easeOut }
                      }}
                    >
                      <User className="h-5 w-5" />
                    </motion.div>
                    <span className="text-sm font-medium">
                      Hi, {distributor.firstName}
                    </span>
                  </button>

                  {showUserDropdown && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href="/my-orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Account
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                // Show login link when not authenticated
                renderIconWithTooltip(
                  <User className="h-5 w-5" />,
                  'Log In',
                  undefined,
                  '/login'
                )
              )}

              {renderIconWithTooltip(
                <Search className="h-5 w-5" />,
                'Search',
                toggleSearch
              )}

              {renderIconWithTooltip(
                <Menu className="h-5 w-5" />,
                'Menu',
                () => setIsSidebarOpen(true)
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Full Screen Sidebar Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black z-[60]"
            />

            {/* Sidebar */}
            <motion.div
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed top-0 right-0 w-full md:w-[450px] h-full bg-white/95 backdrop-blur-xl z-[70] shadow-2xl flex flex-col"
            >
              <div className="flex justify-end p-6">
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-black" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-4">
                <nav className="flex flex-col">
                  {menuItems.map((item, index) => (
                    <div
                      key={item.label}
                      className="border-b border-gray-200/50"
                    >
                      <div
                        className="flex items-center justify-between px-8 py-5 group hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (item.hasSubmenu) {
                            setExpandedItem(expandedItem === item.label ? null : item.label);
                          } else {
                            router.push(item.href);
                            setIsSidebarOpen(false);
                          }
                        }}
                      >
                        <span className="text-sm font-bold tracking-[0.1em] text-gray-900 uppercase">
                          {item.label}
                        </span>
                        {item.hasSubmenu && (
                          <ChevronRight
                            className={`w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-transform duration-300 ${expandedItem === item.label ? 'rotate-90' : ''}`}
                          />
                        )}
                      </div>

                      {/* Submenu */}
                      <AnimatePresence>
                        {item.hasSubmenu && expandedItem === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden bg-gray-50/50"
                          >
                            {item.submenu?.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className="block pl-12 pr-8 py-3 text-xs font-medium text-gray-600 hover:text-amber-600 tracking-wider uppercase"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}