import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function MobileAppSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation();

  return (
    <section 
      ref={sectionRef}
      className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden"
      style={{ background: '#000000' }}
    >
      <div
        className="max-w-4xl mx-auto"
        style={isVisible ? { animation: 'liftIn 0.75s cubic-bezier(0.22,1,0.36,1) forwards' } : { opacity: 0 }}
      >
        {/* Premium White Card */}
        <div 
          className="rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}
        >
          {/* Main Heading - Using Fraunces font to match site consistency */}
          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-10 md:mb-14 leading-tight"
            style={{ 
              fontFamily: 'Fraunces, serif',
              color: '#000000',
              letterSpacing: '-0.02em'
            }}
          >
            Fully Integrated<br />
            With Mobile
          </h2>

          {/* QR Code and Download Buttons */}
          <div className="flex flex-col items-center gap-8">
            {/* QR Code */}
            <div 
              className="bg-white p-6 rounded-2xl shadow-md"
              style={{ 
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)'
              }}
            >
              <div className="text-center mb-3">
                <p className="text-sm font-medium" style={{ color: '#1e293b' }}>Scan to</p>
                <p className="text-sm font-medium" style={{ color: '#1e293b' }}>get</p>
                <p className="text-sm font-semibold" style={{ color: '#000000' }}>Elevate</p>
              </div>
              <div 
                className="w-32 h-32 bg-white rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'%23000\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'30\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'50\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'70\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'10\' y=\'30\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'50\' y=\'30\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'70\' y=\'30\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'10\' y=\'50\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'30\' y=\'50\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'70\' y=\'50\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'10\' y=\'70\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'30\' y=\'70\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'50\' y=\'70\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3Crect x=\'70\' y=\'70\' width=\'10\' height=\'10\' fill=\'%23fff\'/%3E%3C/svg%3E")',
                  backgroundSize: 'cover'
                }}
              />
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 hover:scale-105"
              >
                <div 
                  className="flex items-center px-6 py-3 rounded-xl"
                  style={{ 
                    background: '#000000',
                    minWidth: '135px',
                    height: '40px'
                  }}
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="flex flex-col">
                    <span style={{ color: '#ffffff', fontSize: '11px', fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>Download on the</span>
                    <span style={{ color: '#ffffff', fontSize: '16px', fontFamily: 'Roboto, sans-serif', fontWeight: '500', lineHeight: '1' }}>App Store</span>
                  </div>
                </div>
              </a>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 hover:scale-105"
              >
                <div 
                  className="flex items-center px-6 py-3 rounded-xl"
                  style={{ 
                    background: '#000000',
                    minWidth: '135px',
                    height: '40px'
                  }}
                >
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l-2.83 2.83L5.67 9.828l8.997 5.88zm2.83 2.83l-2.528 1.66a.992.992 0 0 1-1.195-.12l-2.425-2.425 2.83-2.83 3.318 3.318zm1.66-9.426l-2.528 1.66a.992.992 0 0 1-1.195-.12L12.476 5.226l2.83-2.83 3.318 3.318z" fill="#34A853"/>
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z" fill="#EA4335"/>
                    <path d="M12.476 5.226L5.67 9.828l8.997 5.88 2.83-2.83-5.02-5.652z" fill="#FBBC04"/>
                  </svg>
                  <div className="flex flex-col">
                    <span style={{ color: '#ffffff', fontSize: '11px', fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>GET IT ON</span>
                    <span style={{ color: '#ffffff', fontSize: '16px', fontFamily: 'Roboto, sans-serif', fontWeight: '500', lineHeight: '1' }}>Google Play</span>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
