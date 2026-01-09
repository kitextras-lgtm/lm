export function LogOutIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center pointer-events-none">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        {/* Door frame */}
        <path
          d="M18 42H10a4 4 0 01-4-4V10a4 4 0 014-4h8"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            opacity: isHovered ? 1 : 0.7,
            transition: 'opacity 0.3s ease'
          }}
        />
        {/* Arrow path */}
        <path
          d="M32 16L40 24L32 32"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            opacity: isHovered ? 1 : 0.5,
            transform: isHovered ? 'translateX(2px)' : 'translateX(0px)',
            transition: 'opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s'
          }}
        />
        {/* Arrow line */}
        <path
          d="M40 24H18"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            opacity: isHovered ? 1 : 0.5,
            transition: 'opacity 0.3s ease 0.2s'
          }}
        />
      </svg>
    </div>
  );
}
