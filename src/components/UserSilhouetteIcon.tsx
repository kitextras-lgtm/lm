export function UserSilhouetteIcon() {
  return (
    <div className="flex items-center justify-center">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        <circle
          cx="24"
          cy="16"
          r="6"
          stroke="currentColor"
          strokeWidth="2.5"
          className="transition-all duration-300 group-hover:scale-110"
          style={{ transformOrigin: '24px 16px' }}
        />
        <path
          d="M12 40C12 32 17 28 24 28C31 28 36 32 36 40"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-300 group-hover:scale-105"
          style={{ transformOrigin: '24px 34px' }}
        />
        <line
          x1="10"
          y1="8"
          x2="38"
          y2="8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-0 group-hover:opacity-100 group-hover:animate-scan-line"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="1.5"
          className="opacity-0 scale-75 group-hover:opacity-40 group-hover:scale-100 transition-all duration-500"
          style={{ transformOrigin: 'center' }}
        />
      </svg>
    </div>
  )
}
