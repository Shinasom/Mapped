import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden">
      
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-tighter text-blue-400">
          Mapped<span className="text-white">.</span>
        </div>
        <div className="space-x-4">
          <Link href="/login" className="text-slate-300 hover:text-white transition">
            Log In
          </Link>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full font-medium transition shadow-lg shadow-blue-900/50">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4">
        <div className="max-w-3xl space-y-6">
          <div className="inline-block bg-blue-900/30 border border-blue-800 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            🚀 The smart way to track your journey
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
            Visualize Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Global Footprint
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            Mark districts, auto-complete states, and conquer countries. 
            The first scratch map that understands geography.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link 
              href="/login" 
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-900/20 transition hover:scale-105"
            >
              Start Mapping Now
            </Link>
            <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-lg border border-slate-700 transition">
              View Demo
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 max-w-6xl w-full text-left">
          <FeatureCard 
            icon="🗺️" 
            title="Smart Bubbling" 
            desc="Visit a district, and we automatically mark the state and country. No more manual ticking."
          />
          <FeatureCard 
            icon="🔒" 
            title="Privacy First" 
            desc="Your data is yours. We track your travels securely without selling your location history."
          />
          <FeatureCard 
            icon="📸" 
            title="Memory Lane" 
            desc="Attach photos to locations (Coming Soon). Build a visual diary of your adventures."
          />
        </div>
      </main>

      <footer className="relative z-10 p-8 text-center text-slate-600 text-sm">
        © 2025 Mapped Inc. Built for travelers.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400">{desc}</p>
    </div>
  );
}