import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useTheme } from '../contexts/ThemeContext';

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
  application_type: 'freelancer_onboarding' | 'creator_verification' | 'artist_account';
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
  decline_reason: string | null;
  created_at: string;
  image_url: string | null;
  artist_type: string | null;
  artist_role: string | null;
  artist_genre: string | null;
  website_url: string | null;
  facebook_url: string | null;
  x_handle: string | null;
  instagram_handle: string | null;
  youtube_channel: string | null;
  tiktok_username: string | null;
  apple_music_id: string | null;
  spotify_id: string | null;
  soundcloud_id: string | null;
  deezer_id: string | null;
  audiomack_id: string | null;
  amazon_id: string | null;
}

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [newMessageSound, setNewMessageSound] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem('newMessageSound') ?? 'true'); } catch { return true; }
  });
  const handleToggleNewMessageSound = () => {
    setNewMessageSound(prev => {
      const next = !prev;
      localStorage.setItem('newMessageSound', JSON.stringify(next));
      return next;
    });
  };
  const { theme, setTheme, tokens, flatBackground, setFlatBackground } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailSection, setUserDetailSection] = useState<'personal' | 'connected' | 'payment' | 'notifications' | 'account-actions'>('personal');
  const [userSocialLinks, setUserSocialLinks] = useState<SocialLink[]>([]);
  const [userSocialLinksLoading, setUserSocialLinksLoading] = useState(false);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState<'idle' | 'confirm'>('idle');
  const [suspendStep, setSuspendStep] = useState<'idle' | 'reason' | 'confirm'>('idle');
  const [suspendReason, setSuspendReason] = useState('');
  const [adminProfileId, setAdminProfileId] = useState<string | null>(null);
  const adminUnreadCount = useAdminUnreadCount();
  const [userSearch, setUserSearch] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState<'pending' | 'approved' | 'denied'>('pending');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [declineModalId, setDeclineModalId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  // Release submissions state
  const [releaseSubmissions, setReleaseSubmissions] = useState<any[]>([]);
  const [releaseSubmissionsLoading, setReleaseSubmissionsLoading] = useState(false);
  const [relSubStatusFilter, setRelSubStatusFilter] = useState<'submitted' | 'approved' | 'inactive'>('submitted');
  const [actioningRelSubId, setActioningRelSubId] = useState<string | null>(null);
  const [declineRelSubId, setDeclineRelSubId] = useState<string | null>(null);
  const [declineRelSubReason, setDeclineRelSubReason] = useState('');
  const [expandedRelSubId, setExpandedRelSubId] = useState<string | null>(null);

  const fetchReleaseSubmissions = useCallback(async () => {
    setReleaseSubmissionsLoading(true);
    try {
      const { data, error } = await supabase
        .from('release_drafts')
        .select('*, users!release_drafts_user_id_fkey(full_name, username, email, first_name, last_name)')
        .in('status', ['submitted', 'approved', 'inactive'])
        .order('updated_at', { ascending: false });
      if (error) {
        console.error('[AdminDashboard] fetchReleaseSubmissions error:', error);
        // Fallback: fetch without join
        const { data: fallback, error: fbErr } = await supabase
          .from('release_drafts')
          .select('*')
          .in('status', ['submitted', 'approved', 'inactive'])
          .order('updated_at', { ascending: false });
        if (fbErr) console.error('[AdminDashboard] fallback fetch error:', fbErr);
        else setReleaseSubmissions(fallback || []);
      } else {
        setReleaseSubmissions(data || []);
      }
    } catch (e) {
      console.error('Error fetching release submissions:', e);
    } finally {
      setReleaseSubmissionsLoading(false);
    }
  }, []);

  const handleReleaseSubmissionAction = async (id: string, action: 'approved' | 'inactive', _reason?: string) => {
    setActioningRelSubId(id);
    try {
      const { error } = await supabase
        .from('release_drafts')
        .update({ status: action })
        .eq('id', id);
      if (!error) {
        setReleaseSubmissions(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
      }
    } catch (e) {
      console.error('Error updating release submission:', e);
    } finally {
      setActioningRelSubId(null);
      setDeclineRelSubId(null);
      setDeclineRelSubReason('');
    }
  };

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

  // Feedback state
  interface FeedbackEntry {
    id: string;
    user_id: string;
    category: string;
    content: string;
    status: string;
    created_at: string;
    user_email?: string;
    username?: string;
    media_url?: string;
  }
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState<string | null>(null);
  const [expandedHomeCard, setExpandedHomeCard] = useState<string | null>(null);

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

  // Lock body scroll when user detail modal is open
  useEffect(() => {
    if (selectedUser) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedUser]);

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
    setDeleteConfirmStep('idle');
    setSuspendStep('idle');
    setSuspendReason('');
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
        .select('*, users(full_name, username, email, first_name, last_name)')
        .order('created_at', { ascending: false });
      if (!error) {
        const enriched = (data || []).map((app: any) => {
          const u = app.users;
          return {
            ...app,
            full_name: app.full_name || (u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.full_name || null : null),
            username: app.username || u?.username || null,
            email: app.email || u?.email || null,
          };
        });
        setApplications(enriched);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === 'applications') {
      fetchApplications();
      fetchReleaseSubmissions();
      // Real-time subscription
      const channel = supabase
        .channel('applications-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
          fetchApplications();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'release_drafts' }, () => {
          fetchReleaseSubmissions();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeSection, fetchApplications, fetchReleaseSubmissions]);

  const fetchFeedback = useCallback(async () => {
    setFeedbackLoading(true);
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching feedback:', error);
      } else if (data) {
        // Fetch user info separately to avoid FK join issues
        const userIds = [...new Set(data.map((f: any) => f.user_id))];
        let userMap: Record<string, { email?: string; username?: string }> = {};
        if (userIds.length > 0) {
          const { data: users } = await supabase
            .from('users')
            .select('id, email, username')
            .in('id', userIds);
          if (users) {
            users.forEach((u: any) => { userMap[u.id] = { email: u.email, username: u.username }; });
          }
        }
        setFeedbackEntries(data.map((f: any) => ({
          ...f,
          user_email: userMap[f.user_id]?.email,
          username: userMap[f.user_id]?.username,
        })));
      }
    } catch (e) {
      console.error('Error fetching feedback:', e);
    } finally {
      setFeedbackLoading(false);
    }
  }, []);


  useEffect(() => {
    if (activeSection === 'data') {
      fetchFeedback();
    }
  }, [activeSection, fetchFeedback]);

  const handleFeedbackStatusUpdate = async (id: string, status: string) => {
    setUpdatingFeedbackId(id);
    try {
      const { error } = await supabase.from('feedback').update({ status }).eq('id', id);
      if (!error) {
        setFeedbackEntries(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      }
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  const renderAdminFeedback = () => {
    const categoryLabels: Record<string, string> = {
      suggestion: 'Suggestion',
      bug: 'Bug Report',
      feature: 'Feature Request',
      other: 'Other',
    };
    const filtered = feedbackEntries.filter(f => {
      if (feedbackCategoryFilter !== 'all' && f.category !== feedbackCategoryFilter) return false;
      if (feedbackStatusFilter !== 'all' && f.status !== feedbackStatusFilter) return false;
      return true;
    });
    const counts = {
      total: feedbackEntries.length,
      pending: feedbackEntries.filter(f => f.status === 'pending').length,
      bug: feedbackEntries.filter(f => f.category === 'bug').length,
      feature: feedbackEntries.filter(f => f.category === 'feature').length,
      suggestion: feedbackEntries.filter(f => f.category === 'suggestion').length,
    };
    return (
      <div className="scroll-mt-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-7">
          {[
            { label: 'Total', value: counts.total, filter: 'all' },
            { label: 'Pending', value: counts.pending, filter: 'pending' },
            { label: 'Bug Reports', value: counts.bug, filter: null },
            { label: 'Features', value: counts.feature, filter: null },
            { label: 'Suggestions', value: counts.suggestion, filter: null },
          ].map(s => (
            <button
              key={s.label}
              onClick={() => s.filter !== null ? setFeedbackStatusFilter(s.filter) : undefined}
              className="rounded-xl p-4 border text-left transition-all"
              style={{ backgroundColor: tokens.bg.elevated, borderColor: s.filter !== null && feedbackStatusFilter === s.filter ? tokens.border.default : tokens.border.subtle, cursor: s.filter !== null ? 'pointer' : 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tokens.border.default; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = s.filter !== null && feedbackStatusFilter === s.filter ? tokens.border.default : tokens.border.subtle; }}
              onMouseDown={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
              onMouseUp={e => { e.currentTarget.style.borderColor = tokens.border.default; }}
            >
              <p className="text-2xl font-bold mb-0.5" style={{ color: tokens.text.primary }}>{s.value}</p>
              <p className="text-xs" style={{ color: tokens.text.primary, opacity: 0.6 }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* Status tabs + category filter row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex gap-1 p-1 rounded-xl flex-shrink-0" style={{ backgroundColor: tokens.bg.input }}>
            {['pending', 'reviewed', 'resolved', 'closed', 'all'].map(st => (
              <button
                key={st}
                onClick={() => setFeedbackStatusFilter(st)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: feedbackStatusFilter === st ? 'var(--bg-elevated)' : 'transparent',
                  color: tokens.text.primary,
                  border: feedbackStatusFilter === st ? '1px solid var(--text-primary)' : '1px solid transparent',
                }}
              >
                {st === 'all' ? 'All' : st.charAt(0).toUpperCase() + st.slice(1)}
                <span className="ml-1.5 text-xs" style={{ opacity: 0.5 }}>
                  {st === 'all' ? feedbackEntries.length : feedbackEntries.filter(f => f.status === st).length}
                </span>
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'suggestion', 'bug', 'feature', 'other'].map(cat => (
              <button
                key={cat}
                onClick={() => setFeedbackCategoryFilter(cat)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  backgroundColor: feedbackCategoryFilter === cat ? 'var(--bg-elevated)' : 'transparent',
                  color: tokens.text.primary,
                  border: `1px solid ${feedbackCategoryFilter === cat ? 'var(--text-primary)' : tokens.border.subtle}`,
                }}
              >
                {cat === 'all' ? 'All Types' : categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback list */}
        {feedbackLoading ? (
          <div className="flex items-center justify-center py-20">
            <AnimatedBarsLoader text="Loading feedback..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
              <svg className="w-6 h-6" style={{ color: tokens.text.primary, opacity: 0.35 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            </div>
            <p className="font-semibold" style={{ color: tokens.text.primary }}>No {feedbackStatusFilter !== 'all' ? feedbackStatusFilter : ''} feedback</p>
            <p className="text-sm mt-1" style={{ color: tokens.text.primary, opacity: 0.5 }}>{feedbackStatusFilter === 'pending' ? 'All caught up — no pending items.' : 'Try adjusting your filters'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(f => (
              <div key={f.id} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: tokens.bg.elevated, borderColor: tokens.border.subtle }}>
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ backgroundColor: 'var(--bg-card)', border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary }}>
                          {categoryLabels[f.category] || f.category}
                        </span>
                        <span className="text-xs font-medium" style={{ color: tokens.text.primary, opacity: 0.6 }}>
                          {f.username ? `@${f.username}` : f.user_email || f.user_id.slice(0, 8)}
                        </span>
                        <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.35 }}>
                          {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: tokens.text.primary }}>{f.content}</p>
                      {f.media_url && (
                        <div className="mt-3">
                          {f.media_url.match(/\.(mp4|mov|webm|ogg)$/i) ? (
                            <video src={f.media_url} controls className="max-h-52 rounded-xl" style={{ border: `1px solid ${tokens.border.subtle}` }} />
                          ) : (
                            <a href={f.media_url} target="_blank" rel="noopener noreferrer">
                              <img src={f.media_url} alt="Attached media" className="max-h-52 rounded-xl object-cover transition-all hover:brightness-110" style={{ border: `1px solid ${tokens.border.subtle}` }} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex flex-col gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-center" style={{ backgroundColor: 'var(--bg-card)', border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary }}>
                        {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                      </span>
                      {['pending', 'reviewed', 'resolved', 'closed'].filter(s => s !== f.status).map(s => (
                        <button
                          key={s}
                          onClick={() => handleFeedbackStatusUpdate(f.id, s)}
                          disabled={updatingFeedbackId === f.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all hover:brightness-110 text-left"
                          style={{ backgroundColor: 'transparent', border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary, opacity: updatingFeedbackId === f.id ? 0.4 : 0.7 }}
                        >
                          → {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (activeSection === 'home') {
      fetchWhitelistedChannels();
      fetchCampaigns();
      fetchFeedback();
    }
  }, [activeSection, fetchWhitelistedChannels, fetchCampaigns, fetchFeedback]);

  useEffect(() => {
    if (activeSection === 'settings') {
      fetchFeedback();
    }
  }, [activeSection, fetchFeedback]);

  const handleApplicationAction = async (id: string, action: 'approved' | 'denied', reason?: string) => {
    setActioningId(id);
    try {
      const result = await adminFetch('admin-application-action', {
        method: 'POST',
        body: JSON.stringify({ applicationId: id, action, declineReason: reason }),
      });
      if (result?.success) {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status: action, decline_reason: reason || null } : a));
      } else {
        console.error('Error updating application:', result?.message);
      }
    } catch (e) {
      console.error('Error updating application:', e);
    } finally {
      setActioningId(null);
      setDeclineModalId(null);
      setDeclineReason('');
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

  if (isLoading && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: tokens.bg.primary }}>
        <AnimatedBarsLoader text="Loading dashboard..." />
      </div>
    );
  }

  if (!admin) {
    return null;
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
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tokens.text.primary, opacity: 0.4, animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tokens.text.primary, opacity: 0.4, animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: tokens.text.primary, opacity: 0.4, animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other sections inside wrapper */}
        {activeSection !== 'messages' && (
          <div className="px-4 sm:px-8 py-6 sm:py-12">
            {activeSection === 'home' && (
              <div className="animate-fade-in">
                <div className="mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: tokens.text.primary }}>Welcome back, Super Admin</h1>
                  <p className="text-base" style={{ color: tokens.text.primary }}>Manage your platform from here</p>
                </div>
                {/* Quick Nav Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <button onClick={() => setActiveSection('applications')} className="rounded-xl p-5 text-left transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: `1px solid ${tokens.border.subtle}`, opacity: 1, transform: 'none', animation: 'adminCardIn 0.45s ease both' }}>
                    <div className="flex items-center gap-4">
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold" style={{ color: tokens.text.primary }}>Applications</h3>
                          <span className="text-2xl font-bold" style={{ color: tokens.text.primary }}>{applications.filter(a => a.status === 'pending').length}</span>
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: tokens.text.primary, opacity: 0.55 }}>Pending creator applications</p>
                      </div>
                    </div>
                  </button>
                  <button onClick={() => setActiveSection('users')} className="rounded-xl p-5 text-left transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: `1px solid ${tokens.border.subtle}`, animation: 'adminCardIn 0.45s ease 0.08s both' }}>
                    <div className="flex items-center gap-4">
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-semibold" style={{ color: tokens.text.primary }}>Users</h3>
                          <span className="text-2xl font-bold" style={{ color: tokens.text.primary }}>{users.length}</span>
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: tokens.text.primary, opacity: 0.55 }}>Registered platform users</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Service Cards */}
                <style>{`@keyframes adminCardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: tokens.text.primary, opacity: 0.4, letterSpacing: '0.12em' }}>Platform Tools</p>

                {/* Channel Link Whitelist Card */}
                <div className="rounded-xl overflow-hidden" style={{ border: expandedHomeCard === 'whitelist' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`, animation: 'adminCardIn 0.45s ease 0.16s both' }}>
                  <button
                    onClick={() => setExpandedHomeCard(expandedHomeCard === 'whitelist' ? null : 'whitelist')}
                    className="w-full flex items-center justify-between px-5 py-4 transition-all hover:brightness-110"
                    style={{ backgroundColor: tokens.bg.card }}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: tokens.text.primary }}>Channel Link Whitelist</p>
                        <p className="text-xs mt-0.5" style={{ color: tokens.text.primary, opacity: 0.5 }}>{whitelistedChannels.length} pattern{whitelistedChannels.length !== 1 ? 's' : ''} configured</p>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedHomeCard === 'whitelist' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.5 }}><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {expandedHomeCard === 'whitelist' && (
                  <div className="px-5 pb-5 pt-1" style={{ backgroundColor: tokens.bg.elevated, borderTop: `1px solid ${tokens.border.subtle}` }}>
                  <p className="text-xs mb-4 mt-3" style={{ color: tokens.text.primary, opacity: 0.55 }}>Social links matching a whitelisted pattern are automatically verified — no verification prompt shown to the user.</p>

                  {/* Add form */}
                  <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: tokens.bg.card, border: `1px solid ${tokens.border.subtle}` }}>
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
                        onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                        onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                      />
                      <input
                        type="text"
                        value={whitelistPlatform}
                        onChange={e => setWhitelistPlatform(e.target.value)}
                        placeholder="Platform (optional)"
                        className="w-full sm:w-36 h-9 px-3 rounded-lg text-sm focus:outline-none"
                        style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                        onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                      />
                      <input
                        type="text"
                        value={whitelistNote}
                        onChange={e => setWhitelistNote(e.target.value)}
                        placeholder="Note (optional)"
                        className="w-full sm:w-40 h-9 px-3 rounded-lg text-sm focus:outline-none"
                        style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                        onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                      />
                      <button
                        onClick={handleAddWhitelist}
                        disabled={whitelistAdding || !whitelistInput.trim()}
                        className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50 flex-shrink-0"
                        style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                      >
                        {whitelistAdding ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
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
                      <svg className="w-10 h-10 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                      <p className="text-sm" style={{ color: tokens.text.primary }}>No whitelisted patterns yet. Add one above.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {whitelistedChannels.map(ch => (
                        <div
                          key={ch.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg"
                          style={{ backgroundColor: tokens.bg.card, border: `1px solid ${tokens.border.subtle}` }}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
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
                            style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                          >
                            {removingWhitelistId === ch.id ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                  )}
                </div>

                {/* Campaign Manager Card */}
                <div className="rounded-xl overflow-hidden" style={{ border: expandedHomeCard === 'campaigns' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`, animation: 'adminCardIn 0.45s ease 0.24s both' }}>
                  <button
                    onClick={() => setExpandedHomeCard(expandedHomeCard === 'campaigns' ? null : 'campaigns')}
                    className="w-full flex items-center justify-between px-5 py-4 transition-all hover:brightness-110"
                    style={{ backgroundColor: tokens.bg.card }}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: tokens.text.primary }}>Campaign Manager</p>
                        <p className="text-xs mt-0.5" style={{ color: tokens.text.primary, opacity: 0.5 }}>{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} active</p>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedHomeCard === 'campaigns' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.5 }}><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {expandedHomeCard === 'campaigns' && (
                  <div className="px-5 pb-5 pt-1" style={{ backgroundColor: tokens.bg.elevated, borderTop: `1px solid ${tokens.border.subtle}` }}>
                  <div className="flex items-center justify-between mt-3 mb-4">
                    <p className="text-xs" style={{ color: tokens.text.primary, opacity: 0.55 }}>Create campaigns and assign them to users. Assigned campaigns appear in the user's dashboard.</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowCampaignForm(v => !v); setCampaignError(null); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 flex-shrink-0 ml-4"
                      style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                    >
                      {showCampaignForm ? <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg> Cancel</> : <><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg> New Campaign</>}
                    </button>
                  </div>

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
                            onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
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
                            onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
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
                          onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
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
                          onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
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
                                border: `1px solid ${campaignForm.platforms.includes(p) ? 'var(--text-primary)' : tokens.border.subtle}`,
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
                            className="w-full h-9 px-3 rounded-lg text-sm flex items-center justify-between focus:outline-none transition-all"
                            style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                            onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                            onBlur={e => e.currentTarget.style.borderColor = tokens.border.default}
                          >
                            <span>{campaignForm.pay_type}</span>
                            <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${payTypeDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M6 9l6 6 6-6"/></svg>
                          </button>
                          {payTypeDropdownOpen && (
                            <div className="absolute z-20 w-full mt-1 rounded-lg overflow-hidden shadow-xl" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.default}` }}>
                              {['Per view', 'Varied'].map(opt => (
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
                            onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
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
                            onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
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
                          onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
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
                          onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
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
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg> Add song
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
                                onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                                onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                              />
                              <input
                                type="text"
                                value={song.artist}
                                onChange={e => setCampaignForm(f => { const s = [...f.songs]; s[i] = { ...s[i], artist: e.target.value }; return { ...f, songs: s }; })}
                                placeholder="Artist"
                                className="flex-1 h-8 px-2.5 rounded-lg text-xs focus:outline-none"
                                style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                                onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                              />
                              <input
                                type="text"
                                value={song.url}
                                onChange={e => setCampaignForm(f => { const s = [...f.songs]; s[i] = { ...s[i], url: e.target.value }; return { ...f, songs: s }; })}
                                placeholder="Link (optional)"
                                className="flex-1 h-8 px-2.5 rounded-lg text-xs focus:outline-none"
                                style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                                onBlur={(e) => e.target.style.borderColor = tokens.border.default}
                              />
                              {campaignForm.songs.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => setCampaignForm(f => ({ ...f, songs: f.songs.filter((_, j) => j !== i) }))}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 hover:brightness-110"
                                  style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary }}
                                >
                                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
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
                              backgroundColor: campaignForm.assign_to === 'all' ? tokens.bg.elevated : 'transparent',
                              color: tokens.text.primary,
                              border: campaignForm.assign_to === 'all' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
                            }}
                          >
                            All Creators
                          </button>
                          <button
                            type="button"
                            onClick={() => setCampaignForm(f => ({ ...f, assign_to: 'specific' }))}
                            className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{
                              backgroundColor: campaignForm.assign_to === 'specific' ? tokens.bg.elevated : 'transparent',
                              color: tokens.text.primary,
                              border: campaignForm.assign_to === 'specific' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
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
                                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ color: tokens.text.primary }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                                <input
                                  type="text"
                                  value={campaignUserSearch}
                                  onChange={e => setCampaignUserSearch(e.target.value)}
                                  placeholder="Search creators..."
                                  className="flex-1 text-xs bg-transparent focus:outline-none"
                                  style={{ color: tokens.text.primary }}
                                  onFocus={(e) => (e.target.closest('.flex.items-center.gap-2') as HTMLElement)?.style.setProperty('border-color', 'var(--text-primary)')}
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
                                      onClick={() => setCampaignForm(f => ({
                                        ...f,
                                        assigned_user_ids: f.assigned_user_ids.includes(u.id)
                                          ? f.assigned_user_ids.filter(id => id !== u.id)
                                          : [...f.assigned_user_ids, u.id]
                                      }))}
                                    >
                                      <div
                                        className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                                        style={{
                                          backgroundColor: campaignForm.assigned_user_ids.includes(u.id) ? tokens.text.primary : 'transparent',
                                          border: `1px solid ${campaignForm.assigned_user_ids.includes(u.id) ? tokens.text.primary : tokens.border.default}`
                                        }}
                                      >
                                        {campaignForm.assigned_user_ids.includes(u.id) && (
                                          <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.bg.primary }}><path d="M20 6L9 17l-5-5"/></svg>
                                        )}
                                      </div>
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
                          {campaignSaving ? <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
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
                      <svg className="w-10 h-10 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
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
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
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
                                {reassigningCampaignId === c.id ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : 'Reassign'}
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(c.id); }}
                                disabled={deletingCampaignId === c.id}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-50"
                                style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                              >
                                {deletingCampaignId === c.id ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>}
                              </button>
                              <svg className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${expandedCampaignId === c.id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M6 9l6 6 6-6"/></svg>
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
                                        <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                        <span className="text-xs font-medium" style={{ color: tokens.text.primary }}>{s.title}</span>
                                        {s.artist && <span className="text-xs" style={{ color: tokens.text.primary }}>— {s.artist}</span>}
                                        {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: tokens.text.primary }}><svg className="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>}
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
                  )}
                </div>

                {/* Alerts Card */}
                <div className="rounded-xl overflow-hidden" style={{ border: expandedHomeCard === 'alerts' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`, animation: 'adminCardIn 0.45s ease 0.32s both' }}>
                  <button
                    onClick={() => setExpandedHomeCard(expandedHomeCard === 'alerts' ? null : 'alerts')}
                    className="w-full flex items-center justify-between px-5 py-4 transition-all hover:brightness-110"
                    style={{ backgroundColor: tokens.bg.card }}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                      <div className="text-left">
                        <p className="text-sm font-semibold" style={{ color: tokens.text.primary }}>Alerts</p>
                        <p className="text-xs mt-0.5" style={{ color: tokens.text.primary, opacity: 0.5 }}>Send announcements to users</p>
                      </div>
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedHomeCard === 'alerts' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.5 }}><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {expandedHomeCard === 'alerts' && (
                    <div className="px-5 pb-5 pt-3" style={{ backgroundColor: tokens.bg.elevated, borderTop: `1px solid ${tokens.border.subtle}` }}>
                      {adminProfileId && <AnnouncementSender adminId={adminProfileId} />}
                    </div>
                  )}
                </div>

                </div>
              </div>
            )}

            {activeSection === 'applications' && (
              <div className="animate-fade-in">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: tokens.text.primary }}>Applications</h2>
                    <p className="text-sm sm:text-base" style={{ color: tokens.text.primary, opacity: 0.6 }}>Freelancer onboarding, creator verification, and artist account requests</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchApplications}
                      disabled={applicationsLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                      style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                    >
                      <svg className={`w-3.5 h-3.5 ${applicationsLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                      Refresh
                    </button>
                    {(['pending', 'approved', 'denied'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => setAppStatusFilter(s)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                        style={{
                          backgroundColor: appStatusFilter === s ? tokens.bg.elevated : 'transparent',
                          color: tokens.text.primary,
                          border: appStatusFilter === s ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
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
                    { type: 'artist_account' as const, label: 'Artist Accounts', color: '#f9a8d4' },
                    { type: 'freelancer_onboarding' as const, label: 'Freelancer Onboarding', color: '#60a5fa' },
                    { type: 'creator_verification' as const, label: 'Creator Verification', color: '#a78bfa' },
                  ];
                  const filtered = applications.filter(a => a.status === appStatusFilter);
                  if (filtered.length === 0) {
                    return (
                      <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center px-4">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                          </div>
                          <h3 className="text-xl font-bold mb-2" style={{ color: tokens.text.primary }}>No {appStatusFilter} applications</h3>
                          <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>Applications will appear here once submitted</p>
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
                                          <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>@{app.username}</span>
                                        )}
                                        <span
                                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                                          style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                                        >
                                          {app.status}
                                        </span>
                                      </div>
                                      {app.email && <p className="text-xs mb-2" style={{ color: tokens.text.primary, opacity: 0.5 }}>{app.email}</p>}

                                      {app.application_type === 'artist_account' && (
                                        <div className="mt-3">
                                          {/* Toggle expand */}
                                          <button
                                            onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                                            className="flex items-center gap-1.5 text-xs font-medium mb-3 transition-all hover:opacity-80"
                                            style={{ color: tokens.text.primary, opacity: 0.6 }}
                                          >
                                            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedAppId === app.id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                            {expandedAppId === app.id ? 'Hide details' : 'View full application'}
                                          </button>
                                          {/* Always-visible summary */}
                                          <div className="space-y-1.5">
                                            {app.category && (
                                              <div className="flex items-center gap-3">
                                                {app.image_url && (
                                                  <img src={app.image_url} alt={app.category} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" style={{ border: `1px solid ${tokens.border.subtle}` }} />
                                                )}
                                                <div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Artist Name: </span><span className="text-xs font-semibold" style={{ color: tokens.text.primary }}>{app.category}</span></div>
                                                  {app.artist_type && <div className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>{app.artist_type}{app.artist_role ? ` · ${app.artist_role}` : ''}{app.artist_genre ? ` · ${app.artist_genre}` : ''}</div>}
                                                </div>
                                              </div>
                                            )}
                                            {app.country && <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Country: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.country}</span></div>}
                                            {app.bio && <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Bio: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.bio}</span></div>}
                                          </div>
                                          {/* Expanded full details */}
                                          {expandedAppId === app.id && (
                                            <div className="mt-4 rounded-xl p-4 space-y-4" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}` }}>
                                              {/* Artist info */}
                                              <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>Artist Info</p>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Artist Name: </span><span className="text-xs font-semibold" style={{ color: tokens.text.primary }}>{app.category || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Type: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.artist_type || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Role: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.artist_role || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Genre: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.artist_genre || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Country: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.country || '-'}</span></div>
                                                </div>
                                                {app.bio && <div className="mt-1.5"><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Bio: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.bio}</span></div>}
                                              </div>
                                              {/* Platform IDs */}
                                              <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>Platform IDs</p>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Spotify: </span><span className="text-xs font-mono" style={{ color: tokens.text.primary }}>{app.spotify_id || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Apple Music: </span><span className="text-xs font-mono" style={{ color: tokens.text.primary }}>{app.apple_music_id || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>SoundCloud: </span><span className="text-xs font-mono" style={{ color: tokens.text.primary }}>{app.soundcloud_id || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Deezer: </span><span className="text-xs font-mono" style={{ color: tokens.text.primary }}>{app.deezer_id || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Audiomack: </span><span className="text-xs font-mono" style={{ color: tokens.text.primary }}>{app.audiomack_id || '-'}</span></div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Amazon: </span><span className="text-xs font-mono" style={{ color: tokens.text.primary }}>{app.amazon_id || '-'}</span></div>
                                                </div>
                                              </div>
                                              {/* Social links */}
                                              <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>Social Links</p>
                                                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Instagram: </span>{app.instagram_handle ? <a href={`https://instagram.com/${app.instagram_handle}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: tokens.text.primary }}>@{app.instagram_handle}</a> : <span className="text-xs" style={{ color: tokens.text.primary }}>-</span>}</div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>YouTube: </span>{app.youtube_channel ? <a href={`https://youtube.com/${app.youtube_channel.startsWith('@') ? app.youtube_channel : '@' + app.youtube_channel}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: tokens.text.primary }}>{app.youtube_channel}</a> : <span className="text-xs" style={{ color: tokens.text.primary }}>-</span>}</div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>TikTok: </span>{app.tiktok_username ? <a href={`https://tiktok.com/@${app.tiktok_username}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: tokens.text.primary }}>@{app.tiktok_username}</a> : <span className="text-xs" style={{ color: tokens.text.primary }}>-</span>}</div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>X: </span>{app.x_handle ? <a href={`https://x.com/${app.x_handle}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: tokens.text.primary }}>@{app.x_handle}</a> : <span className="text-xs" style={{ color: tokens.text.primary }}>-</span>}</div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Facebook: </span>{app.facebook_url ? <a href={app.facebook_url.startsWith('http') ? app.facebook_url : `https://facebook.com/${app.facebook_url}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: tokens.text.primary }}>{app.facebook_url}</a> : <span className="text-xs" style={{ color: tokens.text.primary }}>-</span>}</div>
                                                  <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Website: </span>{app.website_url ? <a href={app.website_url.startsWith('http') ? app.website_url : `https://${app.website_url}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: tokens.text.primary }}>{app.website_url}</a> : <span className="text-xs" style={{ color: tokens.text.primary }}>-</span>}</div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {app.application_type === 'freelancer_onboarding' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 mt-2">
                                          {app.professional_title && <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Title: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.professional_title}</span></div>}
                                          {app.category && <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Category: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.category}</span></div>}
                                          {app.hourly_rate != null && <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Rate: </span><span className="text-xs" style={{ color: tokens.text.primary }}>${app.hourly_rate}/hr</span></div>}
                                          {(app.city || app.country) && <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Location: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{[app.city, app.country].filter(Boolean).join(', ')}</span></div>}
                                          {app.skills && app.skills.length > 0 && <div className="col-span-2"><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Skills: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.skills.slice(0, 5).join(', ')}{app.skills.length > 5 ? ` +${app.skills.length - 5}` : ''}</span></div>}
                                        </div>
                                      )}

                                      {app.application_type === 'creator_verification' && (
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                                          {app.platform && <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Platform: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.platform}</span></div>}
                                          {app.channel_type && <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Type: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.channel_type}</span></div>}
                                          {app.social_url && (
                                            <div className="col-span-2">
                                              <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>URL: </span>
                                              <a href={app.social_url} target="_blank" rel="noopener noreferrer" className="text-xs inline-flex items-center gap-1 hover:underline" style={{ color: tokens.text.primary }}>
                                                {app.social_url.replace(/^https?:\/\//i, '').slice(0, 50)}
                                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                              </a>
                                            </div>
                                          )}
                                          {app.channel_description && <div className="col-span-2"><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Description: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{app.channel_description}</span></div>}
                                        </div>
                                      )}

                                      <p className="text-xs mt-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>
                                        Submitted {formatDate(app.created_at)}
                                      </p>
                                    </div>

                                    {app.status === 'pending' && (
                                      <div className="flex gap-2 flex-shrink-0">
                                        <button
                                          onClick={() => handleApplicationAction(app.id, 'approved')}
                                          disabled={actioningId === app.id}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                                          style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                        >
                                          {actioningId === app.id && declineModalId !== app.id ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                                          Verify
                                        </button>
                                        <button
                                          onClick={() => { setDeclineModalId(declineModalId === app.id ? null : app.id); setDeclineReason(''); }}
                                          disabled={actioningId === app.id}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                                          style={{ backgroundColor: declineModalId === app.id ? 'var(--text-primary)' : tokens.bg.elevated, color: declineModalId === app.id ? 'var(--bg-primary)' : tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                        >
                                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                          Decline
                                        </button>
                                      </div>
                                    )}
                                    {app.status === 'denied' && app.decline_reason && (
                                      <div className="flex-shrink-0 max-w-[200px]">
                                        <p className="text-xs font-medium mb-0.5" style={{ color: tokens.text.primary, opacity: 0.5 }}>Decline reason:</p>
                                        <p className="text-xs leading-relaxed" style={{ color: tokens.text.primary }}>{app.decline_reason}</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Inline decline panel */}
                                  {declineModalId === app.id && (
                                    <div className="mt-3 rounded-xl p-4 animate-modal-in" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}` }}>
                                      <p className="text-xs mb-3" style={{ color: tokens.text.primary, opacity: 0.65 }}>Provide a reason for declining — this will be shown to the applicant.</p>
                                      <textarea
                                        autoFocus
                                        value={declineReason}
                                        onChange={e => setDeclineReason(e.target.value)}
                                        placeholder="e.g. Incomplete information, duplicate account, policy violation..."
                                        rows={3}
                                        className="w-full px-3 py-2.5 rounded-lg text-xs focus:outline-none transition-all resize-none mb-3"
                                        style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.default}`, color: tokens.text.primary }}
                                        onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                                        onBlur={e => e.currentTarget.style.borderColor = tokens.border.default}
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => { setDeclineModalId(null); setDeclineReason(''); }}
                                          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                                          style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={() => handleApplicationAction(app.id, 'denied', declineReason.trim() || undefined)}
                                          disabled={actioningId === app.id}
                                          className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                                        >
                                          {actioningId === app.id ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : null}
                                          Confirm Decline
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* ── Release Submissions ───────────────────────────────── */}
                <div className="mt-12">
                  <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1" style={{ color: tokens.text.primary }}>Release Submissions</h2>
                      <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>Music distribution requests from artist accounts</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={fetchReleaseSubmissions}
                        disabled={releaseSubmissionsLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                        style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                      >
                        <svg className={`w-3.5 h-3.5 ${releaseSubmissionsLoading ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                        Refresh
                      </button>
                      {(['submitted', 'approved', 'inactive'] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setRelSubStatusFilter(s)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                          style={{
                            backgroundColor: relSubStatusFilter === s ? tokens.bg.elevated : 'transparent',
                            color: tokens.text.primary,
                            border: relSubStatusFilter === s ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
                          }}
                        >
                          {s === 'submitted' ? 'Pending' : s.charAt(0).toUpperCase() + s.slice(1)}
                          <span className="ml-1.5 opacity-60">
                            {releaseSubmissions.filter(r => r.status === s).length}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px mb-6" style={{ backgroundColor: tokens.border.subtle }} />

                  {releaseSubmissionsLoading ? (
                    <div className="flex items-center justify-center min-h-[200px]">
                      <AnimatedBarsLoader text="Loading..." />
                    </div>
                  ) : (() => {
                    const filtered = releaseSubmissions.filter(r => r.status === relSubStatusFilter);
                    if (filtered.length === 0) return (
                      <div className="flex items-center justify-center min-h-[180px]">
                        <div className="text-center px-4">
                          <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                          </div>
                          <h3 className="text-base font-bold mb-1" style={{ color: tokens.text.primary }}>No {relSubStatusFilter === 'submitted' ? 'pending' : relSubStatusFilter} releases</h3>
                          <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.5 }}>Release submissions will appear here once artists submit.</p>
                        </div>
                      </div>
                    );
                    return (
                      <div className="space-y-3">
                        {filtered.map(rel => {
                          const u = rel.users;
                          const displayName = u ? (`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.full_name || u.username || 'Unknown') : 'Unknown';
                          const username = u?.username;
                          const email = u?.email;
                          const isExpanded = expandedRelSubId === rel.id;
                          const isActioning = actioningRelSubId === rel.id;
                          const isDeclining = declineRelSubId === rel.id;
                          return (
                            <div key={rel.id} className="rounded-xl border overflow-hidden" style={{ backgroundColor: tokens.bg.elevated, borderColor: tokens.border.default }}>
                              <div className="p-5">
                                <div className="flex items-start justify-between gap-4 flex-wrap">
                                  <div className="flex items-start gap-4 flex-1 min-w-0">
                                    {/* Artwork */}
                                    <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}` }}>
                                      {rel.artwork_url ? (
                                        <img src={rel.artwork_url} alt={rel.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.3 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-sm font-bold truncate" style={{ color: tokens.text.primary }}>{rel.title || 'Untitled Release'}</span>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary }}>
                                          {rel.status === 'submitted' ? 'Pending' : rel.status.charAt(0).toUpperCase() + rel.status.slice(1)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-xs font-semibold" style={{ color: tokens.text.primary }}>{displayName}</span>
                                        {username && <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>@{username}</span>}
                                        {email && <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.4 }}>{email}</span>}
                                      </div>
                                      <div className="flex items-center gap-3 flex-wrap">
                                        {(() => { const tc = rel.tracks?.length ?? 0; return <span className="text-xs font-medium" style={{ color: tokens.text.primary, opacity: 0.6 }}>{tc >= 7 ? 'Album' : tc >= 4 ? 'EP' : 'Single'}</span>; })()}
                                        {rel.genre && <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>{rel.genre}{rel.secondary_genre ? ` · ${rel.secondary_genre}` : ''}</span>}
                                        {rel.release_artists && <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>by {rel.release_artists}</span>}
                                        {rel.tracks?.length > 0 && <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.4 }}>{rel.tracks.length} track{rel.tracks.length !== 1 ? 's' : ''}</span>}
                                      </div>
                                      <p className="text-xs mt-1.5" style={{ color: tokens.text.primary, opacity: 0.4 }}>Submitted {formatDate(rel.updated_at)}</p>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => setExpandedRelSubId(isExpanded ? null : rel.id)}
                                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:brightness-110"
                                      style={{ backgroundColor: 'transparent', color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                                    >
                                      <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                      {isExpanded ? 'Hide' : 'Details'}
                                    </button>
                                    {rel.status === 'submitted' && (
                                      <>
                                        <button
                                          onClick={() => handleReleaseSubmissionAction(rel.id, 'approved')}
                                          disabled={isActioning}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                                          style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                        >
                                          {isActioning && !isDeclining ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>}
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => { setDeclineRelSubId(isDeclining ? null : rel.id); setDeclineRelSubReason(''); }}
                                          disabled={isActioning}
                                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                                          style={{ backgroundColor: isDeclining ? 'var(--text-primary)' : tokens.bg.elevated, color: isDeclining ? 'var(--bg-primary)' : tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                        >
                                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                          Decline
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Decline form */}
                                {isDeclining && (
                                  <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}` }}>
                                    <p className="text-xs font-semibold mb-2" style={{ color: tokens.text.primary }}>Decline reason (optional)</p>
                                    <textarea
                                      value={declineRelSubReason}
                                      onChange={e => setDeclineRelSubReason(e.target.value)}
                                      placeholder="Reason for declining this release..."
                                      rows={2}
                                      className="w-full px-3 py-2 rounded-lg text-xs resize-none focus:outline-none mb-3"
                                      style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                      onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                                      onBlur={e => e.currentTarget.style.borderColor = tokens.border.default}
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => { setDeclineRelSubId(null); setDeclineRelSubReason(''); }}
                                        className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                                        style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => handleReleaseSubmissionAction(rel.id, 'inactive', declineRelSubReason.trim() || undefined)}
                                        disabled={isActioning}
                                        className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-1.5"
                                        style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                                      >
                                        {isActioning ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg> : null}
                                        Confirm Decline
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Expanded detail */}
                                {isExpanded && (() => {
                                  const trackCount = rel.tracks?.length ?? 0;
                                  const releaseType = trackCount >= 7 ? 'Album' : trackCount >= 4 ? 'EP' : 'Single';
                                  return (
                                  <div className="mt-4 rounded-xl p-4 space-y-5" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}` }}>

                                    {/* Cover Art + Release Info side by side */}
                                    <div className="flex gap-4">
                                      {/* Cover Art */}
                                      <div className="flex-shrink-0">
                                        <div className="w-24 h-24 rounded-xl overflow-hidden" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}>
                                          {rel.artwork_url ? (
                                            <img src={rel.artwork_url} alt={rel.title} className="w-full h-full object-cover" />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.3 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                            </div>
                                          )}
                                        </div>
                                        {rel.artwork_url && (
                                          <a
                                            href={rel.artwork_url}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1.5 flex items-center justify-center gap-1 w-full px-2 py-1 rounded-lg text-[10px] font-medium transition-all hover:brightness-110"
                                            style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}
                                          >
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            Download
                                          </a>
                                        )}
                                      </div>

                                      {/* Release Info */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>Release Info</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                                          <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Type: </span><span className="text-xs font-semibold" style={{ color: tokens.text.primary }}>{releaseType}</span></div>
                                          <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Title: </span><span className="text-xs font-semibold" style={{ color: tokens.text.primary }}>{rel.title || '-'}</span></div>
                                          <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Artists: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.release_artists || '-'}</span></div>
                                          <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Label: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.record_label || 'Independent'}</span></div>
                                          <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Primary Genre: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.genre || '-'}</span></div>
                                          <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Secondary Genre: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.secondary_genre || '-'}</span></div>
                                          <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Language: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.language || '-'}</span></div>
                                          <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Release Date: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.release_date || '-'}</span></div>
                                          {rel.released_before && (
                                            <div className="col-span-2"><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>Original Release Date: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.original_release_date || '-'}</span></div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Copyright & Production */}
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>Copyright & Production</p>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1.5">
                                        <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>© Holder: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.copyright_holder || '-'}</span></div>
                                        <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>© Year: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.copyright_year || '-'}</span></div>
                                        <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>℗ Holder: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.production_holder || '-'}</span></div>
                                        <div><span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>℗ Year: </span><span className="text-xs" style={{ color: tokens.text.primary }}>{rel.production_year || '-'}</span></div>
                                      </div>
                                    </div>

                                    {/* Tracks */}
                                    {trackCount > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>Tracks ({trackCount})</p>
                                        <div className="space-y-1.5">
                                          {rel.tracks.map((t: any, i: number) => (
                                            <div key={i} className="flex items-start gap-3 py-1.5 px-2 rounded-lg" style={{ backgroundColor: tokens.bg.elevated }}>
                                              <span className="text-xs w-5 text-right flex-shrink-0 mt-0.5" style={{ color: tokens.text.primary, opacity: 0.4 }}>{i + 1}</span>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  <span className="text-xs font-medium" style={{ color: tokens.text.primary }}>{t.title || 'Untitled'}</span>
                                                  {t.featuring && <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.5 }}>ft. {t.featuring}</span>}
                                                  {t.explicit && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary }}>E</span>}
                                                </div>
                                                {t.fileName && (
                                                  <div className="flex items-center gap-1 mt-0.5">
                                                    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.4 }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                                                    <span className="text-[10px] truncate" style={{ color: tokens.text.primary, opacity: 0.45 }}>{t.fileName}</span>
                                                  </div>
                                                )}
                                              </div>
                                              {t.isrcCode && <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: tokens.text.primary, opacity: 0.4 }}>ISRC: {t.isrcCode}</span>}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Copyright Documentation */}
                                    {rel.copyright_doc_urls?.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>Copyright Documentation</p>
                                        <div className="space-y-1">
                                          {rel.copyright_doc_urls.map((docUrl: string, i: number) => (
                                            <a
                                              key={i}
                                              href={docUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:brightness-110"
                                              style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}` }}
                                            >
                                              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.5 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                              <span className="text-xs truncate flex-1" style={{ color: tokens.text.primary }}>Copyright Document {i + 1}</span>
                                              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.4 }}><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Distribution Stores */}
                                    {rel.stores?.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: tokens.text.primary, opacity: 0.4 }}>Distribution Stores ({rel.stores.length})</p>
                                        <div className="flex flex-wrap gap-1.5">
                                          {rel.stores.map((s: string) => (
                                            <span key={s} className="text-xs px-2 py-0.5 rounded-md" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary }}>{s}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
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
                      <span className="text-sm font-medium px-3 py-1 rounded-lg" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary }}>
                        {filteredUsers.length}{filteredUsers.length !== users.length ? ` / ${users.length}` : ''} {users.length === 1 ? 'user' : 'users'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base mb-4" style={{ color: tokens.text.primary, opacity: 0.6 }}>View and manage all registered users (Creators, Artists, Business)</p>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ color: tokens.text.primary, opacity: 0.5 }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                    </div>
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name, email, username, or type..."
                      className="w-full h-10 pl-9 pr-4 rounded-xl text-sm focus:outline-none transition-all"
                      style={{ color: tokens.text.primary, background: tokens.bg.elevated, border: `1px solid ${tokens.border.default}` }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = tokens.border.default}
                    />
                    {userSearch && (
                      <button
                        onClick={() => setUserSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: tokens.text.primary, opacity: 0.5 }}><path d="M18 6L6 18M6 6l12 12"/></svg>
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
                      <p className="text-sm sm:text-base mb-4" style={{ color: tokens.text.primary, opacity: 0.6 }}>{usersError}</p>
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
                        <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: tokens.text.primary, opacity: 0.35 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: tokens.text.primary }}>No users found</h3>
                      <p className="text-sm sm:text-base" style={{ color: tokens.text.primary, opacity: 0.5 }}>User data will appear here</p>
                    </div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
                        <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ color: tokens.text.primary, opacity: 0.35 }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: tokens.text.primary }}>No results for "{userSearch}"</h3>
                      <p className="text-sm sm:text-base" style={{ color: tokens.text.primary, opacity: 0.5 }}>Try searching by name, email, username, or account type</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ backgroundColor: tokens.bg.elevated }}>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b" style={{ borderColor: tokens.border.subtle }}>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.primary, opacity: 0.5 }}>Email</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.primary, opacity: 0.5 }}>Name</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.primary, opacity: 0.5 }}>Username</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.primary, opacity: 0.5 }}>Type</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.primary, opacity: 0.5 }}>Status</th>
                            <th className="text-left py-4 px-4 sm:px-6 text-xs font-semibold uppercase tracking-wider" style={{ color: tokens.text.primary, opacity: 0.5 }}>Created</th>
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
                                <div className="text-sm" style={{ color: tokens.text.primary, opacity: user.full_name ? 1 : 0.4 }}>
                                  {user.full_name || '—'}
                                </div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="text-sm" style={{ color: tokens.text.primary, opacity: user.username ? 1 : 0.4 }}>
                                  {user.username || '—'}
                                </div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="text-sm" style={{ color: tokens.text.primary, opacity: user.user_type ? 1 : 0.4 }}>
                                  {user.user_type ? user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1) : '—'}
                                </div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="flex items-center gap-2">
                                  {user.verified && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}>
                                      Verified
                                    </span>
                                  )}
                                  {user.profile_completed && (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}>
                                      Complete
                                    </span>
                                  )}
                                  {!user.verified && !user.profile_completed && (
                                    <span className="text-xs" style={{ color: tokens.text.primary, opacity: 0.4 }}>Pending</span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 sm:px-6">
                                <div className="text-sm" style={{ color: tokens.text.primary, opacity: 0.5 }}>{formatDate(user.created_at)}</div>
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
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: tokens.text.primary, opacity: 0.35 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: tokens.text.primary }}>No data yet</h3>
                  <p className="text-sm sm:text-base" style={{ color: tokens.text.primary, opacity: 0.5 }}>Revenue and analytics data will appear here</p>
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
                                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Elevate</h4>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="mb-3" style={{ color: 'var(--text-primary)' }}>
                                Explore opportunities to earn, invest, and connect with top talent. Elevate brings everything you need to scale and succeed into one unified ecosystem.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Background Selector */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Background Theme</h3>

                          {/* Mobile: compact stacked list */}
                          <div className="flex flex-col gap-2 sm:hidden">
                            {([
                              { key: 'light' as const, label: 'Navy', desc: 'Navy blue', bg: '#192231', swatch: '#1e3a5f' },
                              { key: 'grey' as const, label: 'Grey', desc: 'Dim background', bg: '#222226', swatch: '#3a3a3e' },
                              { key: 'rose' as const, label: 'Rose', desc: 'Midnight rose', bg: '#140a12', swatch: '#3d1535' },
                              { key: 'dark' as const, label: 'Dark', desc: 'Pure black', bg: '#0a0a0a', swatch: '#1a1a1a' },
                              { key: 'white' as const, label: 'Light', desc: 'Clean white', bg: '#FFFFFF', swatch: '#e2e8f0' },
                            ]).map(({ key, label, desc, bg, swatch }) => {
                              const isSelected = theme === key;
                              return (
                                <button
                                  key={key}
                                  onClick={() => setTheme(key)}
                                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border-2 transition-all duration-200 text-left"
                                  style={{ backgroundColor: bg, borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.15)' }}
                                >
                                  <div className="flex gap-1 flex-shrink-0">
                                    <div className="w-6 h-8 rounded" style={{ backgroundColor: swatch }} />
                                    <div className="flex flex-col gap-1 justify-center">
                                      <div className="w-8 h-1.5 rounded-sm" style={{ backgroundColor: swatch, opacity: 0.7 }} />
                                      <div className="w-5 h-1.5 rounded-sm" style={{ backgroundColor: swatch, opacity: 0.5 }} />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold leading-tight" style={{ color: key === 'white' ? '#111111' : '#ffffff' }}>{label}</p>
                                    <p className="text-xs leading-tight mt-0.5" style={{ color: key === 'white' ? '#555555' : 'rgba(255,255,255,0.6)' }}>{desc}</p>
                                  </div>
                                  {isSelected && (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: key === 'white' ? '#111111' : '#ffffff' }}>
                                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ color: key === 'white' ? '#ffffff' : '#000000' }}><path d="M20 6L9 17l-5-5"/></svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Desktop: 5-column grid */}
                          <div className="hidden sm:grid sm:grid-cols-5 gap-4">
                            {/* Navy Option */}
                            <div 
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'light' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#192231' }}
                              onClick={() => setTheme('light')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'light' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                              <p className="text-sm text-white">Navy blue background</p>
                            </div>

                            {/* Grey Option */}
                            <div 
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'grey' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#222226' }}
                              onClick={() => setTheme('grey')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'grey' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                              <p className="text-sm text-white">Dim background</p>
                            </div>

                            {/* Rose Option */}
                            <div
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'rose' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#140a12' }}
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
                              <p className="text-sm text-white">Midnight rose</p>
                            </div>

                            {/* Dark Option */}
                            <div 
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'dark' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#0a0a0a' }}
                              onClick={() => setTheme('dark')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'dark' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                              <p className="text-sm text-white">Pure black background (default)</p>
                            </div>

                            {/* Light Option */}
                            <div
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'white' ? 'border-gray-400' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: '#FFFFFF' }}
                              onClick={() => setTheme('white')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'white' ? 'bg-gray-800 border-gray-800' : 'bg-gray-200 border-gray-400'
                                }`}>
                                  {theme === 'white' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg mb-2" style={{ backgroundColor: '#F1F5F9' }}></div>
                                <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: '#CBD5E1' }}></div>
                                <div className="h-2 rounded w-1/2" style={{ backgroundColor: '#CBD5E1' }}></div>
                              </div>
                              <h4 className="font-semibold mb-1 text-gray-900">Light</h4>
                              <p className="text-sm text-gray-600">Clean white</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No secondary color</h4>
                              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.6 }}>Use a single flat color across the entire background</p>
                            </div>
                            <ToggleSwitch isActive={flatBackground} onToggle={() => setFlatBackground(!flatBackground)} backgroundTheme={theme} />
                          </div>
                        </div>

                        {/* Sidebar Section */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Sidebar</h3>
                          <div className="space-y-3 lg:space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: tokens.border.subtle }}>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold mb-1" style={{ color: tokens.text.primary }}>Collapse sidebar</h4>
                                <p className="text-xs" style={{ color: tokens.text.primary, opacity: 0.6 }}>Minimize the sidebar to show only icons</p>
                              </div>
                              <ToggleSwitch isActive={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} backgroundTheme={theme} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    renderLanguages={() => <div></div>}
                    renderNotifications={() => (
                      <div className="space-y-3 lg:space-y-8">
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Sounds</h3>
                          <div className="space-y-3 lg:space-y-6">
                            <div className="pb-3 lg:pb-6 border-b" style={{ borderColor: tokens.border.subtle }}>
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="text-base font-semibold mb-1" style={{ color: tokens.text.primary }}>New Message</h4>
                                  <p className="text-sm" style={{ color: tokens.text.primary }}>Play a sound when you receive a new unread message or notification</p>
                                </div>
                                <ToggleSwitch isActive={newMessageSound} onToggle={handleToggleNewMessageSound} backgroundTheme={theme} />
                              </div>
                              <button
                                onClick={() => {
                                  try { const a = new Audio('/elevate notification ping v1.wav'); a.volume = 0.7; a.play().catch(() => {}); } catch {}
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
                                style={{ background: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                Preview Sound
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    renderSendFeedback={renderAdminFeedback}
                    renderLogOut={() => (
                      <div className="scroll-mt-6 flex gap-3">
                        <button
                          onClick={() => { window.location.href = '/admin/login'; }}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
                          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                        >
                          Log Out
                        </button>
                      </div>
                    )}
                    isMobile={true}
                    onBack={() => setActiveSection('home')}
                    userType="admin"
                    appliedTheme={theme}
                  />
                </div>

                {/* Desktop Settings View - Twitter/X Style */}
                <div className="hidden lg:block -mx-8 -my-12">
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
                                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Elevate</h4>
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <p className="mb-3" style={{ color: 'var(--text-primary)' }}>
                                Explore opportunities to earn, invest, and connect with top talent. Elevate brings everything you need to scale and succeed into one unified ecosystem.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Background Selector */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Background Theme</h3>

                          {/* Mobile: compact stacked list */}
                          <div className="flex flex-col gap-2 sm:hidden">
                            {([
                              { key: 'light' as const, label: 'Navy', desc: 'Navy blue', bg: '#192231', swatch: '#1e3a5f' },
                              { key: 'grey' as const, label: 'Grey', desc: 'Dim background', bg: '#222226', swatch: '#3a3a3e' },
                              { key: 'rose' as const, label: 'Rose', desc: 'Midnight rose', bg: '#140a12', swatch: '#3d1535' },
                              { key: 'dark' as const, label: 'Dark', desc: 'Pure black', bg: '#0a0a0a', swatch: '#1a1a1a' },
                              { key: 'white' as const, label: 'Light', desc: 'Clean white', bg: '#FFFFFF', swatch: '#e2e8f0' },
                            ]).map(({ key, label, desc, bg, swatch }) => {
                              const isSelected = theme === key;
                              return (
                                <button
                                  key={key}
                                  onClick={() => setTheme(key)}
                                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border-2 transition-all duration-200 text-left"
                                  style={{ backgroundColor: bg, borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.15)' }}
                                >
                                  <div className="flex gap-1 flex-shrink-0">
                                    <div className="w-6 h-8 rounded" style={{ backgroundColor: swatch }} />
                                    <div className="flex flex-col gap-1 justify-center">
                                      <div className="w-8 h-1.5 rounded-sm" style={{ backgroundColor: swatch, opacity: 0.7 }} />
                                      <div className="w-5 h-1.5 rounded-sm" style={{ backgroundColor: swatch, opacity: 0.5 }} />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold leading-tight" style={{ color: key === 'white' ? '#111111' : '#ffffff' }}>{label}</p>
                                    <p className="text-xs leading-tight mt-0.5" style={{ color: key === 'white' ? '#555555' : 'rgba(255,255,255,0.6)' }}>{desc}</p>
                                  </div>
                                  {isSelected && (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: key === 'white' ? '#111111' : '#ffffff' }}>
                                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ color: key === 'white' ? '#ffffff' : '#000000' }}><path d="M20 6L9 17l-5-5"/></svg>
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Desktop: 5-column grid */}
                          <div className="hidden sm:grid sm:grid-cols-5 gap-4">
                            {/* Navy Option */}
                            <div 
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'light' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#192231' }}
                              onClick={() => setTheme('light')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'light' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                              <p className="text-sm text-white">Navy blue background</p>
                            </div>

                            {/* Grey Option */}
                            <div 
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'grey' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#222226' }}
                              onClick={() => setTheme('grey')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'grey' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                              <p className="text-sm text-white">Dim background</p>
                            </div>

                            {/* Rose Option */}
                            <div
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'rose' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#140a12' }}
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
                              <p className="text-sm text-white">Midnight rose</p>
                            </div>

                            {/* Dark Option */}
                            <div 
                              className={`relative rounded-2xl p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'dark' ? 'border-white' : 'border-gray-600'
                              }`}
                              style={{ backgroundColor: '#0a0a0a' }}
                              onClick={() => setTheme('dark')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'dark' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                              <p className="text-sm text-white">Pure black background (default)</p>
                            </div>

                            {/* Light Option */}
                            <div
                              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                                theme === 'white' ? 'border-gray-400' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: '#FFFFFF' }}
                              onClick={() => setTheme('white')}
                            >
                              <div className="absolute top-4 right-4">
                                <div className={`w-5 h-5 rounded-full border-2 ${
                                  theme === 'white' ? 'bg-gray-800 border-gray-800' : 'bg-gray-200 border-gray-400'
                                }`}>
                                  {theme === 'white' && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mb-4">
                                <div className="w-full h-20 rounded-lg mb-2" style={{ backgroundColor: '#F1F5F9' }}></div>
                                <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: '#CBD5E1' }}></div>
                                <div className="h-2 rounded w-1/2" style={{ backgroundColor: '#CBD5E1' }}></div>
                              </div>
                              <h4 className="font-semibold mb-1 text-gray-900">Light</h4>
                              <p className="text-sm text-gray-600">Clean white</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                            <div>
                              <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No secondary color</h4>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>Use a single flat color across the entire background</p>
                            </div>
                            <ToggleSwitch isActive={flatBackground} onToggle={() => setFlatBackground(!flatBackground)} backgroundTheme={theme} />
                          </div>
                        </div>

                        {/* Sidebar Section */}
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Sidebar</h3>
                          <div className="space-y-3 lg:space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: tokens.border.subtle }}>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-semibold mb-1" style={{ color: tokens.text.primary }}>Collapse sidebar</h4>
                                <p className="text-xs" style={{ color: tokens.text.primary, opacity: 0.6 }}>Minimize the sidebar to show only icons</p>
                              </div>
                              <ToggleSwitch isActive={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} backgroundTheme={theme} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    renderLanguages={() => <div></div>}
                    renderNotifications={() => (
                      <div className="space-y-3 lg:space-y-8">
                        <div>
                          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: tokens.text.primary }}>Sounds</h3>
                          <div className="space-y-3 lg:space-y-6">
                            <div className="pb-3 lg:pb-6 border-b" style={{ borderColor: tokens.border.subtle }}>
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="text-base font-semibold mb-1" style={{ color: tokens.text.primary }}>New Message</h4>
                                  <p className="text-sm" style={{ color: tokens.text.primary }}>Play a sound when you receive a new unread message or notification</p>
                                </div>
                                <ToggleSwitch isActive={newMessageSound} onToggle={handleToggleNewMessageSound} backgroundTheme={theme} />
                              </div>
                              <button
                                onClick={() => {
                                  try { const a = new Audio('/elevate notification ping v1.wav'); a.volume = 0.7; a.play().catch(() => {}); } catch {}
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
                                style={{ background: tokens.bg.elevated, border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                Preview Sound
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    renderSendFeedback={renderAdminFeedback}
                    renderLogOut={() => (
                      <div className="scroll-mt-6 flex gap-3">
                        <button
                          onClick={() => { window.location.href = '/admin/login'; }}
                          className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
                          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                        >
                          Log Out
                        </button>
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
            className="fixed inset-0 bg-black/60 z-40 transition-opacity"
            style={{ backdropFilter: 'blur(6px)' }}
            onClick={() => setSelectedUser(null)}
          />
          
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
            onClick={() => setSelectedUser(null)}
          >
            <div 
              className="w-full max-w-4xl h-[80vh] rounded-2xl overflow-hidden flex animate-modal-in"
              style={{ backgroundColor: tokens.bg.modal, boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
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
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                    <span className="text-sm font-medium">Notifications</span>
                  </button>

                  <div className="pt-2 mt-2" style={{ borderTop: `1px solid ${tokens.border.subtle}` }}>
                    <button
                      onClick={() => { setUserDetailSection('account-actions'); setDeleteConfirmStep('idle'); setSuspendStep('idle'); setSuspendReason(''); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        userDetailSection === 'account-actions' ? '' : 'hover:brightness-110'
                      }`}
                      style={{
                        backgroundColor: userDetailSection === 'account-actions' ? tokens.bg.active : 'transparent',
                        color: tokens.text.primary
                      }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                      <span className="text-sm font-medium">Account Actions</span>
                    </button>
                  </div>
                </nav>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {userDetailSection === 'personal' && (
                  <div className="space-y-6 animate-modal-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Personal Information</h3>
                      <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>View and manage user's personal details</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <h4 className="text-lg font-semibold mb-4" style={{ color: tokens.text.primary }}>Basic Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.primary, opacity: 0.5 }}>Email</label>
                          <p className="text-sm" style={{ color: tokens.text.primary }}>{selectedUser.email}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.primary, opacity: 0.5 }}>Full Name</label>
                          <p className="text-sm" style={{ color: tokens.text.primary, opacity: selectedUser.full_name ? 1 : 0.4 }}>
                            {selectedUser.full_name || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.primary, opacity: 0.5 }}>Username</label>
                          <p className="text-sm" style={{ color: tokens.text.primary, opacity: selectedUser.username ? 1 : 0.4 }}>
                            {selectedUser.username || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.primary, opacity: 0.5 }}>User Type</label>
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
                          <label className="text-xs font-medium uppercase tracking-wider mb-2 block" style={{ color: tokens.text.primary, opacity: 0.5 }}>Account Status</label>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedUser.verified && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Verified
                              </span>
                            )}
                            {selectedUser.profile_completed && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Profile Complete
                              </span>
                            )}
                            {!selectedUser.verified && !selectedUser.profile_completed && (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, opacity: 0.5, border: `1px solid ${tokens.border.subtle}` }}>
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
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.primary, opacity: 0.5 }}>User ID</label>
                          <p className="text-sm font-mono break-all" style={{ color: tokens.text.primary, opacity: 0.4 }}>{selectedUser.id}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.primary, opacity: 0.5 }}>Created At</label>
                          <p className="text-sm" style={{ color: tokens.text.primary }}>{formatDate(selectedUser.created_at)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-wider mb-1 block" style={{ color: tokens.text.primary, opacity: 0.5 }}>Last Updated</label>
                          <p className="text-sm" style={{ color: tokens.text.primary }}>{formatDate(selectedUser.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userDetailSection === 'connected' && (
                  <div className="space-y-6 animate-modal-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Connected Accounts</h3>
                      <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>All social links and external accounts connected to this user's profile</p>
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
                              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.35 }}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                            </div>
                            <h4 className="text-base font-semibold mb-1" style={{ color: tokens.text.primary }}>No connected accounts</h4>
                            <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.5 }}>This user hasn't connected any social accounts yet</p>
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
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                    <p className="text-sm font-semibold" style={{ color: tokens.text.primary }}>{link.display_name || link.platform}</p>
                                    <span className="text-xs px-2 py-0.5 rounded font-medium capitalize" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.subtle}` }}>{link.platform}</span>
                                    {link.verified ? (
                                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}>
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> Verified
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, opacity: 0.5, border: `1px solid ${tokens.border.subtle}` }}>
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg> Unverified
                                      </span>
                                    )}
                                  </div>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline flex items-center gap-1 truncate" style={{ color: tokens.text.primary, opacity: 0.5 }}>
                                    <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    <span className="truncate">{link.url}</span>
                                  </a>
                                  {link.channel_type && <p className="text-xs mt-1" style={{ color: tokens.text.primary, opacity: 0.5 }}>Type: {link.channel_type}</p>}
                                  {link.channel_description && <p className="text-xs mt-1 line-clamp-2" style={{ color: tokens.text.primary, opacity: 0.5 }}>{link.channel_description}</p>}
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <p className="text-xs" style={{ color: tokens.text.primary, opacity: 0.4 }}>Added</p>
                                <p className="text-xs font-medium" style={{ color: tokens.text.primary, opacity: 0.6 }}>{new Date(link.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {userDetailSection === 'payment' && (
                  <div className="space-y-6 animate-modal-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Payment Method</h3>
                      <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>View user's payment and payout methods</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.active }}>
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.35 }}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>No payment methods</h4>
                          <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.5 }}>This user hasn't added any payment methods yet</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {userDetailSection === 'account-actions' && (
                  <div className="space-y-6 animate-modal-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Account Actions</h3>
                      <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>Perform administrative actions on this user's account.</p>
                    </div>

                    {/* Suspend section */}
                    <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: tokens.bg.elevated }}>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1" style={{ color: tokens.text.primary }}>Suspend Account</p>
                          <p className="text-xs leading-relaxed" style={{ color: tokens.text.primary, opacity: 0.55 }}>Temporarily restrict this user's access to the platform. You will be prompted to provide a reason.</p>
                        </div>
                      </div>

                      {suspendStep === 'idle' && (
                        <button
                          onClick={() => setSuspendStep('reason')}
                          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
                          style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        >
                          Suspend Account
                        </button>
                      )}

                      {suspendStep === 'reason' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: tokens.text.primary, opacity: 0.5 }}>Reason for suspension</label>
                            <textarea
                              value={suspendReason}
                              onChange={e => setSuspendReason(e.target.value)}
                              placeholder="e.g. Violation of community guidelines — repeated spam..."
                              rows={3}
                              className="w-full px-3 py-2.5 rounded-lg text-sm resize-none focus:outline-none"
                              style={{ backgroundColor: tokens.bg.primary, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                              onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
                              onBlur={e => e.target.style.borderColor = tokens.border.default}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSuspendStep('confirm')}
                              disabled={!suspendReason.trim()}
                              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                            >
                              Review & Confirm
                            </button>
                            <button
                              onClick={() => { setSuspendStep('idle'); setSuspendReason(''); }}
                              className="px-4 py-2.5 rounded-lg text-sm transition-all hover:brightness-110"
                              style={{ backgroundColor: 'transparent', color: tokens.text.primary, opacity: 0.5 }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {suspendStep === 'confirm' && (
                        <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.default}` }}>
                          <p className="text-sm font-semibold" style={{ color: tokens.text.primary }}>Confirm suspension for <span style={{ opacity: 0.7 }}>{selectedUser?.email}</span></p>
                          <p className="text-xs leading-relaxed" style={{ color: tokens.text.primary, opacity: 0.6 }}>Reason: {suspendReason}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                await supabase.from('users').update({ profile_completed: false }).eq('id', selectedUser?.id);
                                setSuspendStep('idle');
                                setSuspendReason('');
                                alert(`Account suspended: ${selectedUser?.email}`);
                              }}
                              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
                              style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                            >
                              Confirm Suspend
                            </button>
                            <button
                              onClick={() => setSuspendStep('reason')}
                              className="px-4 py-2.5 rounded-lg text-sm transition-all hover:brightness-110"
                              style={{ backgroundColor: 'transparent', color: tokens.text.primary, opacity: 0.5 }}
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete section */}
                    <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: tokens.bg.elevated }}>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-1" style={{ color: tokens.text.primary }}>Delete Account</p>
                          <p className="text-xs leading-relaxed" style={{ color: tokens.text.primary, opacity: 0.55 }}>Permanently delete this user and all associated data. This action cannot be undone.</p>
                        </div>
                      </div>

                      {deleteConfirmStep === 'idle' && (
                        <button
                          onClick={() => setDeleteConfirmStep('confirm')}
                          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
                          style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                        >
                          Delete Account
                        </button>
                      )}

                      {deleteConfirmStep === 'confirm' && (
                        <div className="rounded-lg p-4 space-y-3" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.default}` }}>
                          <p className="text-sm font-semibold" style={{ color: tokens.text.primary }}>Are you sure you want to permanently delete this account?</p>
                          <p className="text-xs" style={{ color: tokens.text.primary, opacity: 0.55 }}>User: <span style={{ opacity: 1 }}>{selectedUser?.email}</span> — This cannot be undone.</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                await supabase.from('users').delete().eq('id', selectedUser?.id);
                                setSelectedUser(null);
                                setDeleteConfirmStep('idle');
                              }}
                              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
                              style={{ backgroundColor: tokens.bg.elevated, color: tokens.text.primary, border: `1px solid ${tokens.border.default}` }}
                            >
                              Yes, Delete Permanently
                            </button>
                            <button
                              onClick={() => setDeleteConfirmStep('idle')}
                              className="px-4 py-2.5 rounded-lg text-sm transition-all hover:brightness-110"
                              style={{ backgroundColor: 'transparent', color: tokens.text.primary, opacity: 0.5 }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {userDetailSection === 'notifications' && (
                  <div className="space-y-6 animate-modal-in">
                    <div>
                      <h3 className="text-2xl font-bold mb-2" style={{ color: tokens.text.primary }}>Notifications</h3>
                      <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>View user's notification preferences and history</p>
                    </div>

                    <div className="rounded-xl p-5" style={{ backgroundColor: tokens.bg.elevated }}>
                      <div className="flex items-center justify-center min-h-[300px]">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: tokens.bg.active }}>
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.35 }}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                          </div>
                          <h4 className="text-lg font-semibold mb-2" style={{ color: tokens.text.primary }}>No notifications</h4>
                          <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.5 }}>No notification history available for this user</p>
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
