import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Globe } from 'lucide-react';
import { BetaBadge } from '../components/BetaBadge';
import { supabase } from '../lib/supabase';

type SettingsSection = 'personal' | 'accounts' | 'payout' | 'notifications' | 'close';

const COUNTRIES = [
  'United States of America',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'South Korea',
  'Brazil',
  'Mexico',
  'India',
  'China',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  'Austria',
  'Belgium',
  'Portugal',
  'Poland',
  'Greece',
  'Ireland',
  'New Zealand',
  'Singapore',
  'South Africa',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Thailand',
  'Vietnam',
  'Malaysia',
  'Indonesia',
  'Philippines',
  'Turkey',
  'United Arab Emirates',
  'Saudi Arabia',
  'Israel',
  'Egypt',
  'Nigeria',
  'Kenya',
  'Other'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Russian',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Bengali',
  'Turkish',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Malay',
  'Tagalog',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Greek',
  'Hebrew',
  'Swahili',
  'Other'
];

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    location: '',
    language: '',
    email: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
        setFormData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          username: profile.username || '',
          location: profile.location || '',
          language: profile.primary_language || '',
          email: user.email || ''
        });
      }
    }
  };

  const handleBack = () => {
    const currentDashboard = localStorage.getItem('currentDashboard');
    if (currentDashboard) {
      navigate(currentDashboard);
    } else {
      navigate('/dashboard/creator');
    }
  };

  const renderPersonalInfo = () => (
    <div>
      <h2 className="text-2xl font-bold mb-8" style={{ color: '#F8FAFC' }}>Personal info</h2>

      <div className="space-y-7">
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: '#94A3B8' }}>Profile picture</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-md">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm"
              style={{ backgroundColor: '#0f0f13', color: '#F8FAFC' }}
            >
              <Camera className="w-4 h-4" />
              Replace picture
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>First name</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing}
                className="flex-1 h-12 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: '#F8FAFC',
                  background: '#0f0f13',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                }}
              />
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 hover:brightness-110 transition-all rounded-lg"
                  style={{ color: '#64748B' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Last name</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                className="flex-1 h-12 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: '#F8FAFC',
                  background: '#0f0f13',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                }}
              />
              <div className="w-10 h-10"></div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Username</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center h-12 px-4 rounded-xl focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <span style={{ color: '#64748B' }}>@</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!isEditing}
                className="flex-1 bg-transparent text-sm focus:outline-none ml-1"
                style={{ color: '#F8FAFC' }}
              />
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 hover:brightness-110 transition-all rounded-lg"
                style={{ color: '#64748B' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Location</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center h-12 px-4 rounded-xl focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#64748B' }} />
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={!isEditing}
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: '#F8FAFC' }}
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country} style={{ background: '#0f0f13' }}>{country}</option>
                ))}
              </select>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 hover:brightness-110 transition-all rounded-lg"
                style={{ color: '#64748B' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Languages you post in</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center h-12 px-4 rounded-xl focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <Globe className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#64748B' }} />
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                disabled={!isEditing}
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: '#F8FAFC' }}
              >
                {LANGUAGES.map(language => (
                  <option key={language} value={language} style={{ background: '#0f0f13' }}>{language}</option>
                ))}
              </select>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 hover:brightness-110 transition-all rounded-lg"
                style={{ color: '#64748B' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full h-12 px-4 rounded-xl text-sm focus:outline-none opacity-50"
            style={{
              color: '#F8FAFC',
              background: '#0f0f13',
              border: '1px solid rgba(75, 85, 99, 0.2)',
            }}
          />
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm"
              style={{ backgroundColor: '#0f0f13', color: '#F8FAFC' }}
            >
              Cancel
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm"
              style={{ backgroundColor: '#E8E8E8', color: '#000000' }}
            >
              Save changes
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPlaceholder = (title: string, description: string) => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2" style={{ color: '#F8FAFC' }}>{title}</h3>
        <p className="text-sm" style={{ color: '#94A3B8' }}>{description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#111111' }}>
      <header className="fixed top-0 left-0 right-0 z-50 h-16" style={{ backgroundColor: '#111111', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm transition-colors hover:brightness-110"
              style={{ color: '#94A3B8' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-6 w-px" style={{ backgroundColor: '#1a1a1a' }} />
            <img src="/elevate_transparent_white_.png" alt="ELEVATE" className="h-28" />
            <BetaBadge />
          </div>
        </div>
      </header>

      <div className="pt-32 pb-8">
        <div className="max-w-5xl mx-auto px-8">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-lg">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: '#F8FAFC' }}>
                {formData.firstName} {formData.lastName}
              </h1>
              <p className="text-base" style={{ color: '#64748B' }}>{formData.email}</p>
            </div>
          </div>

          <div className="flex gap-6">
            <aside className="w-72 flex-shrink-0">
              <div className="rounded-2xl p-1 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
                <nav className="space-y-1 p-2">
                  <button
                    onClick={() => setActiveSection('personal')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'personal' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'personal' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Personal info
                  </button>
                  <button
                    onClick={() => setActiveSection('accounts')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'accounts' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'accounts' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Connected accounts
                  </button>
                  <button
                    onClick={() => setActiveSection('payout')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'payout' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'payout' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Payout methods
                  </button>
                  <button
                    onClick={() => setActiveSection('notifications')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'notifications' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'notifications' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveSection('close')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'close' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'close' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Close account
                  </button>
                </nav>
              </div>
            </aside>

            <main className="flex-1 rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
              {activeSection === 'personal' && renderPersonalInfo()}
              {activeSection === 'accounts' && renderPlaceholder('Connected accounts', 'Manage your social media connections')}
              {activeSection === 'payout' && renderPlaceholder('Payout methods', 'Add your payout information')}
              {activeSection === 'notifications' && renderPlaceholder('Notifications', 'Manage your notification preferences')}
              {activeSection === 'close' && renderPlaceholder('Close account', 'Delete your account and data')}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
