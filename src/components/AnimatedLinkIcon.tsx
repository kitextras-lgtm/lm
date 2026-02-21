import { Link2 } from "lucide-react"

export function AnimatedLinkIcon() {
  return (
    <div className="flex justify-center mb-4">
      <div className="home-icon-wrapper" style={{ width: '48px', height: '48px', overflow: 'visible' }}>
        <div className="relative" style={{ width: '48px', height: '48px', overflow: 'visible' }}>
          <div className="absolute" style={{ left: 0, top: 0, width: '48px', height: '48px', overflow: 'visible' }}>
            <Link2
              className="animate-link-left"
              size={48}
              strokeWidth={2.5}
              style={{
                clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <div className="absolute" style={{ left: 0, top: 0, width: '48px', height: '48px', overflow: 'visible' }}>
            <Link2
              className="animate-link-right"
              size={48}
              strokeWidth={2.5}
              style={{
                clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
