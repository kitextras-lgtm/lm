export function LogOutIcon({ isHovered: _isHovered = false }: { isHovered?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      {/* Door frame */}
      <rect x="12" y="8" width="24" height="32" rx="2" stroke="currentColor" strokeWidth="2" fill="none" className="opacity-50" />

      {/* Light coming through opened gap */}
      <g className="opacity-0 transition-all duration-[400ms] delay-[150ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:opacity-100">
        <rect x="14" y="10" width="6" height="28" fill="currentColor" fillOpacity="0.4" />
        <rect x="20" y="12" width="4" height="24" fill="currentColor" fillOpacity="0.2" />
        <rect x="24" y="14" width="2" height="20" fill="currentColor" fillOpacity="0.1" />
      </g>

      {/* Door - swings open */}
      <g className="origin-left transition-all duration-[600ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:[transform:rotateY(-50deg)]" style={{ transformStyle: "preserve-3d" }}>
        <rect x="14" y="10" width="20" height="28" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08" />
        <circle cx="30" cy="26" r="2" fill="currentColor" className="opacity-70" />
      </g>
    </svg>
  );
}
