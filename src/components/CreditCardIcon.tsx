export function CreditCardIcon() {
  return (
    <div className="flex items-center justify-center" style={{ perspective: '200px' }}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 transition-transform duration-600 group-hover:animate-card-flip"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <rect
          x="6"
          y="12"
          width="36"
          height="24"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1="6"
          y1="20"
          x2="42"
          y2="20"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <rect
          x="12"
          y="26"
          width="8"
          height="6"
          rx="1"
          stroke="currentColor"
          strokeWidth="2.5"
          className="transition-opacity duration-300 group-hover:opacity-100"
        />
        <line
          x1="26"
          y1="29"
          x2="36"
          y2="29"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="2 4"
        />
        <rect
          x="6"
          y="12"
          width="8"
          height="24"
          fill="url(#shimmer)"
          className="opacity-0 group-hover:animate-shimmer-sweep"
        />
        <defs>
          <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
