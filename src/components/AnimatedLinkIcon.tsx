import { Link2 } from "lucide-react"

export function AnimatedLinkIcon() {
  return (
    <div className="flex justify-center mb-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 overflow-hidden">
          <Link2
            className="text-[#64748B] animate-link-left"
            size={48}
            strokeWidth={2}
            style={{
              clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
            }}
          />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <Link2
            className="text-[#64748B] animate-link-right"
            size={48}
            strokeWidth={2}
            style={{
              clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
            }}
          />
        </div>
      </div>
    </div>
  )
}
