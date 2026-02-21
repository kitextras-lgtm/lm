import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileCreation } from '../contexts/ProfileCreationContext';
import { Camera } from 'lucide-react';

export default function FreelancerPhotoLocation() {
  const navigate = useNavigate();
  const { profileData, updateProfileData } = useProfileCreation();
  const [dateOfBirth, setDateOfBirth] = useState(profileData.dateOfBirth || '');
  const [country, setCountry] = useState(profileData.country || 'United States');
  const [streetAddress, setStreetAddress] = useState(profileData.streetAddress || '');
  const [aptSuite, setAptSuite] = useState(profileData.aptSuite || '');
  const [city, setCity] = useState(profileData.city || '');
  const [stateProvince, setStateProvince] = useState(profileData.stateProvince || '');
  const [zipPostalCode, setZipPostalCode] = useState(profileData.zipPostalCode || '');
  const [phone, setPhone] = useState(profileData.phone || '');
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [profilePhoto, setProfilePhoto] = useState(profileData.profilePicture || '');

  const handleBack = () => navigate(-1);

  const handleContinue = () => {
    updateProfileData({
      dateOfBirth,
      country,
      streetAddress,
      aptSuite,
      city,
      stateProvince,
      zipPostalCode,
      phone,
      profilePicture: profilePhoto,
    });
    navigate('/freelancer-review-profile');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        background: '#000000',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")',
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <p
            className="text-sm mb-2"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: 'var(--text-primary)',
            }}
          >
            10/10
          </p>
          <div
            className="h-1 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ backgroundColor: 'var(--text-primary)', width: '100%' }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-normal mb-3"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff' }}
        >
          A few last details, then you can check and publish your profile.
        </h1>

        <p
          className="text-base mb-12"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: 'var(--text-primary)',
          }}
        >
          A professional photo helps you build trust with your clients. To keep things safe and simple, they'll pay you through us - which is why we need your personal information.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 mb-12">
          {/* Left side - Photo upload */}
          <div className="flex flex-col items-center lg:items-start">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden mb-4"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <Camera size={40} color="#94A3B8" />
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-all duration-200 hover:brightness-110 flex items-center gap-2"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
              }}
            >
              <Camera size={16} />
              Edit photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Right side - Form fields */}
          <div className="space-y-6">
            {/* Date of Birth */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                Date of Birth *
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
              />
            </div>

            {/* Country */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                Country *
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-base outline-none appearance-none transition-all duration-200"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                }}
              >
                <option value="United States" style={{ backgroundColor: '#111111' }}>United States</option>
                <option value="Canada" style={{ backgroundColor: '#111111' }}>Canada</option>
                <option value="United Kingdom" style={{ backgroundColor: '#111111' }}>United Kingdom</option>
                <option value="Australia" style={{ backgroundColor: '#111111' }}>Australia</option>
                <option value="Germany" style={{ backgroundColor: '#111111' }}>Germany</option>
                <option value="France" style={{ backgroundColor: '#111111' }}>France</option>
                <option value="Spain" style={{ backgroundColor: '#111111' }}>Spain</option>
                <option value="Italy" style={{ backgroundColor: '#111111' }}>Italy</option>
                <option value="Other" style={{ backgroundColor: '#111111' }}>Other</option>
              </select>
            </div>

            {/* Street Address and Apt/Suite */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  Street address *
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Enter street address"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  Apt/Suite
                </label>
                <input
                  type="text"
                  value={aptSuite}
                  onChange={(e) => setAptSuite(e.target.value)}
                  placeholder="Apt/Suite (Optional)"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  State/Province *
                </label>
                <input
                  type="text"
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  placeholder="Enter state/province"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                  }}
                >
                  ZIP/Postal code *
                </label>
                <input
                  type="text"
                  value={zipPostalCode}
                  onChange={(e) => setZipPostalCode(e.target.value)}
                  placeholder="Enter ZIP/Postal code"
                  className="w-full px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  color: '#ffffff',
                }}
              >
                Phone *
              </label>
              <div className="flex gap-2">
                <select
                  value={phoneCountryCode}
                  onChange={(e) => setPhoneCountryCode(e.target.value)}
                  className="w-24 px-3 py-3 rounded-lg text-base outline-none appearance-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                >
                  <option value="+1" style={{ backgroundColor: '#111111' }}>🇺🇸 +1</option>
                  <option value="+44" style={{ backgroundColor: '#111111' }}>🇬🇧 +44</option>
                  <option value="+61" style={{ backgroundColor: '#111111' }}>🇦🇺 +61</option>
                  <option value="+49" style={{ backgroundColor: '#111111' }}>🇩🇪 +49</option>
                  <option value="+33" style={{ backgroundColor: '#111111' }}>🇫🇷 +33</option>
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter number"
                  className="flex-1 px-4 py-3 rounded-lg text-base outline-none transition-all duration-200"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleBack}
            className="px-6 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:brightness-95"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            }}
          >
            Back
          </button>

          <button
            onClick={handleContinue}
            className="px-8 py-3 rounded-lg font-medium text-base transition-all duration-200 hover:brightness-95"
            style={{
              backgroundColor: '#ffffff',
              color: '#000000',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            Review your profile
          </button>
        </div>
      </div>
    </div>
  );
}
