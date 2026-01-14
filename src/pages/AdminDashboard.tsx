import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Link2, CreditCard, Bell } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { AnimatedBarsLoader } from '../components/AnimatedBarsLoader';
import { AdminMessagesPage } from './AdminMessagesPage';
import { getAdminId } from '../hooks/useChat';
import { AnnouncementSender } from '../components/AnnouncementSender';
import { ELEVATE_ADMIN_AVATAR_URL } from '../components/DefaultAvatar';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { SettingsView } from '../components/SettingsView';
import { useTheme } from '../contexts/ThemeContext';
import { themeTokens } from '../lib/themeTokens';
import type { Theme } from '../lib/themeTokens';

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
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, setTheme, tokens } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailSection, setUserDetailSection] = useState<'personal' | 'connected' | 'payment' | 'notifications'>('personal');
  const [adminProfileId, setAdminProfileId] = useState<string | null>(null);
  const navigate = useNavigate();
  const fetchingUsersRef = useRef(false);
  const lastFetchedSectionRef = useRef<string | null>(null);
  const { admin, sessionToken, verifySession, isAuthenticated, isLoading } = useAdminAuth();
  const { adminFetch } = useAdmin();

  useEffect(() => {
    const interval = setInterval(() => {
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (activeSection !== 'users') {
      fetchingUsersRef.current = false;
      lastFetchedSectionRef.current = null;
      return;
    }

    if (lastFetchedSectionRef.current === 'users') {
      return;
    }

    if (fetchingUsersRef.current) {
      return;
    }

    const checkSessionAndFetch = async () => {
      if (!sessionToken) {
        setUsersError('Session expired. Please log in again.');
        setUsersLoading(false);
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
        return;
      }

      const sessionValid = await verifySession();
      
      if (!sessionValid || !isAuthenticated) {
        setUsersError('Session expired. Redirecting to login...');
        setUsersLoading(false);
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
        return;
      }

      if (!adminFetch) {
        setUsersError('Admin authentication not available. Please log in again.');
        setUsersLoading(false);
        return;
      }

      fetchingUsersRef.current = true;
      lastFetchedSectionRef.current = 'users';

      const fetchUsers = async () => {
        setUsersLoading(true);
        setUsersError(null);
        setUsers([]);
      
        const timeoutId = setTimeout(() => {
          setUsersError('Request timeout. Please check your connection and try again.');
          setUsersLoading(false);
          fetchingUsersRef.current = false;
        }, 30000);
      
        try {
          const response = await adminFetch('admin-users', {
            method: 'GET',
          });
          
          clearTimeout(timeoutId);
          
          if (response && response.success !== false) {
            const fetchedUsers = response.users || response.data || [];
            
            if (Array.isArray(fetchedUsers)) {
              setUsers(fetchedUsers);
              setUsersError(null);
              setUsersLoading(false);
              lastFetchedSectionRef.current = 'users';
            } else {
              throw new Error(`Invalid response format: users is not an array.`);
            }
          } else {
            const errorMsg = response?.message || 'Failed to fetch users';
            throw new Error(errorMsg);
          }
        } catch (error: any) {
          clearTimeout(timeoutId);
          
          let errorMsg = 'Failed to load users.';
          
          if (error?.name === 'AbortError') {
            errorMsg = 'Request timeout. The Edge Function may not be responding.';
          } else if (error?.message) {
            errorMsg = error.message;
            if (error.message.includes('404') || error.message.includes('Not Found')) {
              errorMsg = 'Edge Function not found. Please deploy the admin-users Edge Function.';
            } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
              errorMsg = 'Unauthorized. Please check your admin session and log in again.';
            } else if (error.message.includes('403') || error.message.includes('Permission')) {
              errorMsg = 'Permission denied. You do not have access to view users.';
            } else if (error.message.includes('Failed to fetch')) {
              errorMsg = 'Network error: Unable to connect.';
            }
          }
          
          setUsersError(errorMsg);
          setUsers([]);
          setUsersLoading(false);
          lastFetchedSectionRef.current = null;
        } finally {
          fetchingUsersRef.current = false;
        }
      };
      
      fetchUsers();
    };

    checkSessionAndFetch();

    return () => {
      fetchingUsersRef.current = false;
    };
  }, [activeSection, adminFetch, sessionToken, verifySession, isAuthenticated, navigate]);

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

  if (isLoading || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: tokens.bg.primary }}>
        <AnimatedBarsLoader text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex transition-colors duration-300" style={{ backgroundColor: tokens.bg.primary }}>
      {/* Left Sidebar - Desktop Only */}
      <CollapsibleSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userProfile={null}
        unreadCount={0}
        cachedProfilePic={ELEVATE_ADMIN_AVATAR_URL}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        userType="admin"
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        unreadCount={0}
        profilePicture={ELEVATE_ADMIN_AVATAR_URL}
        backgroundTheme={theme}
        userType="admin"
      />

      {/* Main Content Area */}
      <main 
        className={`flex-1 min-h-screen pb-20 lg:pb-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[240px]'}`}
        style={{ backgroundColor: tokens.bg.primary }}
      >
        {/* Messages Section - Full width */}
        {activeSection === 'messages' && (
          <div className="animate-fade-in flex-1 flex flex-col min-h-0 overflow-hidden h-[calc(100vh-80px)] lg:h-screen">
            {adminProfileId ? (
              <AdminMessagesPage currentAdminId={adminProfileId} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tokens.text.muted, animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tokens.text.muted, animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tokens.text.muted, animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other sections inside wrapper */}
        {activeSection !== 'messages' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
            {activeSection === 'home' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: tokens.text.primary }}>Welcome back, Admin</h1>
                  <p className="text-base" style={{ color: tokens.text.secondary }}>Manage your platform from here</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="rounded-xl p-6" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>Applications</h3>
                    <p className="text-sm" style={{ color: tokens.text.secondary }}>Review pending creator applications</p>
                  </div>
                  <div className="rounded-xl p-6" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>Users</h3>
                    <p className="text-sm" style={{ color: tokens.text.secondary }}>Manage all registered users</p>
                  </div>
                  <div className="rounded-xl p-6" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>Alerts</h3>
                    <p className="text-sm" style={{ color: tokens.text.secondary }}>Send announcements to users</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'applications' && (
              <div className="flex items-center justify-center min-h-[calc(100vh-200px)] animate-fade-in">
                <div className="text-center px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: tokens.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: tokens.text.primary }}>No applications yet</h3>
                  <p className="text-sm sm:text-base" style={{ color: tokens.text.secondary }}>Pending applications will appear here</p>
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

            {activeSection === 'users' && (
              <div className="animate-fade-in">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: tokens.text.primary }}>All Users</h2>
                    {users.length > 0 && (
                      <span className="text-sm font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: tokens.bg.active, color: tokens.text.muted }}>
                        {users.length} {users.length === 1 ? 'user' : 'users'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base" style={{ color: tokens.text.secondary }}>View and manage all registered users (Creators, Artists, Business)</p>
                </div>

                {usersLoading ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <AnimatedBarsLoader text="Loading users..." />
                  </div>
                ) : usersError ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                        <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: tokens.text.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: tokens.text.primary }}>Error Loading Users</h3>
                      <p className="text-sm sm:text-base mb-4" style={{ color: tokens.text.secondary }}>{usersError}</p>
                      <button
                        onClick={() => {
                          fetchingUsersRef.current = false;
                          lastFetchedSectionRef.current = null;
                          setUsersError(null);
                          setActiveSection('home');
                          setTimeout(() => setActiveSection('users'), 100);
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                        style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                        <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: tokens.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: tokens.text.primary }}>No users found</h3>
                      <p className="text-sm sm:text-base" style={{ color: tokens.text.secondary }}>User data will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ backgroundColor: tokens.bg.elevated }}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b" style={{ borderColor: tokens.border.subtle }}>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.muted }}>Email</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.muted }}>Name</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.muted }}>Username</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.muted }}>Type</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.muted }}>Status</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.muted }}>Created</th>
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
                              style={{ borderColor: index === users.length - 1 ? 'transparent' : tokens.border.default }}
                            >
                              <td className="py-4 px-4 sm:px-6">
                                <div className="text-sm font-medium" style={{ color: tokens.text.primary }}>{user.email}</div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="text-sm" style={{ color: user.full_name ? tokens.text.primary : tokens.text.muted }}>
                                  {user.full_name || '—'}
                                </div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="text-sm" style={{ color: user.username ? tokens.text.primary : tokens.text.muted }}>
                                  {user.username || '—'}
                                </div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="text-sm" style={{ color: user.user_type ? tokens.text.primary : tokens.text.muted }}>
                                  {user.user_type ? user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1) : '—'}
                                </div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="flex items-center gap-2">
                                  {user.verified && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: tokens.bg.active, color: '#10b981' }}>
                                      Verified
                                    </span>
                                  )}
                                  {user.profile_completed && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: tokens.bg.active, color: '#3b82f6' }}>
                                      Complete
                                    </span>
                                  )}
                                  {!user.verified && !user.profile_completed && (
                                    <span className="text-xs" style={{ color: tokens.text.muted }}>Pending</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="text-sm" style={{ color: tokens.text.muted }}>{formatDate(user.created_at)}</div>
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
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: tokens.text.muted }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: tokens.text.primary }}>No data yet</h3>
                  <p className="text-sm sm:text-base" style={{ color: tokens.text.secondary }}>Revenue and analytics data will appear here</p>
                </div>
              </div>
            )}

            {activeSection === 'settings' && (
              <>
                {/* Mobile Settings View */}
                <div className="lg:hidden px-4 pt-4">
                  <SettingsView
                    renderPersonalInfo={() => <div></div>}
                    renderConnectedAccounts={() => <div></div>}
                    renderPayoutMethods={() => <div></div>}
                    renderDisplay={() => (
                      <div className="space-y-6 lg:space-y-8">
                        {/* Preview Section */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Preview</h3>
                          <div 
                            className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border transition-all duration-300"
                            style={{ 
                              backgroundColor: theme === 'light' ? themeTokens.light.bg.primary : theme === 'grey' ? themeTokens.grey.bg.primary : themeTokens.dark.bg.primary, 
                              borderColor: theme === 'light' ? themeTokens.light.border.subtle : theme === 'grey' ? themeTokens.grey.border.subtle : themeTokens.dark.border.subtle
                            }}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div 
                                className="w-10 h-10 rounded-full overflow-hidden"
                                style={{ 
                                  backgroundColor: theme === 'light' ? themeTokens.light.bg.elevated : theme === 'grey' ? themeTokens.grey.bg.elevated : themeTokens.dark.bg.elevated,
                                }}
                              >
                                <img
                                  src={ELEVATE_ADMIN_AVATAR_URL}
                                  alt="Elevate"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0 flex items-center">
                                <h4 className="font-semibold text-white">Elevate</h4>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="mb-3 text-white">
                                Explore opportunities to earn, invest, and connect with top talent. Elevate brings everything you need to scale and succeed into one unified ecosystem.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Background Selector */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Background Theme</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Navy Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'light' ? 'border-blue-500' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#0F172A' }}
                              onClick={() => setTheme('light')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'light' 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'bg-white border-gray-400'
                                }`}>
                                  {theme === 'light' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg bg-blue-900 mb-2"></div>
                                <div className="h-2 bg-blue-800 rounded w-3/4 mb-2"></div>
                                <div className="h-2 bg-blue-800 rounded w-1/2"></div>
                              </div>
                              
                              <h4 className="font-semibold text-white mb-1">Navy</h4>
                              <p className="text-sm text-gray-400">Default color scheme</p>
                            </div>

                            {/* Grey Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'grey' ? 'border-blue-500' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#1A1A1E' }}
                              onClick={() => setTheme('grey')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'grey' 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'bg-white border-gray-400'
                                }`}>
                                  {theme === 'grey' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg bg-gray-800 mb-2"></div>
                                <div className="h-2 bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                              </div>
                              
                              <h4 className="font-semibold text-white mb-1">Grey</h4>
                              <p className="text-sm text-gray-400">Dim background</p>
                            </div>

                            {/* Dark Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'dark' ? 'border-blue-500' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#000000' }}
                              onClick={() => setTheme('dark')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'dark' 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'bg-white border-gray-400'
                                }`}>
                                  {theme === 'dark' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg bg-gray-900 mb-2"></div>
                                <div className="h-2 bg-gray-800 rounded w-3/4 mb-2"></div>
                                <div className="h-2 bg-gray-800 rounded w-1/2"></div>
                              </div>
                              
                              <h4 className="font-semibold text-white mb-1">Dark</h4>
                              <p className="text-sm text-gray-400">Pure black background (default)</p>
                            </div>
                          </div>
                        </div>

                        {/* Sidebar Section */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Sidebar</h3>
                          <div className="space-y-3 lg:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 lg:pb-6 border-b" style={{ borderColor: tokens.border.subtle }}>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-base font-semibold mb-1" style={{ color: tokens.text.primary }}>Collapse sidebar</h4>
                                <p className="text-sm" style={{ color: tokens.text.secondary }}>Minimize the sidebar to show only icons</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                                style={{ backgroundColor: sidebarCollapsed ? tokens.bg.active : tokens.bg.elevated }}
                              >
                                <span
                                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                  style={{ transform: sidebarCollapsed ? 'translateX(1.25rem)' : 'translateX(0.25rem)' }}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    renderLanguages={() => <div></div>}
                    renderNotifications={() => <div></div>}
                    renderSendFeedback={() => <div></div>}
                    renderLogOut={() => (
                      <div className="px-4 py-8">
                        <div className="max-w-md">
                          <button
                            onClick={() => {
                              // Handle logout logic here
                              window.location.href = '/admin/login';
                            }}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                          >
                            Log Out
                          </button>
                        </div>
                      </div>
                    )}
                    isMobile={true}
                    onBack={() => setActiveSection('home')}
                    userType="admin"
                    appliedTheme={theme}
                  />
                </div>

                {/* Desktop Settings View - Twitter/X Style */}
                <div className="hidden lg:block">
                  <SettingsView
                    renderPersonalInfo={() => <div></div>}
                    renderConnectedAccounts={() => <div></div>}
                    renderPayoutMethods={() => <div></div>}
                    renderDisplay={() => (
                      <div className="space-y-6 lg:space-y-8">
                        {/* Preview Section */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Preview</h3>
                          <div 
                            className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border transition-all duration-300"
                            style={{ 
                              backgroundColor: theme === 'light' ? themeTokens.light.bg.primary : theme === 'grey' ? themeTokens.grey.bg.primary : themeTokens.dark.bg.primary, 
                              borderColor: theme === 'light' ? themeTokens.light.border.subtle : theme === 'grey' ? themeTokens.grey.border.subtle : themeTokens.dark.border.subtle
                            }}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div 
                                className="w-10 h-10 rounded-full overflow-hidden"
                                style={{ 
                                  backgroundColor: theme === 'light' ? themeTokens.light.bg.elevated : theme === 'grey' ? themeTokens.grey.bg.elevated : themeTokens.dark.bg.elevated,
                                }}
                              >
                                <img
                                  src={ELEVATE_ADMIN_AVATAR_URL}
                                  alt="Elevate"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0 flex items-center">
                                <h4 className="font-semibold text-white">Elevate</h4>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="mb-3 text-white">
                                Explore opportunities to earn, invest, and connect with top talent. Elevate brings everything you need to scale and succeed into one unified ecosystem.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Background Selector */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Background Theme</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Navy Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'light' ? 'border-blue-500' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#0F172A' }}
                              onClick={() => setTheme('light')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'light' 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'bg-white border-gray-400'
                                }`}>
                                  {theme === 'light' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg bg-blue-900 mb-2"></div>
                                <div className="h-2 bg-blue-800 rounded w-3/4 mb-2"></div>
                                <div className="h-2 bg-blue-800 rounded w-1/2"></div>
                              </div>
                              
                              <h4 className="font-semibold text-white mb-1">Navy</h4>
                              <p className="text-sm text-gray-400">Default color scheme</p>
                            </div>

                            {/* Grey Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'grey' ? 'border-blue-500' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#1A1A1E' }}
                              onClick={() => setTheme('grey')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'grey' 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'bg-white border-gray-400'
                                }`}>
                                  {theme === 'grey' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg bg-gray-800 mb-2"></div>
                                <div className="h-2 bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                              </div>
                              
                              <h4 className="font-semibold text-white mb-1">Grey</h4>
                              <p className="text-sm text-gray-400">Dim background</p>
                            </div>

                            {/* Dark Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'dark' ? 'border-blue-500' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#000000' }}
                              onClick={() => setTheme('dark')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'dark' 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'bg-white border-gray-400'
                                }`}>
                                  {theme === 'dark' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg bg-gray-900 mb-2"></div>
                                <div className="h-2 bg-gray-800 rounded w-3/4 mb-2"></div>
                                <div className="h-2 bg-gray-800 rounded w-1/2"></div>
                              </div>
                              
                              <h4 className="font-semibold text-white mb-1">Dark</h4>
                              <p className="text-sm text-gray-400">Pure black background (default)</p>
                            </div>
                          </div>
                        </div>

                        {/* Sidebar Section */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Sidebar</h3>
                          <div className="space-y-3 lg:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 lg:pb-6 border-b" style={{ borderColor: tokens.border.subtle }}>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-base font-semibold mb-1" style={{ color: tokens.text.primary }}>Collapse sidebar</h4>
                                <p className="text-sm" style={{ color: tokens.text.secondary }}>Minimize the sidebar to show only icons</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                                style={{ backgroundColor: sidebarCollapsed ? tokens.bg.active : tokens.bg.elevated }}
                              >
                                <span
                                  className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                  style={{ transform: sidebarCollapsed ? 'translateX(1.25rem)' : 'translateX(0.25rem)' }}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    renderLanguages={() => <div></div>}
                    renderNotifications={() => <div></div>}
                    renderSendFeedback={() => <div></div>}
                    renderLogOut={() => (
                      <div className="px-4 py-8">
                        <div className="max-w-md">
                          <button
                            onClick={() => {
                              // Handle logout logic here
                              window.location.href = '/admin/login';
                            }}
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                          >
                            Log Out
                          </button>
                        </div>
                      </div>
                    )}
                    userType="admin"
                    appliedTheme={theme}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedUser(null)}
          />
          
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
          >
            <div 
              className="w-full max-w-4xl h-[75vh] rounded-2xl overflow-hidden flex animate-scale-in"
              style={{ backgroundColor: tokens.bg.modal }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-64 flex-shrink-0 p-6" style={{ backgroundColor: tokens.bg.elevated }}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold" style={{ color: tokens.text.primary }}>User Details</h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-lg transition-colors hover:brightness-110"
                    style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary }}
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
                      backgroundColor: userDetailSection === 'personal' ? tokens.bg.active : 'transparent',
                      color: tokens.text.primary
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
                      backgroundColor: userDetailSection === 'connected' ? tokens.bg.active : 'transparent',
                      color: tokens.text.primary
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
                      backgroundColor: userDetailSection === 'payment' ? tokens.bg.active : 'transparent',
                      color: tokens.text.primary
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
                      backgroundColor: userDetailSection === 'notifications' ? tokens.bg.active : 'transparent',
                      color: tokens.text.primary
                    }}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="text-sm font-medium">Notifications</span>
                  </button>
                </nav>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {userDetailSection === 'personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Personal Information</h3>
                      <p className="text-sm" style={{ color: tokens.text.muted }}>View and manage user's personal details</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: tokens.text.primary }}>Basic Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.muted }}>Email</label>
                          <p className="text-sm" style={{ color: tokens.text.primary }}>{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.muted }}>Full Name</label>
                          <p className="text-sm" style={{ color: selectedUser.full_name ? tokens.text.primary : tokens.text.muted }}>
                            {selectedUser.full_name || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.muted }}>Username</label>
                          <p className="text-sm" style={{ color: selectedUser.username ? tokens.text.primary : tokens.text.muted }}>
                            {selectedUser.username || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.muted }}>User Type</label>
                          <p className="text-sm" style={{ color: tokens.text.primary }}>
                            {selectedUser.user_type ? selectedUser.user_type.charAt(0).toUpperCase() + selectedUser.user_type.slice(1) : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: tokens.text.primary }}>Status</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: tokens.text.muted }}>Account Status</label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedUser.verified && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: tokens.bg.active, color: '#10b981' }}>
                                Verified
                              </span>
                            )}
                            {selectedUser.profile_completed && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: tokens.bg.active, color: '#3b82f6' }}>
                                Profile Complete
                              </span>
                            )}
                            {!selectedUser.verified && !selectedUser.profile_completed && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: tokens.bg.active, color: tokens.text.muted }}>
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: tokens.text.primary }}>Account Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.muted }}>User ID</label>
                          <p className="text-sm font-mono break-all" style={{ color: tokens.text.muted }}>{selectedUser.id}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.muted }}>Created At</label>
                          <p className="text-sm" style={{ color: tokens.text.primary }}>{formatDate(selectedUser.created_at)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.muted }}>Last Updated</label>
                          <p className="text-sm" style={{ color: tokens.text.primary }}>{formatDate(selectedUser.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userDetailSection === 'connected' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Connected Accounts</h3>
                      <p className="text-sm" style={{ color: tokens.text.muted }}>View user's connected social media and third-party accounts</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.active }}>
                            <Link2 className="w-8 h-8" style={{ color: tokens.text.muted }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>No connected accounts</h4>
                          <p className="text-sm" style={{ color: tokens.text.muted }}>This user hasn't connected any external accounts yet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userDetailSection === 'payment' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Payment Method</h3>
                      <p className="text-sm" style={{ color: tokens.text.muted }}>View user's payment and payout methods</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.active }}>
                            <CreditCard className="w-8 h-8" style={{ color: tokens.text.muted }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>No payment methods</h4>
                          <p className="text-sm" style={{ color: tokens.text.muted }}>This user hasn't added any payment methods yet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userDetailSection === 'notifications' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Notifications</h3>
                      <p className="text-sm" style={{ color: tokens.text.muted }}>View user's notification preferences and history</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.active }}>
                            <Bell className="w-8 h-8" style={{ color: tokens.text.muted }} />
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>No notifications</h4>
                          <p className="text-sm" style={{ color: tokens.text.muted }}>No notification history available for this user</p>
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
