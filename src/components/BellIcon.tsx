export function BellIcon() {
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
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="transition-transform duration-300 origin-top group-hover:animate-bell-swing"
        />
        <path
          d="M20 34C20 37 22 40 24 40C26 40 28 37 28 34"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-transform duration-300 origin-top group-hover:animate-bell-swing"
        />
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-0 group-hover:animate-ripple-fast"
          style={{ transformOrigin: 'center' }}
        />
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-0 group-hover:animate-ripple-slow"
          style={{ transformOrigin: 'center', animationDelay: '0.2s' }}
        />
      </svg>
    </div>
  )
}
