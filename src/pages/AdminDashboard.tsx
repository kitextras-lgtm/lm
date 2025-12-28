import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, X, User, Link2, CreditCard, Bell } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { AnimatedBarsLoader } from '../components/AnimatedBarsLoader';
import { AdminMessagesPage } from './AdminMessagesPage';
import { getAdminId } from '../hooks/useChat';
import { NotificationSender } from '../components/NotificationSender';
import { AnnouncementSender } from '../components/AnnouncementSender';
import { ELEVATE_ADMIN_AVATAR_URL } from '../components/DefaultAvatar';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  user_type: string | null;
  profile_completed: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export function AdminDashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailSection, setUserDetailSection] = useState<'personal' | 'connected' | 'payment' | 'notifications'>('personal');
  const [adminProfileId, setAdminProfileId] = useState<string | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fetchingUsersRef = useRef(false); // Prevent multiple simultaneous requests
  const lastFetchedSectionRef = useRef<string | null>(null); // Track what section we last fetched for
  const { admin, logout, sessionToken, verifySession, isAuthenticated, isLoading } = useAdminAuth();
  const { adminFetch } = useAdmin();

  useEffect(() => {
    // Update session activity periodically
    const interval = setInterval(() => {
      // Session verification will update last_activity_at
      // This could be optimized to call a lightweight ping endpoint
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Get admin profile ID for chat and announcements
  useEffect(() => {
    const fetchAdminProfileId = async () => {
      if (admin && (activeSection === 'messages' || activeSection === 'alerts')) {
        const profileId = await getAdminId();
        if (profileId) {
          setAdminProfileId(profileId);
        }
      }
    };
    fetchAdminProfileId();
  }, [admin, activeSection]);

  // Fetch users when users section is active
  useEffect(() => {
    // Only fetch if we're on the users section
    if (activeSection !== 'users') {
      fetchingUsersRef.current = false;
      lastFetchedSectionRef.current = null;
      return;
    }

    // Prevent fetching if we already fetched for this section
    if (lastFetchedSectionRef.current === 'users') {
      console.log('⏸️ Already fetched users for this section, skipping...');
      return;
    }

    // Prevent multiple simultaneous requests
    if (fetchingUsersRef.current) {
      console.log('⏸️ Already fetching users, skipping...');
      return;
    }

      // Verify session first
      const checkSessionAndFetch = async () => {
        console.log('🔐 Session check:', {
          hasSessionToken: !!sessionToken,
          sessionTokenLength: sessionToken?.length || 0,
          isAuthenticated,
          hasAdmin: !!admin
        });

        // Check if we have a session token
        if (!sessionToken) {
          console.error('❌ No session token available');
          setUsersError('Session expired. Please log in again.');
          setUsersLoading(false);
          // Redirect to login after a delay
          setTimeout(() => {
            navigate('/admin/login');
          }, 2000);
          return;
        }

        // Verify session is still valid
        console.log('🔐 Verifying session before fetching users...');
        const sessionValid = await verifySession();
        console.log('🔐 Session verification result:', sessionValid);
        
        if (!sessionValid || !isAuthenticated) {
          console.error('❌ Session verification failed');
          setUsersError('Session expired. Redirecting to login...');
          setUsersLoading(false);
          setTimeout(() => {
            navigate('/admin/login');
          }, 2000);
          return;
        }

        console.log('✅ Session verified, proceeding with user fetch');

      // Don't fetch if adminFetch is not available
      if (!adminFetch) {
        console.error('adminFetch is not available');
        setUsersError('Admin authentication not available. Please log in again.');
        setUsersLoading(false);
        return;
      }

      // Mark that we're fetching
      fetchingUsersRef.current = true;
      lastFetchedSectionRef.current = 'users';

      const fetchUsers = async () => {
        console.log('🚀 Starting fetchUsers...');
        setUsersLoading(true);
        setUsersError(null);
        setUsers([]); // Clear previous users
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('⏱️ Request timeout after 30 seconds');
        setUsersError('Request timeout. Please check your connection and try again.');
        setUsersLoading(false);
        fetchingUsersRef.current = false;
      }, 30000);
      
      try {
        console.log('🔍 Fetching users...', {
          adminFetch: typeof adminFetch,
          sessionToken: sessionToken ? '✅' : '❌'
        });
        
        if (!adminFetch) {
          throw new Error('adminFetch is not available');
        }
        
        console.log('📡 Using adminFetch to get users...');
        
        const response = await adminFetch('admin-users', {
          method: 'GET',
        });
        
        clearTimeout(timeoutId);
        
        console.log('📦 Response received:', response);
        console.log('Response type:', typeof response);
        console.log('Response keys:', response ? Object.keys(response) : 'null');
        
        // Handle response - check for success explicitly
        if (response && response.success !== false) {
          // Check if response has users array
          if (response.success === false) {
            const errorMsg = response.message || 'Failed to fetch users';
            console.error('❌ API returned success: false', errorMsg);
            throw new Error(errorMsg);
          }
          
          // Try to get users from response
          const fetchedUsers = response.users || response.data || [];
          console.log('✅ Successfully fetched users:', fetchedUsers.length, 'users');
          console.log('👥 Users array:', fetchedUsers);
          console.log('Is array?', Array.isArray(fetchedUsers));
          
          if (Array.isArray(fetchedUsers)) {
            console.log('✅ Setting users state...');
            setUsers(fetchedUsers);
            setUsersError(null);
            setUsersLoading(false);
            lastFetchedSectionRef.current = 'users'; // Mark as fetched
            console.log('✅ Users state updated, loading cleared');
          } else {
            console.error('❌ Invalid response format - users is not an array:', typeof fetchedUsers, fetchedUsers);
            console.error('Full response:', response);
            throw new Error(`Invalid response format: users is not an array. Got: ${typeof fetchedUsers}`);
          }
        } else {
          const errorMsg = response?.message || 'Failed to fetch users';
          console.error('❌ Users fetch failed:', errorMsg, response);
          throw new Error(errorMsg);
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('❌ Error fetching users:', error);
        console.error('Error details:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        });
        
        let errorMsg = 'Failed to load users.';
        
        if (error?.name === 'AbortError') {
          errorMsg = 'Request timeout. The Edge Function may not be responding. Please check if admin-users Edge Function is deployed.';
        } else if (error?.message) {
          errorMsg = error.message;
          if (error.message.includes('404') || error.message.includes('Not Found')) {
            errorMsg = 'Edge Function not found. Please deploy the admin-users Edge Function in Supabase Dashboard → Edge Functions.';
          } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            errorMsg = 'Unauthorized. Please check your admin session and log in again.';
          } else if (error.message.includes('403') || error.message.includes('Permission')) {
            errorMsg = 'Permission denied. You do not have access to view users.';
          } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
            errorMsg = 'Network error: Unable to connect. Please check if the admin-users Edge Function is deployed and try refreshing the page.';
          }
        } else if (error instanceof TypeError) {
          errorMsg = 'Network error: Unable to connect to server. Please check if the admin-users Edge Function is deployed.';
        }
        
        setUsersError(errorMsg);
        setUsers([]);
        setUsersLoading(false);
        // Reset the section ref so user can retry
        lastFetchedSectionRef.current = null;
      } finally {
        // Always reset the fetching flag
          fetchingUsersRef.current = false;
        }
      };
      
      fetchUsers();
    };

    checkSessionAndFetch();

    // Cleanup: reset refs when component unmounts or section changes
    return () => {
      fetchingUsersRef.current = false;
      // Don't reset lastFetchedSectionRef here - let it persist so we don't refetch unnecessarily
    };
  }, [activeSection, adminFetch, sessionToken, verifySession, isAuthenticated, navigate]); // Include dependencies

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Show loading state while initializing
  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
        <AnimatedBarsLoader text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-20 md:pb-0" style={{ backgroundColor: '#111111' }}>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16" style={{ backgroundColor: '#111111', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img 
              src="/elevate_transparent_white_.png" 
              alt="ELEVATE" 
              className="h-20 sm:h-28 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate('/')}
            />
            <span className="inline-flex items-center justify-center px-1 py-0.5 text-[7px] sm:px-1.5 sm:text-[8px] font-medium uppercase tracking-wider text-white bg-[#1e1e1e] rounded border border-border/50 cursor-default transition-all duration-300 ease-out hover:bg-[#2a2a2a] hover:text-white hover:border-foreground/30 hover:shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:scale-105 select-none -ml-1">
              Admin
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {/* Applications Icon */}
            <div
              className={`messages-icon group ${activeSection === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveSection('applications')}
            >
              <div className="messages-icon-wrapper">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                  <rect x="12" y="8" width="24" height="32" rx="3" stroke="white" strokeWidth="2" fill="none" />
                  <path
                    d="M19 8V6C19 4.89543 19.8954 4 21 4H27C28.1046 4 29 4.89543 29 6V8"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                  <line x1="17" y1="16" x2="31" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
                  <line x1="17" y1="22" x2="28" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
                  <path
                    d="M18 30L22 34L30 26"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="20"
                    strokeDashoffset="20"
                    className="transition-all duration-500 ease-out group-hover:[stroke-dashoffset:0]"
                  />
                  <circle cx="36" cy="12" r="2" fill="white" className="opacity-0 scale-0 transition-all duration-300 delay-200 group-hover:opacity-100 group-hover:scale-100" />
                  <circle cx="40" cy="18" r="1.5" fill="white" className="opacity-0 scale-0 transition-all duration-300 delay-300 group-hover:opacity-70 group-hover:scale-100" />
                  <circle cx="38" cy="24" r="1" fill="white" className="opacity-0 scale-0 transition-all duration-300 delay-400 group-hover:opacity-50 group-hover:scale-100" />
                </svg>
              </div>
              <span className="label">Applications</span>
            </div>

            {/* Alerts Icon */}
            <div
              className={`messages-icon group ${activeSection === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveSection('alerts')}
            >
              <div className="messages-icon-wrapper">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                  <g className="transition-all duration-400 ease-out origin-center group-hover:translate-x-2 group-hover:-translate-y-1 group-hover:rotate-6">
                    <path d="M8 24L40 12L32 36L24 28L8 24Z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none" />
                    <path d="M8 24L40 12L24 28" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M24 28L32 36" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </g>
                  <g className="opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <path d="M4 22L10 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-70" />
                    <path d="M6 28L12 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                    <path d="M2 25L8 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-30" />
                  </g>
                  <g className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">
                    <circle cx="42" cy="10" r="1" fill="white" />
                    <path d="M44 8L46 6" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    <path d="M44 12L46 14" stroke="white" strokeWidth="1" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
              <span className="label">Alerts</span>
            </div>

            {/* Messages Icon */}
            <div
              className={`messages-icon group ${activeSection === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveSection('messages')}
            >
              <div className="messages-icon-wrapper">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="back-bubble" d="M32 12H18C14.6863 12 12 14.6863 12 18V26C12 29.3137 14.6863 32 18 32H20L24 36L28 32H32C35.3137 32 38 29.3137 38 26V18C38 14.6863 35.3137 12 32 12Z" stroke="white" strokeWidth="2.5" fill="none"/>
                  <path className="front-bubble" d="M30 20H16C13.2386 20 11 22.2386 11 25V31C11 33.7614 13.2386 36 16 36H18L21 40L24 36H30C32.7614 36 35 33.7614 35 31V25C35 22.2386 32.7614 20 30 20Z" stroke="white" strokeWidth="2.5" fill="rgba(0,0,0,0.8)"/>
                  <g className="dots">
                    <circle cx="17" cy="28" r="1.5" fill="white"/>
                    <circle cx="23" cy="28" r="1.5" fill="white"/>
                    <circle cx="29" cy="28" r="1.5" fill="white"/>
                  </g>
                </svg>
              </div>
              <span className="label">Messages</span>
            </div>

            {/* Users Icon */}
            <div
              className={`messages-icon group ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => setActiveSection('users')}
            >
              <div className="messages-icon-wrapper">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                  <g className="transition-transform duration-300 group-hover:scale-95">
                    <circle cx="12" cy="28" r="4" stroke="white" strokeWidth="1.5" fill="none" className="opacity-50" />
                    <path d="M6 42C6 38 8 36 12 36C16 36 18 38 18 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                    <circle cx="24" cy="26" r="5" stroke="white" strokeWidth="1.5" fill="none" className="opacity-70" />
                    <path d="M16 42C16 37 19 34 24 34C29 34 32 37 32 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-70" />
                    <circle cx="36" cy="28" r="4" stroke="white" strokeWidth="1.5" fill="none" className="opacity-50" />
                    <path d="M30 42C30 38 32 36 36 36C40 36 42 38 42 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                  </g>
                  <g className="transition-all duration-400 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110">
                    <circle cx="32" cy="14" r="8" stroke="white" strokeWidth="2.5" fill="black" className="fill-black/80" />
                    <path d="M38 20L44 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M28 11C29 10 31 10 32 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-60" />
                  </g>
                  <circle cx="24" cy="26" r="7" stroke="white" strokeWidth="1" fill="none" className="opacity-0 transition-opacity duration-300 group-hover:opacity-50" strokeDasharray="4 2" />
                </svg>
              </div>
              <span className="label">Users</span>
            </div>

            {/* Data Icon */}
            <div
              className={`messages-icon group ${activeSection === 'data' ? 'active' : ''}`}
              onClick={() => setActiveSection('data')}
            >
              <div className="messages-icon-wrapper">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                  <ellipse cx="24" cy="40" rx="16" ry="4" stroke="white" strokeWidth="2" fill="none" className="opacity-40" />
                  <ellipse cx="24" cy="36" rx="10" ry="3" stroke="white" strokeWidth="2" fill="none" className="transition-transform duration-300" />
                  <path d="M14 36V34C14 32.34 18.48 31 24 31C29.52 31 34 32.34 34 34V36" stroke="white" strokeWidth="2" className="transition-transform duration-300" />
                  <ellipse cx="24" cy="30" rx="10" ry="3" stroke="white" strokeWidth="2" fill="none" className="transition-transform duration-300 group-hover:-translate-y-1" />
                  <path d="M14 30V28C14 26.34 18.48 25 24 25C29.52 25 34 26.34 34 28V30" stroke="white" strokeWidth="2" className="transition-transform duration-300 group-hover:-translate-y-1" />
                  <ellipse cx="24" cy="24" rx="10" ry="3" stroke="white" strokeWidth="2" fill="none" className="transition-transform duration-300 group-hover:-translate-y-2" />
                  <path d="M14 24V22C14 20.34 18.48 19 24 19C29.52 19 34 20.34 34 22V24" stroke="white" strokeWidth="2" className="transition-transform duration-300 group-hover:-translate-y-2" />
                  <text x="24" y="23" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="transition-transform duration-300 group-hover:-translate-y-2">$</text>
                  <g className="opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 -translate-y-4">
                    <ellipse cx="24" cy="14" rx="8" ry="2.5" stroke="white" strokeWidth="2" fill="none" />
                    <text x="24" y="16" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">$</text>
                  </g>
                  <circle cx="38" cy="22" r="1.5" fill="white" className="opacity-0 group-hover:opacity-80 transition-opacity duration-300 animate-pulse" />
                  <circle cx="10" cy="28" r="1" fill="white" className="opacity-0 group-hover:opacity-60 transition-opacity duration-300 delay-100 animate-pulse" />
                </svg>
              </div>
              <span className="label">Data</span>
            </div>

            {/* Notifications Icon */}
            <div
              className={`messages-icon group ${activeSection === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSection('notifications')}
            >
              <div className="messages-icon-wrapper">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
                  <path
                    d="M24 8C18.4772 8 14 12.4772 14 18V26L10 32H38L34 26V18C34 12.4772 29.5228 8 24 8Z"
                    stroke="white"
                    strokeWidth="2.5"
                    fill="none"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                  <path
                    d="M20 36C20 38.2091 21.7909 40 24 40C26.2091 40 28 38.2091 28 36"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="transition-transform duration-300 group-hover:translate-y-1"
                  />
                  <circle
                    cx="32"
                    cy="18"
                    r="4"
                    fill="white"
                    className="opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
                  />
                </svg>
              </div>
              <span className="label">Notifications</span>
            </div>
          </nav>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 hover:brightness-110 cursor-pointer overflow-hidden relative"
              style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
            >
              <img
                src={ELEVATE_ADMIN_AVATAR_URL}
                alt="Admin profile"
                className="w-full h-full object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down"
                style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
              >
                <div className="p-6">
                  <div className="mb-5">
                    <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold tracking-wider mb-3" style={{ backgroundColor: '#111111', color: '#94A3B8' }}>
                      {admin?.role?.displayName?.toUpperCase() || 'ADMIN'}
                    </div>
                    <h3 className="text-xl font-bold mb-0.5" style={{ color: '#F8FAFC' }}>
                      Elevate
                    </h3>
                    <p className="text-sm" style={{ color: '#64748B' }}>
                      {admin?.email || 'No email'}
                    </p>
                  </div>

                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 py-3 px-4 text-sm font-bold transition-all duration-200 hover:opacity-70" style={{ color: '#F8FAFC' }}>
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>

                <div className="px-6 py-4 flex items-center gap-4 text-xs" style={{ color: '#64748B', borderTop: '1px solid #111111' }}>
                  <button className="transition-colors" style={{ color: '#64748B' }}>Privacy</button>
                  <button className="transition-colors" style={{ color: '#64748B' }}>Terms</button>
                  <button className="transition-colors" style={{ color: '#64748B' }}>Admin Terms</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t" style={{ backgroundColor: '#111111', borderColor: '#1a1a1e' }}>
        <div className="flex items-center justify-around px-4 py-2">
          {/* Applications Icon */}
          <div
            className={`messages-icon group ${activeSection === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveSection('applications')}
          >
            <div className="messages-icon-wrapper">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 overflow-visible">
                <rect x="12" y="8" width="24" height="32" rx="3" stroke="white" strokeWidth="2" fill="none" />
                <path
                  d="M19 8V6C19 4.89543 19.8954 4 21 4H27C28.1046 4 29 4.89543 29 6V8"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                />
                <line x1="17" y1="16" x2="31" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
                <line x1="17" y1="22" x2="28" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" className="opacity-50" />
                <path
                  d="M18 30L22 34L30 26"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="20"
                  strokeDashoffset="20"
                  className="transition-all duration-500 ease-out group-hover:[stroke-dashoffset:0]"
                />
                <circle cx="36" cy="12" r="2" fill="white" className="opacity-0 scale-0 transition-all duration-300 delay-200 group-hover:opacity-100 group-hover:scale-100" />
                <circle cx="40" cy="18" r="1.5" fill="white" className="opacity-0 scale-0 transition-all duration-300 delay-300 group-hover:opacity-70 group-hover:scale-100" />
                <circle cx="38" cy="24" r="1" fill="white" className="opacity-0 scale-0 transition-all duration-300 delay-400 group-hover:opacity-50 group-hover:scale-100" />
              </svg>
            </div>
            <span className="label">Applications</span>
          </div>

          {/* Alerts Icon */}
          <div
            className={`messages-icon group ${activeSection === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveSection('alerts')}
          >
            <div className="messages-icon-wrapper">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 overflow-visible">
                <g className="transition-all duration-400 ease-out origin-center group-hover:translate-x-2 group-hover:-translate-y-1 group-hover:rotate-6">
                  <path d="M8 24L40 12L32 36L24 28L8 24Z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none" />
                  <path d="M8 24L40 12L24 28" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M24 28L32 36" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </g>
                <g className="opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <path d="M4 22L10 24" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-70" />
                  <path d="M6 28L12 26" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                  <path d="M2 25L8 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-30" />
                </g>
                <g className="opacity-0 group-hover:opacity-100 transition-all duration-300 delay-150">
                  <circle cx="42" cy="10" r="1" fill="white" />
                  <path d="M44 8L46 6" stroke="white" strokeWidth="1" strokeLinecap="round" />
                  <path d="M44 12L46 14" stroke="white" strokeWidth="1" strokeLinecap="round" />
                </g>
              </svg>
            </div>
            <span className="label">Alerts</span>
          </div>

          {/* Messages Icon */}
          <div
            className={`messages-icon group ${activeSection === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveSection('messages')}
          >
            <div className="messages-icon-wrapper">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className="back-bubble" d="M32 12H18C14.6863 12 12 14.6863 12 18V26C12 29.3137 14.6863 32 18 32H20L24 36L28 32H32C35.3137 32 38 29.3137 38 26V18C38 14.6863 35.3137 12 32 12Z" stroke="white" strokeWidth="2.5" fill="none"/>
                <path className="front-bubble" d="M30 20H16C13.2386 20 11 22.2386 11 25V31C11 33.7614 13.2386 36 16 36H18L21 40L24 36H30C32.7614 36 35 33.7614 35 31V25C35 22.2386 32.7614 20 30 20Z" stroke="white" strokeWidth="2.5" fill="rgba(0,0,0,0.8)"/>
                <g className="dots">
                  <circle cx="17" cy="28" r="1.5" fill="white"/>
                  <circle cx="23" cy="28" r="1.5" fill="white"/>
                  <circle cx="29" cy="28" r="1.5" fill="white"/>
                </g>
              </svg>
            </div>
            <span className="label">Messages</span>
          </div>

          {/* Users Icon */}
          <div
            className={`messages-icon group ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <div className="messages-icon-wrapper">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 overflow-visible">
                <g className="transition-transform duration-300 group-hover:scale-95">
                  <circle cx="12" cy="28" r="4" stroke="white" strokeWidth="1.5" fill="none" className="opacity-50" />
                  <path d="M6 42C6 38 8 36 12 36C16 36 18 38 18 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                  <circle cx="24" cy="26" r="5" stroke="white" strokeWidth="1.5" fill="none" className="opacity-70" />
                  <path d="M16 42C16 37 19 34 24 34C29 34 32 37 32 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-70" />
                  <circle cx="36" cy="28" r="4" stroke="white" strokeWidth="1.5" fill="none" className="opacity-50" />
                  <path d="M30 42C30 38 32 36 36 36C40 36 42 38 42 42" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-50" />
                </g>
                <g className="transition-all duration-400 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110">
                  <circle cx="32" cy="14" r="8" stroke="white" strokeWidth="2.5" fill="black" className="fill-black/80" />
                  <path d="M38 20L44 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M28 11C29 10 31 10 32 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" className="opacity-60" />
                </g>
                <circle cx="24" cy="26" r="7" stroke="white" strokeWidth="1" fill="none" className="opacity-0 transition-opacity duration-300 group-hover:opacity-50" strokeDasharray="4 2" />
              </svg>
            </div>
            <span className="label">Users</span>
          </div>

          {/* Data Icon */}
          <div
            className={`messages-icon group ${activeSection === 'data' ? 'active' : ''}`}
            onClick={() => setActiveSection('data')}
          >
            <div className="messages-icon-wrapper">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 overflow-visible">
                <ellipse cx="24" cy="40" rx="16" ry="4" stroke="white" strokeWidth="2" fill="none" className="opacity-40" />
                <ellipse cx="24" cy="36" rx="10" ry="3" stroke="white" strokeWidth="2" fill="none" className="transition-transform duration-300" />
                <path d="M14 36V34C14 32.34 18.48 31 24 31C29.52 31 34 32.34 34 34V36" stroke="white" strokeWidth="2" className="transition-transform duration-300" />
                <ellipse cx="24" cy="30" rx="10" ry="3" stroke="white" strokeWidth="2" fill="none" className="transition-transform duration-300 group-hover:-translate-y-1" />
                <path d="M14 30V28C14 26.34 18.48 25 24 25C29.52 25 34 26.34 34 28V30" stroke="white" strokeWidth="2" className="transition-transform duration-300 group-hover:-translate-y-1" />
                <ellipse cx="24" cy="24" rx="10" ry="3" stroke="white" strokeWidth="2" fill="none" className="transition-transform duration-300 group-hover:-translate-y-2" />
                <path d="M14 24V22C14 20.34 18.48 19 24 19C29.52 19 34 20.34 34 22V24" stroke="white" strokeWidth="2" className="transition-transform duration-300 group-hover:-translate-y-2" />
                <text x="24" y="23" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" className="transition-transform duration-300 group-hover:-translate-y-2">$</text>
                <g className="opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 -translate-y-4">
                  <ellipse cx="24" cy="14" rx="8" ry="2.5" stroke="white" strokeWidth="2" fill="none" />
                  <text x="24" y="16" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">$</text>
                </g>
                <circle cx="38" cy="22" r="1.5" fill="white" className="opacity-0 group-hover:opacity-80 transition-opacity duration-300 animate-pulse" />
                <circle cx="10" cy="28" r="1" fill="white" className="opacity-0 group-hover:opacity-60 transition-opacity duration-300 delay-100 animate-pulse" />
              </svg>
            </div>
            <span className="label">Data</span>
          </div>

          {/* Notifications Icon */}
          <div
            className={`messages-icon group ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveSection('notifications')}
          >
            <div className="messages-icon-wrapper">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 overflow-visible">
                <path
                  d="M24 8C18.4772 8 14 12.4772 14 18V26L10 32H38L34 26V18C34 12.4772 29.5228 8 24 8Z"
                  stroke="white"
                  strokeWidth="2.5"
                  fill="none"
                  className="transition-transform duration-300 group-hover:scale-105"
                />
                <path
                  d="M20 36C20 38.2091 21.7909 40 24 40C26.2091 40 28 38.2091 28 36"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-transform duration-300 group-hover:translate-y-1"
                />
                <circle
                  cx="32"
                  cy="18"
                  r="4"
                  fill="white"
                  className="opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
                />
              </svg>
            </div>
            <span className="label">Notifications</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12 pt-20 sm:pt-24">
        {activeSection === 'applications' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in">
            <div className="text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: '#1a1a1e' }}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: '#F8FAFC' }}>No applications yet</h3>
              <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Pending applications will appear here</p>
            </div>
          </div>
        )}

        {activeSection === 'alerts' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            {adminProfileId ? (
              <AnnouncementSender adminId={adminProfileId} />
            ) : (
              <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <AnimatedBarsLoader text="Loading..." />
              </div>
            )}
          </div>
        )}

        {activeSection === 'messages' && (
          adminProfileId ? (
            <AdminMessagesPage currentAdminId={adminProfileId} />
          ) : (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '300ms' }} />
              </div>
            </div>
          )
        )}

        {activeSection === 'users' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>All Users</h2>
                {users.length > 0 && (
                  <span className="text-sm font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: '#1a1a1e', color: '#64748B' }}>
                    {users.length} {users.length === 1 ? 'user' : 'users'}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>View and manage all registered users (Creators, Artists, Business)</p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs" style={{ color: '#64748B' }}>
                  Debug: Loading={usersLoading ? 'true' : 'false'}, Users={users.length}, Error={usersError || 'none'}
                </div>
              )}
            </div>

            {usersLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <AnimatedBarsLoader text="Loading users..." />
              </div>
            ) : usersError ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: '#1a1a1e' }}>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: '#F8FAFC' }}>Error Loading Users</h3>
                  <p className="text-sm sm:text-base mb-4" style={{ color: '#94A3B8' }}>{usersError}</p>
                  {usersError?.includes('Session expired') || usersError?.includes('Invalid or expired session') ? (
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => {
                          navigate('/admin/login');
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                        style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC', border: '1px solid #0f0f13' }}
                      >
                        Go to Login
                      </button>
                      <button
                        onClick={async () => {
                          // Try to refresh session
                          const refreshed = await verifySession();
                          if (refreshed) {
                            // Reset flags and retry
                            fetchingUsersRef.current = false;
                            lastFetchedSectionRef.current = null;
                            setUsersError(null);
                            // Trigger useEffect by changing a dependency
                            setActiveSection('home');
                            setTimeout(() => setActiveSection('users'), 100);
                          } else {
                            navigate('/admin/login');
                          }
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                        style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC', border: '1px solid #0f0f13' }}
                      >
                        Refresh Session
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        // Reset flags to allow retry
                        fetchingUsersRef.current = false;
                        lastFetchedSectionRef.current = null;
                        setUsersError(null);
                        // Trigger fetch by setting loading state and calling fetch
                        if (activeSection === 'users' && adminFetch) {
                          const fetchUsers = async () => {
                            fetchingUsersRef.current = true;
                            setUsersLoading(true);
                            setUsersError(null);
                            try {
                              const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                              const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                              
                              const directResponse = await fetch(`${supabaseUrl}/functions/v1/admin-users`, {
                                method: 'GET',
                                headers: {
                                  'Authorization': `Bearer ${supabaseAnonKey}`,
                                  'Content-Type': 'application/json',
                                  'X-Session-Token': sessionToken || '',
                                },
                              });
                              
                              const responseText = await directResponse.text();
                              const response = JSON.parse(responseText);
                              
                              if (directResponse.ok && response && response.success !== false) {
                                const fetchedUsers = response.users || [];
                                if (Array.isArray(fetchedUsers)) {
                                  setUsers(fetchedUsers);
                                  setUsersError(null);
                                  lastFetchedSectionRef.current = 'users';
                                } else {
                                  throw new Error('Invalid response format');
                                }
                              } else {
                                throw new Error(response?.message || `HTTP ${directResponse.status}`);
                              }
                            } catch (error: any) {
                              setUsersError(error?.message || 'Failed to load users');
                              setUsers([]);
                              lastFetchedSectionRef.current = null;
                            } finally {
                              setUsersLoading(false);
                              fetchingUsersRef.current = false;
                            }
                          };
                          fetchUsers();
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                      style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC', border: '1px solid #0f0f13' }}
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ) : users.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: '#1a1a1e' }}>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: '#F8FAFC' }}>No users found</h3>
                  <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>User data will appear here</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a1e' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: '#0f0f13' }}>
                        <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Email</th>
                        <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Name</th>
                        <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Username</th>
                        <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Type</th>
                        <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Status</th>
                        <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: '#64748B' }}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr 
                          key={user.id} 
                          onClick={() => {
                            setSelectedUser(user);
                            setUserDetailSection('personal');
                          }}
                          className="border-b transition-colors hover:brightness-105 cursor-pointer" 
                          style={{ borderColor: index === users.length - 1 ? 'transparent' : '#0f0f13' }}
                        >
                          <td className="py-4 px-4 sm:px-6">
                            <div className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{user.email}</div>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <div className="text-sm" style={{ color: user.full_name ? '#F8FAFC' : '#64748B' }}>
                              {user.full_name || '—'}
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <div className="text-sm" style={{ color: user.username ? '#F8FAFC' : '#64748B' }}>
                              {user.username || '—'}
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <div className="text-sm" style={{ color: user.user_type ? '#F8FAFC' : '#64748B' }}>
                              {user.user_type ? user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1) : '—'}
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-2">
                              {user.verified && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#0f0f13', color: '#10b981' }}>
                                  Verified
                                </span>
                              )}
                              {user.profile_completed && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#0f0f13', color: '#3b82f6' }}>
                                  Complete
                                </span>
                              )}
                              {!user.verified && !user.profile_completed && (
                                <span className="text-xs" style={{ color: '#64748B' }}>Pending</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <div className="text-sm" style={{ color: '#64748B' }}>{formatDate(user.created_at)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'data' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in">
            <div className="text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: '#1a1a1e' }}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: '#F8FAFC' }}>No data yet</h3>
              <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Revenue and analytics data will appear here</p>
            </div>
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedUser(null)}
          />
          
          {/* Centered Modal */}
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
          >
            <div 
              className="w-full max-w-4xl h-[75vh] rounded-2xl overflow-hidden flex animate-scale-in"
              style={{ backgroundColor: '#0f0f13' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Left Navigation Sidebar */}
              <div className="w-64 flex-shrink-0 p-6" style={{ backgroundColor: '#1a1a1e' }}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-lg transition-colors hover:brightness-110"
                    style={{ backgroundColor: '#0f0f13', color: '#F8FAFC' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => setUserDetailSection('personal')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      userDetailSection === 'personal' ? '' : 'hover:brightness-110'
                    }`}
                    style={{
                      backgroundColor: userDetailSection === 'personal' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium">Personal info</span>
                  </button>

                  <button
                    onClick={() => setUserDetailSection('connected')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      userDetailSection === 'connected' ? '' : 'hover:brightness-110'
                    }`}
                    style={{
                      backgroundColor: userDetailSection === 'connected' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    <Link2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Connected accounts</span>
                  </button>

                  <button
                    onClick={() => setUserDetailSection('payment')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      userDetailSection === 'payment' ? '' : 'hover:brightness-110'
                    }`}
                    style={{
                      backgroundColor: userDetailSection === 'payment' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm font-medium">Payment Method</span>
                  </button>

                  <button
                    onClick={() => setUserDetailSection('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      userDetailSection === 'notifications' ? '' : 'hover:brightness-110'
                    }`}
                    style={{
                      backgroundColor: userDetailSection === 'notifications' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="text-sm font-medium">Notifications</span>
                  </button>
                </nav>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {userDetailSection === 'personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>Personal Information</h3>
                      <p className="text-sm" style={{ color: '#64748B' }}>View and manage user's personal details</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1a1e' }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>Basic Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#64748B' }}>Email</label>
                          <p className="text-sm" style={{ color: '#F8FAFC' }}>{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#64748B' }}>Full Name</label>
                          <p className="text-sm" style={{ color: selectedUser.full_name ? '#F8FAFC' : '#64748B' }}>
                            {selectedUser.full_name || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#64748B' }}>Username</label>
                          <p className="text-sm" style={{ color: selectedUser.username ? '#F8FAFC' : '#64748B' }}>
                            {selectedUser.username || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#64748B' }}>User Type</label>
                          <p className="text-sm" style={{ color: '#F8FAFC' }}>
                            {selectedUser.user_type ? selectedUser.user_type.charAt(0).toUpperCase() + selectedUser.user_type.slice(1) : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1a1e' }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>Status</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: '#64748B' }}>Account Status</label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedUser.verified && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: '#0f0f13', color: '#10b981' }}>
                                Verified
                              </span>
                            )}
                            {selectedUser.profile_completed && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: '#0f0f13', color: '#3b82f6' }}>
                                Profile Complete
                              </span>
                            )}
                            {!selectedUser.verified && !selectedUser.profile_completed && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: '#0f0f13', color: '#64748B' }}>
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1a1e' }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>Account Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#64748B' }}>User ID</label>
                          <p className="text-sm font-mono break-all" style={{ color: '#64748B' }}>{selectedUser.id}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#64748B' }}>Created At</label>
                          <p className="text-sm" style={{ color: '#F8FAFC' }}>{formatDate(selectedUser.created_at)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: '#64748B' }}>Last Updated</label>
                          <p className="text-sm" style={{ color: '#F8FAFC' }}>{formatDate(selectedUser.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userDetailSection === 'connected' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>Connected Accounts</h3>
                      <p className="text-sm" style={{ color: '#64748B' }}>View user's connected social media and third-party accounts</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1a1e' }}>
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#0f0f13' }}>
                            <Link2 className="w-8 h-8" style={{ color: '#64748B' }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: '#F8FAFC' }}>No connected accounts</h4>
                          <p className="text-sm" style={{ color: '#64748B' }}>This user hasn't connected any external accounts yet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userDetailSection === 'payment' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>Payment Method</h3>
                      <p className="text-sm" style={{ color: '#64748B' }}>View user's payment and payout methods</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1a1e' }}>
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#0f0f13' }}>
                            <CreditCard className="w-8 h-8" style={{ color: '#64748B' }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: '#F8FAFC' }}>No payment methods</h4>
                          <p className="text-sm" style={{ color: '#64748B' }}>This user hasn't added any payment methods yet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userDetailSection === 'notifications' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>Notifications</h3>
                      <p className="text-sm" style={{ color: '#64748B' }}>View user's notification preferences and history</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: '#1a1a1e' }}>
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#0f0f13' }}>
                            <Bell className="w-8 h-8" style={{ color: '#64748B' }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: '#F8FAFC' }}>No notifications</h4>
                          <p className="text-sm" style={{ color: '#64748B' }}>No notification history available for this user</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
