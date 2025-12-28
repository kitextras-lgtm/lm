// Default avatar SVG as a React component
export function DefaultAvatarSVG({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="default-avatar-shake"
    >
      <defs>
        <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1e24" />
          <stop offset="100%" stopColor="#0f0f13" />
        </linearGradient>
        <linearGradient id="avatarShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748B" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#avatarGradient)" />
      {/* Head */}
      <circle cx="20" cy="15" r="7" fill="#64748B" fillOpacity="0.8" />
      {/* Body */}
      <path
        d="M8 32c0-5.523 4.477-10 10-10h4c5.523 0 10 4.477 10 10"
        stroke="#64748B"
        strokeWidth="2.5"
        strokeOpacity="0.8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="20" fill="url(#avatarShine)" />
    </svg>
  );
}

// Default avatar as data URI for instant loading
export const DEFAULT_AVATAR_DATA_URI = `data:image/svg+xml;base64,${btoa(
  `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1e24"/>
        <stop offset="100%" stop-color="#0f0f13"/>
      </linearGradient>
      <linearGradient id="avatarShine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#64748B" stop-opacity="0.15"/>
        <stop offset="100%" stop-color="#64748B" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="20" fill="url(#avatarGradient)"/>
    <circle cx="20" cy="15" r="7" fill="#64748B" fill-opacity="0.8"/>
    <path d="M8 32c0-5.523 4.477-10 10-10h4c5.523 0 10 4.477 10 10" stroke="#64748B" stroke-width="2.5" stroke-opacity="0.8" fill="none" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="20" fill="url(#avatarShine)"/>
  </svg>`
)}`;

// Elevate logo as data URI (5 vertical bars with rounded ends)
export const ELEVATE_LOGO_DATA_URI = `data:image/svg+xml;base64,${btoa(
  `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" fill="#000000"/>
    <g>
      <!-- Leftmost bar (shortest) -->
      <rect x="7" y="19" width="3" height="6" rx="1.5" fill="#FFFFFF"/>
      <!-- Second bar (medium) -->
      <rect x="12" y="16" width="3" height="12" rx="1.5" fill="#FFFFFF"/>
      <!-- Center bar (tallest) -->
      <rect x="17" y="8" width="3" height="24" rx="1.5" fill="#FFFFFF"/>
      <!-- Fourth bar (medium) -->
      <rect x="22" y="16" width="3" height="12" rx="1.5" fill="#FFFFFF"/>
      <!-- Rightmost bar (shortest) -->
      <rect x="27" y="19" width="3" height="6" rx="1.5" fill="#FFFFFF"/>
    </g>
  </svg>`
)}`;

// Elevate admin profile picture URL
export const ELEVATE_ADMIN_AVATAR_URL = 'https://hlcpoqxzqgbghsadouef.supabase.co/storage/v1/object/public/avatars/pic/elevate%20solid%20white%20logo%20ver.jpeg';

