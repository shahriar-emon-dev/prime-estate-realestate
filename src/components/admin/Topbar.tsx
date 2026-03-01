'use client';

import { useState, useEffect, useRef } from 'react';
import { FaBell, FaCog, FaBars, FaSignOutAlt, FaHome, FaChevronDown, FaUser, FaShieldAlt } from 'react-icons/fa';
import { getNotifications, markAllNotificationsRead } from '@/lib/dataService';
import { getCurrentUserRole, getRoleLabel, UserWithRole } from '@/lib/roles';
import { Notification } from '@/lib/types';
import { logout } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notificationError, setNotificationError] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    loadCurrentUser();
    // Poll notifications every 30s
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function loadNotifications() {
    try {
      setNotificationError(false);
      const { data } = await getNotifications();
      // Map snake_case from DB to camelCase for component
      const mapped = (data || []).map((n) => ({
        id: n.id,
        type: n.type as Notification['type'],
        title: n.title,
        message: n.message,
        referenceId: n.reference_id,
        isRead: n.is_read,
        createdAt: n.created_at,
      }));
      setNotifications(mapped);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotificationError(true);
      setNotifications([]);
    }
  }

  async function loadCurrentUser() {
    setLoadingUser(true);
    try {
      const user = await getCurrentUserRole();
      setCurrentUser(user);
      console.log('[Topbar] Current user loaded:', user?.email, 'Role:', user?.role);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoadingUser(false);
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  // Get display name - prefer fullName, then email prefix
  const displayName = currentUser?.fullName || currentUser?.email?.split('@')[0] || 'User';
  
  // Get role info
  const isAdmin = currentUser?.role === 'admin';
  const isSeller = currentUser?.role === 'seller';
  
  // Use the centralized role label function
  const displayRole = currentUser?.role ? getRoleLabel(currentUser.role) : 'User';
  
  // Get initials for avatar
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="fixed w-full top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Section - Menu Button + Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button (hamburger) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Open navigation menu"
          >
            <FaBars className="text-xl text-gray-700" />
          </button>
          
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-bold text-sm sm:text-base">PE</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                PrimeEstate
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Go to Homepage Button */}
          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <FaHome className="text-base" />
            <span className="hidden md:inline">Homepage</span>
          </Link>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors" 
              aria-label="Notifications"
            >
              <FaBell className="text-lg" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkRead} 
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notificationError ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaBell className="text-red-400 text-xl" />
                      </div>
                      <p className="text-gray-500 text-sm">Failed to load notifications</p>
                      <button 
                        onClick={loadNotifications}
                        className="mt-2 text-sm text-blue-600 hover:underline"
                      >
                        Try again
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaBell className="text-gray-400 text-xl" />
                      </div>
                      <p className="text-gray-500 text-sm">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <Link 
                        key={n.id} 
                        href="/admin/requests"
                        className={`block px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                        onClick={() => setShowNotifications(false)}
                      >
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{n.title}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleTimeString()}</p>
                      </Link>
                    ))
                  )}
                </div>
                <div className="px-4 py-3 border-t bg-gray-50 text-center">
                  <Link 
                    href="/admin/requests" 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setShowNotifications(false)}
                  >
                    View All Requests →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 ml-1 border-l border-gray-200 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-blue-600/20">
                {loadingUser ? '...' : initials}
              </div>
              {/* Name/Role - Hidden on mobile */}
              <div className="hidden md:block text-left">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm leading-tight">
                    {loadingUser ? 'Loading...' : displayName}
                  </p>
                  {/* ADMIN Badge - Always visible for admins */}
                  {isAdmin && !loadingUser && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                      <FaShieldAlt className="text-[8px]" />
                      Admin
                    </span>
                  )}
                  {/* SELLER Badge */}
                  {isSeller && !loadingUser && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                      Seller
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{loadingUser ? '' : currentUser?.email}</p>
              </div>
              <FaChevronDown className={`hidden sm:block text-xs text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                {/* User Info */}
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{displayName}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">
                        <FaShieldAlt className="text-[8px]" />
                        Admin
                      </span>
                    )}
                    {isSeller && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                        Seller
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{currentUser?.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {displayRole}
                  </span>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors sm:hidden"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaHome className="text-gray-400" />
                    Go to Homepage
                  </Link>
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaUser className="text-gray-400" />
                    Profile Settings
                  </Link>
                  <Link
                    href="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FaCog className="text-gray-400" />
                    Account Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t py-2">
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <FaSignOutAlt />
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
