interface AnimatedIconProps {
  isHovered?: boolean;
}

export function GuidebookIcon({ isHovered: _isHovered }: AnimatedIconProps) {
  return (
    <div className="relative w-5 h-5 flex items-center justify-center" style={{ perspective: '200px' }}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
        {/* Back cover (visible when open) */}
        <rect
          x="10"
          y="8"
          width="28"
          height="32"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.25"
          fill="none"
          className="opacity-0 transition-opacity duration-400 ease-in-out group-hover:opacity-100"
        />

        {/* Pages inside (visible when open) */}
        <g className="opacity-0 transition-opacity duration-400 ease-in-out group-hover:opacity-100">
          <line x1="16" y1="16" x2="32" y2="16" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" />
          <line x1="16" y1="22" x2="28" y2="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" />
          <line x1="16" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" />
        </g>

        {/* Front cover - rotates open on hover */}
        <g
          className="transition-transform duration-400 ease-in-out group-hover:[transform:perspective(200px)_rotateY(-50deg)]"
          style={{ transformOrigin: "10px 24px" }}
        >
          {/* Book cover */}
          <rect x="10" y="8" width="28" height="32" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />

          {/* Spine detail */}
          <line x1="14" y1="8" x2="14" y2="40" stroke="currentColor" strokeWidth="2" />

          {/* Question mark symbol */}
          <text
            x="26"
            y="28"
            fill="currentColor"
            fontSize="16"
            fontWeight="600"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="system-ui, sans-serif"
          >
            ?
          </text>

          {/* Bookmark ribbon */}
          <path d="M30 8V14L32 12L34 14V8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  )
}
