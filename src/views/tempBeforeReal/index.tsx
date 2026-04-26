import AdSenseScript from '../../Components/AdSenseScript';
import RetroTV from './RetroTV';

// Static wooden sign — server rendered
function WoodenSign({ text }: { text: string }) {
  return (
    <div className="relative">
      <div
        className="px-6 py-4 rounded-lg shadow-lg"
        style={{
          background:
            'linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #8B4513 50%, #6B3E0A 75%, #8B4513 100%)',
          boxShadow:
            'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.3)',
        }}
      >
        <div
          className="absolute inset-0 opacity-20 rounded-lg pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 10px)',
          }}
        />
        <p
          className="text-amber-100 font-bold text-lg tracking-wide relative z-10"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
        >
          {text}
        </p>
      </div>
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-700 shadow-inner" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-700 shadow-inner" />
    </div>
  );
}

// Static wooden shelf — server rendered
function WoodenShelf() {
  return (
    <div className="w-full">
      <div
        className="h-4 rounded-t-sm"
        style={{
          background: 'linear-gradient(180deg, #A0522D 0%, #8B4513 50%, #6B3E0A 100%)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)',
        }}
      />
      <div
        className="h-3"
        style={{
          background: 'linear-gradient(180deg, #6B3E0A 0%, #5C3317 50%, #4A2511 100%)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  );
}

const tvData = [
  { style: 'beige', label: 'Featured Collection' },
  { style: 'cream', label: 'New Arrivals' },
  { style: 'gray', label: 'Best Sellers' },
];

export default function TempBeforeReal() {
  return (
    <div
      className="bg-gray-50 text-gray-900 selection:bg-indigo-500 selection:text-white min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <AdSenseScript />

      {/* Navigation — server rendered static HTML */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-24">
            <span className="font-bold text-4xl tracking-tight" style={{ width: 256 }}>
              Adorio
            </span>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="hidden md:block text-lg font-medium text-gray-600 hover:text-gray-900"
              >
                Sign in
              </a>
              <a
                href="#"
                className="px-6 py-3 bg-gray-900 text-white text-lg font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content — static scaffold; RetroTV is a client island */}
      <main className="pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col items-center">
            {tvData.map((tv) => (
              <div key={tv.style} className="w-full mb-2">
                <div className="flex items-center justify-center gap-8">
                  <div className="flex-shrink-0 w-full max-w-2xl">
                    {/* Client island: interactive carousel TV */}
                    <RetroTV style={tv.style} />
                    <div className="relative -mt-1">
                      <WoodenShelf />
                    </div>
                  </div>
                  <div className="hidden md:block flex-shrink-0">
                    <WoodenSign text={tv.label} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer — server rendered static HTML */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-12">
        <div className="px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-bold text-2xl text-gray-900">Adorio</span>
          <p className="text-gray-500 text-base">© 2026 Adorio Design. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
