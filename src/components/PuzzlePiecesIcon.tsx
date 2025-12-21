export function PuzzlePiecesIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center pointer-events-none">
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
            transform: isHovered ? 'translate(-4px, -4px)' : 'translate(0, 0)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        />
        <path
          d="M24 10H38V24H34C34 24 34 22 32 22C30 22 30 24 30 24H24V20C24 20 26 20 26 18C26 16 24 16 24 16V10Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? 'translate(4px, -4px)' : 'translate(0, 0)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s'
          }}
        />
        <path
          d="M10 28H20V34C20 34 18 34 18 36C18 38 20 38 20 38V42H10V28Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? 'translate(-4px, 4px)' : 'translate(0, 0)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s'
          }}
        />
        <path
          d="M24 28H30C30 28 30 26 32 26C34 26 34 28 34 28H38V42H24V38C24 38 26 38 26 36C26 34 24 34 24 34V28Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          style={{
            transform: isHovered ? 'translate(4px, 4px)' : 'translate(0, 0)',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s'
          }}
        />
      </svg>
    </div>
  )
}
