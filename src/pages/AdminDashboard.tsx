import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Link2, CreditCard, Bell, Search, CheckCircle, XCircle, ExternalLink, Loader2, ShieldCheck, Plus, Trash2, Megaphone, Music, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { AnimatedBarsLoader } from '../components/AnimatedBarsLoader';
import { AdminMessagesPage } from './AdminMessagesPage';
import { getAdminId } from '../hooks/useChat';
import { AnnouncementSender } from '../components/AnnouncementSender';
import { MessageToast } from '../components/MessageToast';
import { useAdminUnreadCount } from '../hooks/useAdminUnreadCount';
import { ELEVATE_ADMIN_AVATAR_URL } from '../components/DefaultAvatar';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { SettingsView } from '../components/SettingsView';
import { useTheme } from '../contexts/ThemeContext';
import { themeTokens } from '../lib/themeTokens';

interface SocialLink {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  display_name: string | null;
  verified: boolean;
  channel_type: string | null;
  channel_description: string | null;
  created_at: string;
}

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

interface Application {
  id: string;
  user_id: string;
  application_type: 'freelancer_onboarding' | 'creator_verification';
  status: 'pending' | 'approved' | 'denied';
  full_name: string | null;
  email: string | null;
  username: string | null;
  professional_title: string | null;
  category: string | null;
  skills: string[] | null;
  hourly_rate: number | null;
  bio: string | null;
  country: string | null;
  city: string | null;
  platform: string | null;
  social_url: string | null;
  channel_type: string | null;
  channel_description: string | null;
  admin_note: string | null;
  created_at: string;
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
  const [userSocialLinks, setUserSocialLinks] = useState<SocialLink[]>([]);
  const [userSocialLinksLoading, setUserSocialLinksLoading] = useState(false);
  const [adminProfileId, setAdminProfileId] = useState<string | null>(null);
  const adminUnreadCount = useAdminUnreadCount();
  const [userSearch, setUserSearch] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState<'pending' | 'approved' | 'denied'>('pending');
  const [actioningId, setActioningId] = useState<string | null>(null);

  // Campaign state
  interface SongEntry { title: string; artist: string; url: string; }
  interface CampaignForm {
    name: string;
    bio: string;
    description: string;
    rules: string;
    how_it_works: string;
    songs: SongEntry[];
    language: string;
    platforms: string[];
    pay_type: string;
    payout: string;
    ends_at: string;
    assign_to: 'all' | 'specific';
    assigned_user_ids: string[];
  }
  interface Campaign {
    id: string;
    name: string;
    bio: string | null;
    description: string | null;
    rules: string[] | null;
    how_it_works: string[] | null;
    songs_to_use: SongEntry[] | null;
    language: string;
    platforms: string[];
    pay_type: string;
    payout: string;
    ends_at: string | null;
    status: string;
    created_at: string;
  }

  const emptyCampaignForm: CampaignForm = {
    name: '', bio: '', description: '', rules: '', how_it_works: '',
    songs: [{ title: '', artist: '', url: '' }],
    language: 'English', platforms: [], pay_type: 'Per view', payout: '', ends_at: '',
    assign_to: 'all', assigned_user_ids: [],
  };

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignUserSearch, setCampaignUserSearch] = useState('');
  const [campaignYoutubeOnly, setCampaignYoutubeOnly] = useState(false);
  const [userYoutubeIds, setUserYoutubeIds] = useState<Set<string>>(new Set());
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignForm, setCampaignForm] = useState<CampaignForm>(emptyCampaignForm);
  const [campaignSaving, setCampaignSaving] = useState(false);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [payTypeDropdownOpen, setPayTypeDropdownOpen] = useState(false);
  const [reassigningCampaignId, setReassigningCampaignId] = useState<string | null>(null);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  // Whitelist state
  interface WhitelistedChannel {
    id: string;
    url_pattern: string;
    platform: string | null;
    note: string | null;
    created_at: string;
  }
  const [whitelistedChannels, setWhitelistedChannels] = useState<WhitelistedChannel[]>([]);
  const [whitelistLoading, setWhitelistLoading] = useState(false);
  const [whitelistInput, setWhitelistInput] = useState('');
  const [whitelistPlatform, setWhitelistPlatform] = useState('');
  const [whitelistNote, setWhitelistNote] = useState('');
  const [whitelistAdding, setWhitelistAdding] = useState(false);
  const [whitelistError, setWhitelistError] = useState<string | null>(null);
  const [removingWhitelistId, setRemovingWhitelistId] = useState<string | null>(null);
  const navigate = useNavigate();
  const fetchingUsersRef = useRef(false);
  const lastFetchedSectionRef = useRef<string | null>(null);
  const { admin, sessionToken, verifySession, isAuthenticated, isLoading } = useAdminAuth();
  const { adminFetch } = useAdmin();

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const q = userSearch.toLowerCase();
    return users.filter(u =>
      (u.email?.toLowerCase().includes(q)) ||
      (u.full_name?.toLowerCase().includes(q)) ||
      (u.username?.toLowerCase().includes(q)) ||
      (u.user_type?.toLowerCase().includes(q))
    );
  }, [users, userSearch]);

  useEffect(() => {
    const interval = setInterval(() => {
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchAdminProfileId = async () => {
      if (admin && !adminProfileId) {
        const profileId = await getAdminId();
        if (profileId) {
          setAdminProfileId(profileId);
        }
      }
    };
    fetchAdminProfileId();
  }, [admin]);

  const fetchWhitelistedChannels = useCallback(async () => {
    setWhitelistLoading(true);
    try {
      const { data, error } = await supabase
        .from('whitelisted_channels')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setWhitelistedChannels(data || []);
    } catch (e) {
      console.error('Error fetching whitelisted channels:', e);
    } finally {
      setWhitelistLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'home') {
      fetchWhitelistedChannels();
      fetchCampaigns();
    }
  }, [activeSection, fetchWhitelistedChannels]);

  const fetchCampaigns = useCallback(async () => {
    setCampaignsLoading(true);
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setCampaigns(data || []);
    } catch (e) {
      console.error('Error fetching campaigns:', e);
    } finally {
      setCampaignsLoading(false);
    }
  }, []);

  const fetchUserSocialLinks = useCallback(async (userId: string) => {
    setUserSocialLinksLoading(true);
    setUserSocialLinks([]);
    try {
      const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('../lib/config');
      const res = await fetch(`${SUPABASE_URL}/functions/v1/social-links?userId=${encodeURIComponent(userId)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });
      const json = await res.json();
      if (json.success) setUserSocialLinks(json.links || []);
    } catch (e) {
      console.error('Error fetching user social links:', e);
    } finally {
      setUserSocialLinksLoading(false);
    }
  }, []);

  const handleSelectUser = useCallback((user: User) => {
    setSelectedUser(user);
    setUserDetailSection('personal');
    setUserSocialLinks([]);
    fetchUserSocialLinks(user.id);
  }, [fetchUserSocialLinks]);

  const handleSaveCampaign = async () => {
    if (!campaignForm.name.trim()) { setCampaignError('Campaign name is required.'); return; }
    setCampaignSaving(true);
    setCampaignError(null);
    try {
      const rulesArr = campaignForm.rules.split('\n').map(r => r.trim()).filter(Boolean);
      const howArr = campaignForm.how_it_works.split('\n').map(r => r.trim()).filter(Boolean);
      const songsArr = campaignForm.songs.filter(s => s.title.trim() || s.artist.trim());
      const payload = {
        name: campaignForm.name.trim(),
        bio: campaignForm.bio.trim() || null,
        description: campaignForm.description.trim() || null,
        rules: rulesArr.length ? rulesArr : null,
        how_it_works: howArr.length ? howArr : null,
        songs_to_use: songsArr.length ? songsArr : null,
        language: campaignForm.language,
        platforms: campaignForm.platforms,
        pay_type: campaignForm.pay_type,
        payout: campaignForm.payout.trim(),
        ends_at: campaignForm.ends_at ? new Date(campaignForm.ends_at).toISOString() : null,
        assign_to: campaignForm.assign_to,
        assigned_user_ids: campaignForm.assigned_user_ids,
      };
      const { data, error } = await supabase.from('campaigns').insert(payload).select().single();
      if (error) throw error;

      // Insert user_campaigns rows
      if (campaignForm.assign_to === 'specific' && campaignForm.assigned_user_ids.length > 0) {
        const rows = campaignForm.assigned_user_ids.map(uid => ({ campaign_id: data.id, user_id: uid }));
        const { error: ucErr } = await supabase.from('user_campaigns').insert(rows);
        if (ucErr) console.error('user_campaigns insert error:', ucErr.message);
      } else if (campaignForm.assign_to === 'all') {
        // Use adminFetch (session-authenticated) to get all creator IDs
        let creatorIds: string[] = users.filter(u => u.user_type === 'creator').map(u => u.id);
        if (creatorIds.length === 0) {
          try {
            const res = await adminFetch('admin-users', { method: 'GET' });
            if (res?.users) {
              creatorIds = (res.users as any[]).filter(u => u.user_type === 'creator').map(u => u.id);
            }
          } catch (e) { console.error('Failed to fetch creator IDs via adminFetch:', e); }
        }
        if (creatorIds.length > 0) {
          const rows = creatorIds.map(uid => ({ campaign_id: data.id, user_id: uid }));
          const { error: ucErr } = await supabase.from('user_campaigns').insert(rows);
          if (ucErr) console.error('user_campaigns insert error (all):', ucErr.message);
        }
      }

      setCampaigns(prev => [data, ...prev]);
      setCampaignForm(emptyCampaignForm);
      setShowCampaignForm(false);
    } catch (e: any) {
      setCampaignError(e?.message || 'Failed to save campaign.');
    } finally {
      setCampaignSaving(false);
    }
  };

  const handleReassignCampaign = async (campaign: Campaign) => {
    setReassigningCampaignId(campaign.id);
    try {
      // Delete existing assignments first
      await supabase.from('user_campaigns').delete().eq('campaign_id', campaign.id);
      // Re-fetch all creator IDs via adminFetch
      let creatorIds: string[] = users.filter(u => u.user_type === 'creator').map(u => u.id);
      if (creatorIds.length === 0) {
        const res = await adminFetch('admin-users', { method: 'GET' });
        if (res?.users) creatorIds = (res.users as any[]).filter(u => u.user_type === 'creator').map(u => u.id);
      }
      if (creatorIds.length > 0) {
        const rows = creatorIds.map(uid => ({ campaign_id: campaign.id, user_id: uid }));
        const { error } = await supabase.from('user_campaigns').insert(rows);
        if (error) throw error;
      }
    } catch (e) {
      console.error('Error reassigning campaign:', e);
    } finally {
      setReassigningCampaignId(null);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    setDeletingCampaignId(id);
    try {
      await supabase.from('campaigns').delete().eq('id', id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Error deleting campaign:', e);
    } finally {
      setDeletingCampaignId(null);
    }
  };

  const handleAddWhitelist = async () => {
    const pattern = whitelistInput.trim();
    if (!pattern) return;
    setWhitelistAdding(true);
    setWhitelistError(null);
    try {
      const { data, error } = await supabase
        .from('whitelisted_channels')
        .insert({ url_pattern: pattern, platform: whitelistPlatform.trim() || null, note: whitelistNote.trim() || null })
        .select()
        .single();
      if (error) throw error;
      setWhitelistedChannels(prev => [data, ...prev]);
      setWhitelistInput('');
      setWhitelistPlatform('');
      setWhitelistNote('');
    } catch (e: any) {
      setWhitelistError(e?.message?.includes('unique') ? 'This pattern is already whitelisted.' : 'Failed to add. Try again.');
    } finally {
      setWhitelistAdding(false);
    }
  };

  const handleRemoveWhitelist = async (id: string) => {
    setRemovingWhitelistId(id);
    try {
      await supabase.from('whitelisted_channels').delete().eq('id', id);
      setWhitelistedChannels(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      console.error('Error removing whitelisted channel:', e);
    } finally {
      setRemovingWhitelistId(null);
    }
  };

  const fetchApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setApplications(data || []);
    } catch (e) {
      console.error('Error fetching applications:', e);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'applications') {
      fetchApplications();
    }
  }, [activeSection, fetchApplications]);

  const handleApplicationAction = async (id: string, action: 'approved' | 'denied') => {
    setActioningId(id);
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: action, reviewed_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: action } : a));
      }
    } catch (e) {
      console.error('Error updating application:', e);
    } finally {
      setActioningId(null);
    }
  };

  useEffect(() => {
    if (activeSection !== 'users' && activeSection !== 'applications' && activeSection !== 'home') {
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

  // Fetch which users have YouTube channels (runs once on mount)
  useEffect(() => {
    const fetchYoutubeIds = async () => {
      try {
        const { SUPABASE_URL, SUPABASE_ANON_KEY } = await import('../lib/config');
        const res = await fetch(`${SUPABASE_URL}/functions/v1/social-links?platform=YouTube`, {
          headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY },
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.links)) {
          setUserYoutubeIds(new Set<string>(json.links.map((l: { user_id: string }) => l.user_id)));
        }
      } catch (_) { /* non-critical */ }
    };
    fetchYoutubeIds();
  }, []);

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
    <>
    <MessageToast
      userId={adminProfileId}
      activeSection={activeSection}
      onNavigateToMessages={() => setActiveSection('messages')}
      theme={theme}
    />
    <div className="min-h-screen text-white flex transition-colors duration-300" style={{ backgroundColor: tokens.bg.primary }}>
      {/* Left Sidebar - Desktop Only */}
      <CollapsibleSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userProfile={null}
        unreadCount={adminUnreadCount}
        cachedProfilePic={ELEVATE_ADMIN_AVATAR_URL}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        permanentlyCollapsed={false}
        userType="admin"
      />
      <MobileBottomNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        unreadCount={adminUnreadCount}
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
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: tokens.text.primary }}>Welcome back, Super Admin</h1>
                  <p className="text-base" style={{ color: tokens.text.primary }}>Manage your platform from here</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  <div className="rounded-xl p-6" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>Applications</h3>
                    <p className="text-sm" style={{ color: tokens.text.primary }}>Review pending creator applications</p>
                  </div>
                  <div className="rounded-xl p-6" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>Users</h3>
                    <p className="text-sm" style={{ color: tokens.text.primary }}>Manage all registered users</p>
                  </div>
                  <div className="rounded-xl p-6" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>Alerts</h3>
                    <p className="text-sm" style={{ color: tokens.text.primary }}>Send announcements to users</p>
                  </div>
                </div>

                {/* Channel Link Whitelist */}
                <div className="rounded-xl p-6" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                  <div className="flex items-center gap-3 mb-1">
                    <ShieldCheck className="w-5 h-5" style={{ color: tokens.text.primary }} />
                    <h2 className="text-xl font-bold" style={{ color: tokens.text.primary }}>Channel Link Whitelist</h2>
                  </div>
                  <p className="text-sm mb-6" style={{ color: tokens.text.primary }}>Social links matching a whitelisted pattern are automatically verified — no verification prompt shown to the user.</p>

                  {/* Add form */}
                  <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}` }}>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: tokens.text.primary }}>Add Pattern</p>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="text"
                        value={whitelistInput}
                        onChange={e => { setWhitelistInput(e.target.value); setWhitelistError(null); }}
                        onKeyDown={e => e.key === 'Enter' && handleAddWhitelist()}
                        placeholder="e.g. youtube.com/c/ or @handle"
                        className="flex-1 h-9 px-3 rounded-lg text-sm focus:outline-none"
                        style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                        onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                      />
                      <input
                        type="text"
                        value={whitelistPlatform}
                        onChange={e => setWhitelistPlatform(e.target.value)}
                        placeholder="Platform (optional)"
                        className="w-full sm:w-36 h-9 px-3 rounded-lg text-sm focus:outline-none"
                        style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                        onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                      />
                      <input
                        type="text"
                        value={whitelistNote}
                        onChange={e => setWhitelistNote(e.target.value)}
                        placeholder="Note (optional)"
                        className="w-full sm:w-40 h-9 px-3 rounded-lg text-sm focus:outline-none"
                        style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                        onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                      />
                      <button
                        onClick={handleAddWhitelist}
                        disabled={whitelistAdding || !whitelistInput.trim()}
                        className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50 flex-shrink-0"
                        style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                      >
                        {whitelistAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                      </button>
                    </div>
                    {whitelistError && <p className="text-xs mt-1" style={{ color: tokens.text.primary, opacity: 0.7 }}>{whitelistError}</p>}
                  </div>

                  {/* List */}
                  {whitelistLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <AnimatedBarsLoader text="Loading..." />
                    </div>
                  ) : whitelistedChannels.length === 0 ? (
                    <div className="text-center py-8">
                      <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: tokens.text.primary }} />
                      <p className="text-sm" style={{ color: tokens.text.primary }}>No whitelisted patterns yet. Add one above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {whitelistedChannels.map(ch => (
                        <div
                          key={ch.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg"
                          style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}` }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Link2 className="w-4 h-4 flex-shrink-0" style={{ color: '#60a5fa' }} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: tokens.text.primary }}>{ch.url_pattern}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {ch.platform && <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary }}>{ch.platform}</span>}
                                {ch.note && <span className="text-xs truncate" style={{ color: tokens.text.primary }}>{ch.note}</span>}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveWhitelist(ch.id)}
                            disabled={removingWhitelistId === ch.id}
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-50"
                            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                          >
                            {removingWhitelistId === ch.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campaign Manager */}
                <div className="rounded-xl p-6 mt-6" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <Megaphone className="w-5 h-5" style={{ color: tokens.text.primary }} />
                      <h2 className="text-xl font-bold" style={{ color: tokens.text.primary }}>Campaign Manager</h2>
                    </div>
                    <button
                      onClick={() => { setShowCampaignForm(v => !v); setCampaignError(null); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
                      style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                    >
                      {showCampaignForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Campaign</>}
                    </button>
                  </div>
                  <p className="text-sm mb-5" style={{ color: tokens.text.primary }}>Create campaigns and assign them to users. Assigned campaigns appear in the user's dashboard.</p>

                  {/* Create form */}
                  {showCampaignForm && (
                    <div className="rounded-xl mb-6 overflow-hidden" style={{ border: `1px solid ${tokens.border.default}` }}>
                      <div className="px-5 py-3.5" style={{ backgroundColor: tokens.bg.primary, borderBottom: `1px solid ${tokens.border.subtle}` }}>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: tokens.text.primary }}>New Campaign</p>
                      </div>
                      <div className="p-5 space-y-5" style={{ backgroundColor: tokens.bg.elevated }}>

                      {/* Name + Language row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Campaign Name <span style={{ color: tokens.text.primary }}>*</span></label>
                          <input
                            type="text"
                            value={campaignForm.name}
                            onChange={e => setCampaignForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="e.g. Electronic Vibes"
                            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                            style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                            onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                            onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Language</label>
                          <input
                            type="text"
                            value={campaignForm.language}
                            onChange={e => setCampaignForm(f => ({ ...f, language: e.target.value }))}
                            placeholder="English"
                            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                            style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                            onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                            onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                          />
                        </div>
                      </div>

                      {/* Bio */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Bio <span className="normal-case font-normal" style={{ color: tokens.text.primary }}>(short tagline shown on the card)</span></label>
                        <input
                          type="text"
                          value={campaignForm.bio}
                          onChange={e => setCampaignForm(f => ({ ...f, bio: e.target.value }))}
                          placeholder="e.g. Earn per view promoting Neon Afterhours"
                          className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                          style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                          onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                          onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Description</label>
                        <textarea
                          value={campaignForm.description}
                          onChange={e => setCampaignForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Describe the campaign..."
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-lg text-sm resize-none focus:outline-none"
                          style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                          onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                          onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                        />
                      </div>

                      {/* Platforms */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary }}>Platforms</label>
                        <div className="flex flex-wrap gap-2">
                          {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'Twitch'].map(p => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setCampaignForm(f => ({
                                ...f,
                                platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p]
                              }))}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                              style={{
                                backgroundColor: campaignForm.platforms.includes(p) ? tokens.bg.active : tokens.bg.primary,
                                color: tokens.text.primary,
                                border: `1px solid ${campaignForm.platforms.includes(p) ? tokens.border.default : tokens.border.subtle}`,
                              }}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pay type + Payout + Ends at */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="relative">
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Pay Type</label>
                          <button
                            type="button"
                            onClick={() => setPayTypeDropdownOpen(v => !v)}
                            className="w-full h-9 px-3 rounded-lg text-sm flex items-center justify-between focus:outline-none"
                            style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                          >
                            <span>{campaignForm.pay_type}</span>
                            {payTypeDropdownOpen ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tokens.text.primary }} /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tokens.text.primary }} />}
                          </button>
                          {payTypeDropdownOpen && (
                            <div className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden shadow-xl" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.default}` }}>
                              {['Per view', 'Flat fee', 'Revenue share', 'Varied'].map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => { setCampaignForm(f => ({ ...f, pay_type: opt })); setPayTypeDropdownOpen(false); }}
                                  className="w-full text-left px-3 py-2 text-sm transition-all hover:brightness-110"
                                  style={{
                                    backgroundColor: campaignForm.pay_type === opt ? tokens.bg.active : 'transparent',
                                    color: tokens.text.primary,
                                  }}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Payout</label>
                          <input
                            type="text"
                            value={campaignForm.payout}
                            onChange={e => setCampaignForm(f => ({ ...f, payout: e.target.value }))}
                            placeholder="e.g. $1.50 cpm"
                            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                            style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                            onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                            onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Ends At</label>
                          <input
                            type="date"
                            value={campaignForm.ends_at}
                            onChange={e => setCampaignForm(f => ({ ...f, ends_at: e.target.value }))}
                            className="w-full h-9 px-3 rounded-lg text-sm focus:outline-none"
                            style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                            onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                            onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                          />
                        </div>
                      </div>

                      {/* How it works */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>How It Works <span className="normal-case font-normal" style={{ color: tokens.text.primary }}>(one step per line)</span></label>
                        <textarea
                          value={campaignForm.how_it_works}
                          onChange={e => setCampaignForm(f => ({ ...f, how_it_works: e.target.value }))}
                          placeholder={"Join the campaign\nCreate a video using the provided track\nPost on your platforms\nEarn per view"}
                          rows={4}
                          className="w-full px-3 py-2.5 rounded-lg text-sm resize-none focus:outline-none"
                          style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                          onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                          onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                        />
                      </div>

                      {/* Rules */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Rules <span className="normal-case font-normal" style={{ color: tokens.text.primary }}>(one rule per line)</span></label>
                        <textarea
                          value={campaignForm.rules}
                          onChange={e => setCampaignForm(f => ({ ...f, rules: e.target.value }))}
                          placeholder={"Minimum video length: 15 seconds\nMust include audio from the official track\nNo explicit content"}
                          rows={4}
                          className="w-full px-3 py-2.5 rounded-lg text-sm resize-none focus:outline-none"
                          style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                          onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                          onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                        />
                      </div>

                      {/* Songs to use */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.primary }}>Songs to Use</label>
                          <button
                            type="button"
                            onClick={() => setCampaignForm(f => ({ ...f, songs: [...f.songs, { title: '', artist: '', url: '' }] }))}
                            className="text-xs flex items-center gap-1 hover:opacity-80 transition-opacity font-medium"
                            style={{ color: tokens.text.primary }}
                          >
                            <Plus className="w-3 h-3" /> Add song
                          </button>
                        </div>
                        <div className="space-y-2">
                          {campaignForm.songs.map((song, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input
                                type="text"
                                value={song.title}
                                onChange={e => setCampaignForm(f => { const s = [...f.songs]; s[i] = { ...s[i], title: e.target.value }; return { ...f, songs: s }; })}
                                placeholder="Song title"
                                className="flex-1 h-8 px-2.5 rounded-lg text-xs focus:outline-none"
                                style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                                onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                              />
                              <input
                                type="text"
                                value={song.artist}
                                onChange={e => setCampaignForm(f => { const s = [...f.songs]; s[i] = { ...s[i], artist: e.target.value }; return { ...f, songs: s }; })}
                                placeholder="Artist"
                                className="flex-1 h-8 px-2.5 rounded-lg text-xs focus:outline-none"
                                style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                                onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                              />
                              <input
                                type="text"
                                value={song.url}
                                onChange={e => setCampaignForm(f => { const s = [...f.songs]; s[i] = { ...s[i], url: e.target.value }; return { ...f, songs: s }; })}
                                placeholder="Link (optional)"
                                className="flex-1 h-8 px-2.5 rounded-lg text-xs focus:outline-none"
                                style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                                onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                              />
                              {campaignForm.songs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setCampaignForm(f => ({ ...f, songs: f.songs.filter((_, j) => j !== i) }))}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 hover:brightness-110"
                                  style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary }}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Assign To */}
                      <div className="pt-1" style={{ borderTop: `1px solid ${tokens.border.subtle}` }}>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: tokens.text.primary }}>Assign To</label>
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setCampaignForm(f => ({ ...f, assign_to: 'all', assigned_user_ids: [] }))}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{
                              backgroundColor: campaignForm.assign_to === 'all' ? tokens.bg.active : tokens.bg.primary,
                              color: tokens.text.primary,
                              border: `1px solid ${campaignForm.assign_to === 'all' ? tokens.border.default : tokens.border.subtle}`,
                            }}
                          >
                            All Creators
                          </button>
                          <button
                            type="button"
                            onClick={() => setCampaignForm(f => ({ ...f, assign_to: 'specific' }))}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{
                              backgroundColor: campaignForm.assign_to === 'specific' ? tokens.bg.active : tokens.bg.primary,
                              color: tokens.text.primary,
                              border: `1px solid ${campaignForm.assign_to === 'specific' ? tokens.border.default : tokens.border.subtle}`,
                            }}
                          >
                            Specific Users
                          </button>
                        </div>

                        {/* All Creators summary */}
                        {campaignForm.assign_to === 'all' && (() => {
                          const creatorCount = users.filter(u => u.user_type === 'creator').length;
                          return (
                            <div className="rounded-lg px-4 py-3" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                              <p className="text-xs" style={{ color: tokens.text.primary }}>
                                This campaign will be assigned to <span className="font-semibold" style={{ color: tokens.text.primary }}>{creatorCount} creator{creatorCount !== 1 ? 's' : ''}</span> on the platform.
                              </p>
                            </div>
                          );
                        })()}

                        {/* Specific Users picker */}
                        {campaignForm.assign_to === 'specific' && (() => {
                          const creatorUsers = users.filter(u => u.user_type === 'creator');
                          const q = campaignUserSearch.toLowerCase().trim();
                          const filtered = creatorUsers.filter(u => {
                            const matchesSearch = !q ||
                              (u.full_name?.toLowerCase().includes(q)) ||
                              (u.username?.toLowerCase().includes(q)) ||
                              (u.email?.toLowerCase().includes(q));
                            const matchesYoutube = !campaignYoutubeOnly || userYoutubeIds.has(u.id);
                            return matchesSearch && matchesYoutube;
                          });
                          return (
                            <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${tokens.border.subtle}` }}>
                              {/* Search + filter bar */}
                              <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: tokens.bg.primary, borderBottom: `1px solid ${tokens.border.subtle}` }}>
                                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: tokens.text.primary }} />
                                <input
                                  type="text"
                                  value={campaignUserSearch}
                                  onChange={e => setCampaignUserSearch(e.target.value)}
                                  placeholder="Search creators..."
                                  className="flex-1 text-xs bg-transparent focus:outline-none"
                                  style={{ color: tokens.text.primary }}
                                  onFocus={(e) => (e.target.closest('.flex.items-center.gap-2') as HTMLElement)?.style.setProperty('border-color', '#ffffff')}
                                  onBlur={(e) => (e.target.closest('.flex.items-center.gap-2') as HTMLElement)?.style.setProperty('border-color', tokens.border.subtle)}
                                />
                                <button
                                  type="button"
                                  onClick={() => setCampaignYoutubeOnly(v => !v)}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-all"
                                  style={{
                                    backgroundColor: campaignYoutubeOnly ? tokens.bg.active : 'transparent',
                                    color: tokens.text.primary,
                                    border: `1px solid ${campaignYoutubeOnly ? tokens.border.default : tokens.border.subtle}`,
                                  }}
                                >
                                  YT only
                                </button>
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {filtered.length === 0 ? (
                                  <div className="px-3 py-4 text-center">
                                    <p className="text-xs" style={{ color: tokens.text.primary }}>
                                      {creatorUsers.length === 0 ? 'No creator accounts found' : 'No creators match your search'}
                                    </p>
                                  </div>
                                ) : (
                                  filtered.map(u => (
                                    <label
                                      key={u.id}
                                      className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:brightness-105 transition-all"
                                      style={{ backgroundColor: tokens.bg.elevated, borderBottom: `1px solid ${tokens.border.subtle}` }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={campaignForm.assigned_user_ids.includes(u.id)}
                                        onChange={e => setCampaignForm(f => ({
                                          ...f,
                                          assigned_user_ids: e.target.checked
                                            ? [...f.assigned_user_ids, u.id]
                                            : f.assigned_user_ids.filter(id => id !== u.id)
                                        }))}
                                        className="w-3.5 h-3.5 rounded flex-shrink-0"
                                      />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium truncate" style={{ color: tokens.text.primary }}>{u.full_name || u.username || u.email}</p>
                                        <p className="text-xs truncate" style={{ color: tokens.text.primary }}>{u.email}</p>
                                      </div>
                                      {userYoutubeIds.has(u.id) && (
                                        <span className="text-xs px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}>YT</span>
                                      )}
                                    </label>
                                  ))
                                )}
                              </div>
                              {campaignForm.assigned_user_ids.length > 0 && (
                                <div className="px-3 py-2" style={{ backgroundColor: tokens.bg.primary, borderTop: `1px solid ${tokens.border.subtle}` }}>
                                  <p className="text-xs font-medium" style={{ color: tokens.text.primary }}>{campaignForm.assigned_user_ids.length} creator{campaignForm.assigned_user_ids.length !== 1 ? 's' : ''} selected</p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {campaignError && <p className="text-xs pt-1" style={{ color: tokens.text.primary, opacity: 0.7 }}>{campaignError}</p>}

                      <div className="flex justify-end gap-2 pt-2" style={{ borderTop: `1px solid ${tokens.border.subtle}` }}>
                        <button
                          onClick={() => { setShowCampaignForm(false); setCampaignForm(emptyCampaignForm); setCampaignError(null); }}
                          className="px-4 h-9 rounded-lg text-sm font-medium transition-all hover:brightness-110"
                          style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveCampaign}
                          disabled={campaignSaving}
                          className="flex items-center gap-1.5 px-5 h-9 rounded-lg text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                          style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        >
                          {campaignSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          Save Campaign
                        </button>
                      </div>
                      </div>
                    </div>
                  )}

                  {/* Campaign list */}
                  {campaignsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <AnimatedBarsLoader text="Loading..." />
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <Megaphone className="w-10 h-10 mx-auto mb-3" style={{ color: tokens.text.primary }} />
                      <p className="text-sm" style={{ color: tokens.text.primary }}>No campaigns yet. Create one above.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {campaigns.map(c => (
                        <div key={c.id} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${tokens.border.subtle}` }}>
                          <div
                            className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:brightness-105 transition-all"
                            style={{ backgroundColor: tokens.bg.primary }}
                            onClick={() => setExpandedCampaignId(expandedCampaignId === c.id ? null : c.id)}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Megaphone className="w-4 h-4 flex-shrink-0" style={{ color: tokens.text.primary }} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate" style={{ color: tokens.text.primary }}>{c.name}</p>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}>{c.status}</span>
                                  {c.payout && <span className="text-xs" style={{ color: tokens.text.primary }}>{c.payout}</span>}
                                  {c.platforms?.length > 0 && <span className="text-xs" style={{ color: tokens.text.primary }}>{c.platforms.join(', ')}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReassignCampaign(c); }}
                                disabled={reassigningCampaignId === c.id}
                                title="Reassign to all creators"
                                className="flex items-center gap-1 px-2 h-7 rounded-lg text-xs font-medium transition-all hover:brightness-110 disabled:opacity-50"
                                style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                              >
                                {reassigningCampaignId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reassign'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(c.id); }}
                                disabled={deletingCampaignId === c.id}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-50"
                                style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                              >
                                {deletingCampaignId === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              </button>
                              {expandedCampaignId === c.id ? <ChevronUp className="w-4 h-4" style={{ color: tokens.text.primary }} /> : <ChevronDown className="w-4 h-4" style={{ color: tokens.text.primary }} />}
                            </div>
                          </div>
                          {expandedCampaignId === c.id && (
                            <div className="px-4 pb-4 pt-2 space-y-3" style={{ backgroundColor: tokens.bg.elevated }}>
                              {c.description && <p className="text-sm" style={{ color: tokens.text.primary }}>{c.description}</p>}
                              {c.how_it_works && c.how_it_works.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>How It Works</p>
                                  <ol className="space-y-1">
                                    {c.how_it_works.map((step, i) => (
                                      <li key={i} className="text-xs flex gap-2" style={{ color: tokens.text.primary }}>
                                        <span className="font-semibold flex-shrink-0" style={{ color: tokens.text.primary }}>{i + 1}.</span>{step}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              {c.rules && c.rules.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Rules</p>
                                  <ul className="space-y-1">
                                    {c.rules.map((rule, i) => (
                                      <li key={i} className="text-xs" style={{ color: tokens.text.primary }}>• {rule}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {c.songs_to_use && c.songs_to_use.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary }}>Songs to Use</p>
                                  <div className="space-y-1">
                                    {c.songs_to_use.map((s, i) => (
                                      <div key={i} className="flex items-center gap-2">
                                        <Music className="w-3 h-3 flex-shrink-0" style={{ color: tokens.text.primary }} />
                                        <span className="text-xs font-medium" style={{ color: tokens.text.primary }}>{s.title}</span>
                                        {s.artist && <span className="text-xs" style={{ color: tokens.text.primary }}>— {s.artist}</span>}
                                        {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: tokens.text.primary }}><ExternalLink className="w-3 h-3 inline" /></a>}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'applications' && (
              <div className="animate-fade-in">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: tokens.text.primary }}>Applications</h2>
                    <p className="text-sm sm:text-base" style={{ color: tokens.text.secondary }}>Freelancer onboarding and creator social verification requests</p>
                  </div>
                  <div className="flex gap-2">
                    {(['pending', 'approved', 'denied'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setAppStatusFilter(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                        style={{
                          backgroundColor: appStatusFilter === s ? tokens.bg.active : 'transparent',
                          color: appStatusFilter === s ? tokens.text.primary : tokens.text.muted,
                          border: `1px solid ${appStatusFilter === s ? tokens.border.default : tokens.border.subtle}`,
                        }}
                      >
                        {s}
                        <span className="ml-1.5 opacity-60">
                          {applications.filter(a => a.status === s).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {applicationsLoading ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <AnimatedBarsLoader text="Loading..." />
                  </div>
                ) : (() => {
                  const sections = [
                    { type: 'freelancer_onboarding' as const, label: 'Freelancer Onboarding', color: '#60a5fa' },
                    { type: 'creator_verification' as const, label: 'Creator Verification', color: '#a78bfa' },
                  ];
                  const filtered = applications.filter(a => a.status === appStatusFilter);
                  if (filtered.length === 0) {
                    return (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center px-4">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                            <CheckCircle className="w-8 h-8" style={{ color: tokens.text.muted }} />
                          </div>
                          <h3 className="text-xl font-bold mb-2" style={{ color: tokens.text.primary }}>No {appStatusFilter} applications</h3>
                          <p className="text-sm" style={{ color: tokens.text.secondary }}>Applications will appear here once submitted</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-8">
                      {sections.map(({ type, label, color }) => {
                        const group = filtered.filter(a => a.application_type === type);
                        if (group.length === 0) return null;
                        return (
                          <div key={type}>
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-base font-semibold" style={{ color: tokens.text.primary }}>{label}</h3>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: tokens.bg.active, color }}>
                                {group.length}
                              </span>
                            </div>
                            <div className="h-px mb-4" style={{ backgroundColor: tokens.border.subtle }} />
                            <div className="space-y-3">
                              {group.map(app => (
                                <div
                                  key={app.id}
                                  className="rounded-xl p-5 border"
                                  style={{ backgroundColor: tokens.bg.elevated, borderColor: tokens.border.default }}
                                >
                                  <div className="flex items-start justify-between gap-4 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-sm font-semibold" style={{ color: tokens.text.primary }}>
                                          {app.full_name || app.username || 'Unknown'}
                                        </span>
                                        {app.username && (
                                          <span className="text-xs" style={{ color: tokens.text.muted }}>@{app.username}</span>
                                        )}
                                        <span
                                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                                          style={{
                                            backgroundColor: app.status === 'pending' ? 'rgba(251,191,36,0.1)' : app.status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: app.status === 'pending' ? '#fbbf24' : app.status === 'approved' ? '#10b981' : '#ef4444',
                                          }}
                                        >
                                          {app.status}
                                        </span>
                                      </div>
                                      {app.email && <p className="text-xs mb-2" style={{ color: tokens.text.muted }}>{app.email}</p>}

                                      {app.application_type === 'freelancer_onboarding' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 mt-2">
                                          {app.professional_title && <div><span className="text-xs" style={{ color: tokens.text.muted }}>Title: </span><span className="text-xs" style={{ color: tokens.text.secondary }}>{app.professional_title}</span></div>}
                                          {app.category && <div><span className="text-xs" style={{ color: tokens.text.muted }}>Category: </span><span className="text-xs" style={{ color: tokens.text.secondary }}>{app.category}</span></div>}
                                          {app.hourly_rate != null && <div><span className="text-xs" style={{ color: tokens.text.muted }}>Rate: </span><span className="text-xs" style={{ color: tokens.text.secondary }}>${app.hourly_rate}/hr</span></div>}
                                          {(app.city || app.country) && <div><span className="text-xs" style={{ color: tokens.text.muted }}>Location: </span><span className="text-xs" style={{ color: tokens.text.secondary }}>{[app.city, app.country].filter(Boolean).join(', ')}</span></div>}
                                          {app.skills && app.skills.length > 0 && <div className="col-span-2"><span className="text-xs" style={{ color: tokens.text.muted }}>Skills: </span><span className="text-xs" style={{ color: tokens.text.secondary }}>{app.skills.slice(0, 5).join(', ')}{app.skills.length > 5 ? ` +${app.skills.length - 5}` : ''}</span></div>}
                                        </div>
                                      )}

                                      {app.application_type === 'creator_verification' && (
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                                          {app.platform && <div><span className="text-xs" style={{ color: tokens.text.muted }}>Platform: </span><span className="text-xs" style={{ color: tokens.text.secondary }}>{app.platform}</span></div>}
                                          {app.channel_type && <div><span className="text-xs" style={{ color: tokens.text.muted }}>Type: </span><span className="text-xs" style={{ color: tokens.text.secondary }}>{app.channel_type}</span></div>}
                                          {app.social_url && (
                                            <div className="col-span-2">
                                              <span className="text-xs" style={{ color: tokens.text.muted }}>URL: </span>
                                              <a href={app.social_url} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 hover:underline" style={{ color: '#60a5fa' }}>
                                                {app.social_url.replace(/^https?:\/\//i, '').slice(0, 50)}
                                                <ExternalLink className="w-3 h-3" />
                                              </a>
                                            </div>
                                          )}
                                          {app.channel_description && <div className="col-span-2"><span className="text-xs" style={{ color: tokens.text.muted }}>Description: </span><span className="text-xs" style={{ color: tokens.text.secondary }}>{app.channel_description}</span></div>}
                                        </div>
                                      )}

                                      <p className="text-xs mt-2" style={{ color: tokens.text.muted }}>
                                        Submitted {formatDate(app.created_at)}
                                      </p>
                                    </div>

                                    {app.status === 'pending' && (
                                      <div className="flex gap-2 flex-shrink-0">
                                        <button
                                          onClick={() => handleApplicationAction(app.id, 'approved')}
                                          disabled={actioningId === app.id}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                                          style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                                        >
                                          {actioningId === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleApplicationAction(app.id, 'denied')}
                                          disabled={actioningId === app.id}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                                          style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                                        >
                                          {actioningId === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                                          Deny
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
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
                        {filteredUsers.length}{filteredUsers.length !== users.length ? ` / ${users.length}` : ''} {users.length === 1 ? 'user' : 'users'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base mb-4" style={{ color: tokens.text.secondary }}>View and manage all registered users (Creators, Artists, Business)</p>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Search className="w-4 h-4" style={{ color: tokens.text.muted }} />
                    </div>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name, email, username, or type..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                      style={{ color: tokens.text.primary, background: tokens.bg.elevated, border: `1px solid ${tokens.border.default}` }}
                    />
                    {userSearch && (
                      <button
                        onClick={() => setUserSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                      >
                        <X className="w-4 h-4" style={{ color: tokens.text.muted }} />
                      </button>
                    )}
                  </div>
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
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                        <Search className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: tokens.text.muted }} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: tokens.text.primary }}>No results for "{userSearch}"</h3>
                      <p className="text-sm sm:text-base" style={{ color: tokens.text.secondary }}>Try searching by name, email, username, or account type</p>
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
                          {filteredUsers.map((user, index) => (
                            <tr 
                              key={user.id} 
                              onClick={() => handleSelectUser(user)}
                              className="border-b transition-colors hover:brightness-105 cursor-pointer" 
                              style={{ borderColor: index === filteredUsers.length - 1 ? 'transparent' : tokens.border.default }}
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
                    renderAccountType={() => <div></div>}
                    renderPayoutMethods={() => <div></div>}
                    renderDisplay={() => (
                      <div className="space-y-6 lg:space-y-8">
                        {/* Preview Section */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Preview</h3>
                          <div 
                            className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border transition-all duration-300"
                            style={{ 
                              backgroundColor: 'var(--bg-primary)', 
                              borderColor: 'var(--border-subtle)'
                            }}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div 
                                className="w-10 h-10 rounded-full overflow-hidden"
                                style={{ 
                                  backgroundColor: 'var(--bg-elevated)',
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
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {/* Navy Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'light' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#0F172A' }}
                              onClick={() => setTheme('light')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'light' 
                                    ? 'bg-white border-white' 
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
                              <p className="text-sm text-gray-400">Navy blue background</p>
                            </div>

                            {/* Grey Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'grey' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#1A1A1E' }}
                              onClick={() => setTheme('grey')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'grey' 
                                    ? 'bg-white border-white' 
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
                                theme === 'dark' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#000000' }}
                              onClick={() => setTheme('dark')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'dark' 
                                    ? 'bg-white border-white' 
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

                            {/* Rose Option */}
                            <div
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'rose' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#120810' }}
                              onClick={() => setTheme('rose')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'rose' ? 'bg-white border-white' : 'bg-white border-gray-400'
                                }`}>
                                  {theme === 'rose' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg mb-2" style={{ backgroundColor: '#1C1018' }}></div>
                                <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: '#2E1A28' }}></div>
                                <div className="h-2 rounded w-1/2" style={{ backgroundColor: '#2E1A28' }}></div>
                              </div>
                              <h4 className="font-semibold text-white mb-1">Rose</h4>
                              <p className="text-sm" style={{ color: '#94A3B8' }}>Midnight rose</p>
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
                    renderAccountType={() => <div></div>}
                    renderPayoutMethods={() => <div></div>}
                    renderDisplay={() => (
                      <div className="space-y-6 lg:space-y-8">
                        {/* Preview Section */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Preview</h3>
                          <div 
                            className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border transition-all duration-300"
                            style={{ 
                              backgroundColor: 'var(--bg-primary)', 
                              borderColor: 'var(--border-subtle)'
                            }}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div 
                                className="w-10 h-10 rounded-full overflow-hidden"
                                style={{ 
                                  backgroundColor: 'var(--bg-elevated)',
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
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {/* Navy Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'light' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#0F172A' }}
                              onClick={() => setTheme('light')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'light' 
                                    ? 'bg-white border-white' 
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
                              <p className="text-sm text-gray-400">Navy blue background</p>
                            </div>

                            {/* Grey Option */}
                            <div 
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'grey' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#1A1A1E' }}
                              onClick={() => setTheme('grey')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'grey' 
                                    ? 'bg-white border-white' 
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
                                theme === 'dark' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#000000' }}
                              onClick={() => setTheme('dark')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'dark' 
                                    ? 'bg-white border-white' 
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

                            {/* Rose Option */}
                            <div
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'rose' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#120810' }}
                              onClick={() => setTheme('rose')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'rose' ? 'bg-white border-white' : 'bg-white border-gray-400'
                                }`}>
                                  {theme === 'rose' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg mb-2" style={{ backgroundColor: '#1C1018' }}></div>
                                <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: '#2E1A28' }}></div>
                                <div className="h-2 rounded w-1/2" style={{ backgroundColor: '#2E1A28' }}></div>
                              </div>
                              <h4 className="font-semibold text-white mb-1">Rose</h4>
                              <p className="text-sm" style={{ color: '#94A3B8' }}>Midnight rose</p>
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
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}>
                                <CheckCircle className="w-3 h-3" /> Verified
                              </span>
                            )}
                            {selectedUser.profile_completed && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}>
                                <CheckCircle className="w-3 h-3" /> Profile Complete
                              </span>
                            )}
                            {!selectedUser.verified && !selectedUser.profile_completed && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: tokens.bg.active, color: tokens.text.muted, border: `1px solid ${tokens.border.subtle}` }}>
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
                      <p className="text-sm" style={{ color: tokens.text.muted }}>All social links and external accounts connected to this user's profile</p>
                    </div>

                    {userSocialLinksLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <AnimatedBarsLoader text="Loading accounts..." />
                      </div>
                    ) : userSocialLinks.length === 0 ? (
                      <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                        <div className="flex items-center justify-center min-h-[200px]">
                          <div className="text-center">
                            <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.active }}>
                              <Link2 className="w-7 h-7" style={{ color: tokens.text.muted }} />
                            </div>
                            <h4 className="text-base font-semibold mb-1" style={{ color: tokens.text.primary }}>No connected accounts</h4>
                            <p className="text-sm" style={{ color: tokens.text.muted }}>This user hasn't connected any social accounts yet</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {userSocialLinks.map(link => (
                          <div key={link.id} className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: tokens.bg.active }}>
                                  <Link2 className="w-4 h-4" style={{ color: tokens.text.secondary }} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                    <p className="text-sm font-semibold" style={{ color: tokens.text.primary }}>{link.display_name || link.platform}</p>
                                    <span className="text-xs px-2 py-0.5 rounded font-medium capitalize" style={{ backgroundColor: tokens.bg.active, color: tokens.text.muted, border: `1px solid ${tokens.border.subtle}` }}>{link.platform}</span>
                                    {link.verified ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}>
                                        <CheckCircle className="w-3 h-3" /> Verified
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: tokens.bg.active, color: tokens.text.muted, border: `1px solid ${tokens.border.subtle}` }}>
                                        <XCircle className="w-3 h-3" /> Unverified
                                      </span>
                                    )}
                                  </div>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline flex items-center gap-1 truncate" style={{ color: tokens.text.muted }}>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{link.url}</span>
                                  </a>
                                  {link.channel_type && <p className="text-xs mt-1" style={{ color: tokens.text.muted }}>Type: {link.channel_type}</p>}
                                  {link.channel_description && <p className="text-xs mt-1 line-clamp-2" style={{ color: tokens.text.muted }}>{link.channel_description}</p>}
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <p className="text-xs" style={{ color: tokens.text.muted }}>Added</p>
                                <p className="text-xs font-medium" style={{ color: tokens.text.secondary }}>{new Date(link.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
    </>
  );
}
