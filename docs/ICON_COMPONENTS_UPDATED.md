# Updated Icon Components

Copy these files to fix the hover animations:

## 1. UserSilhouetteIcon.tsx

```typescript
export function UserSilhouetteIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        {/* Head */}
        <circle
          cx="24"
          cy="16"
          r="6"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          style={{
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: '24px 16px',
            transition: 'transform 0.3s ease'
          }}
        />
        {/* Body/shoulders */}
        <path
          d="M12 40C12 32 17 28 24 28C31 28 36 32 36 40"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: '24px 40px',
            transition: 'transform 0.3s ease'
          }}
        />

        {/* Scan line effect */}
        <line
          x1="8"
          y1="8"
          x2="40"
          y2="8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(32px)' : 'translateY(0)',
            transition: 'transform 0.5s ease-in-out, opacity 0.4s ease'
          }}
        />

        {/* Glow ring */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          style={{
            opacity: isHovered ? 0.4 : 0,
            transform: isHovered ? 'scale(1)' : 'scale(0.75)',
            transformOrigin: 'center',
            transition: 'all 0.5s ease'
          }}
        />
      </svg>
    </div>
  )
}
```

## 2. PuzzlePiecesIcon.tsx

```typescript
export function PuzzlePiecesIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        <path
          d="M10 10H20V16C20 16 18 16 18 18C18 20 20 20 20 20V24H10V10Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? 'translate(-3px, -3px)' : 'translate(0, 0)',
            transition: 'transform 0.4s ease'
          }}
        />
        <path
          d="M24 10H38V24H34C34 24 34 22 32 22C30 22 30 24 30 24H24V20C24 20 26 20 26 18C26 16 24 16 24 16V10Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? 'translate(3px, -3px)' : 'translate(0, 0)',
            transition: 'transform 0.4s ease'
          }}
        />
        <path
          d="M10 28H20V34C20 34 18 34 18 36C18 38 20 38 20 38V42H10V28Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? 'translate(-3px, 3px)' : 'translate(0, 0)',
            transition: 'transform 0.4s ease'
          }}
        />
        <path
          d="M24 28H30C30 28 30 26 32 26C34 26 34 28 34 28H38V42H24V38C24 38 26 38 26 36C26 34 24 34 24 34V28Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? 'translate(3px, 3px)' : 'translate(0, 0)',
            transition: 'transform 0.4s ease'
          }}
        />
      </svg>
    </div>
  )
}
```

## 3. CreditCardIcon.tsx

```typescript
export function CreditCardIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        {/* Main card rectangle */}
        <rect
          x="6"
          y="12"
          width="36"
          height="24"
          rx="3"
          stroke="white"
          strokeWidth="2.5"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        />
        {/* Magnetic stripe */}
        <line
          x1="6"
          y1="20"
          x2="42"
          y2="20"
          stroke="white"
          strokeWidth="2.5"
          style={{
            opacity: isHovered ? 1 : 0.8,
            transition: 'opacity 0.3s ease'
          }}
        />
        {/* Chip */}
        <rect
          x="12"
          y="26"
          width="8"
          height="6"
          rx="1"
          stroke="white"
          strokeWidth="2.5"
          style={{
            opacity: isHovered ? 1 : 0.7,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: 'center',
            transition: 'opacity 0.3s ease, transform 0.3s ease'
          }}
        />
        {/* Card number line */}
        <line
          x1="26"
          y1="29"
          x2="36"
          y2="29"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="2 4"
          style={{
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s ease'
          }}
        />
        {/* Shimmer/scan effect */}
        <rect
          x="-2"
          y="12"
          width="8"
          height="24"
          fill="url(#shimmer-credit)"
          style={{
            opacity: isHovered ? 0.5 : 0,
            transform: isHovered ? 'translateX(50px)' : 'translateX(0)',
            transition: 'opacity 0.3s ease, transform 0.6s ease'
          }}
        />
        {/* Glow effect */}
        <rect
          x="6"
          y="12"
          width="36"
          height="24"
          rx="3"
          stroke="white"
          strokeWidth="3"
          fill="none"
          style={{
            opacity: isHovered ? 0.3 : 0,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: 'center',
            transition: 'opacity 0.4s ease, transform 0.4s ease'
          }}
        />
        <defs>
          <linearGradient id="shimmer-credit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
```

## 4. BellIcon.tsx

```typescript
export function BellIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        <path
          d="M24 6C24 6 24 8 24 10C18 10 14 15 14 22V30L10 34H38L34 30V22C34 15 30 10 24 10C24 8 24 6 24 6Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? 'rotate(-12deg)' : 'rotate(0deg)',
            transformOrigin: '24px 6px',
            transition: 'transform 0.3s ease'
          }}
        />
        <path
          d="M20 34C20 37 22 40 24 40C26 40 28 37 28 34"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'rotate(-12deg)' : 'rotate(0deg)',
            transformOrigin: '24px 6px',
            transition: 'transform 0.3s ease'
          }}
        />
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="white"
          strokeWidth="2"
          style={{
            opacity: isHovered ? 0.4 : 0,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: 'center',
            transition: 'opacity 0.3s ease, transform 0.5s ease'
          }}
        />
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="white"
          strokeWidth="2"
          style={{
            opacity: isHovered ? 0.2 : 0,
            transform: isHovered ? 'scale(1.2)' : 'scale(1)',
            transformOrigin: 'center',
            transition: isHovered 
              ? 'opacity 0.3s ease 0.2s, transform 0.5s ease 0.2s'
              : 'opacity 0.4s ease, transform 0.5s ease'
          }}
        />
      </svg>
    </div>
  )
}
```

## 5. SettingsNavButton component (in CreatorDashboard.tsx)

Already added after line 15:

```typescript
const SettingsNavButton = ({ 
  onClick, 
  isActive, 
  icon, 
  label 
}: { 
  onClick: () => void; 
  isActive: boolean; 
  icon: React.ReactElement; 
  label: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
        isActive ? 'shadow-md' : 'hover:brightness-105'
      }`}
      style={{
        backgroundColor: isActive ? '#0f0f13' : 'transparent',
        color: '#F8FAFC'
      }}
    >
      {React.cloneElement(icon, { isHovered })}
      {label}
    </button>
  );
};
```

## Key features:

- All transitions work in both directions (hover and unhover)
- Inline styles with `transition` CSS property
- `isHovered` prop controls animation state
- No CSS keyframes needed
- Smooth easing functions (`ease`, `ease-in-out`)

The animations should now smoothly transition back to normal when you stop hovering.



