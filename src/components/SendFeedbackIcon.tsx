export function SendFeedbackIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center pointer-events-none">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        {/* Message bubble */}
        <path
          d="M42 15a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h32a2 2 0 0 0 2-2V15z"
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
        {/* Message tail */}
        <path
          d="M8 37l-4 4V15"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            opacity: isHovered ? 0.9 : 0.5,
            transition: 'opacity 0.3s ease 0.1s'
          }}
        />
        {/* Text lines */}
        <path
          d="M16 20h16M16 26h12"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
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
