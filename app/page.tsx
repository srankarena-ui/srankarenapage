import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen bg-[#0b0e14] overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center px-4 md:px-8">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center mt-10">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">
              Premier eSports Organization
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl">
            Forge Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-500">
              Legacy
            </span>
          </h1>
          
          <p className="max-w-2xl text-gray-400 text-sm md:text-base font-bold tracking-wide uppercase mb-12">
            Progression is earned, not given. Compete in our official automated tournaments and unlock S-Rank titles based strictly on your performance in the Arena.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link 
              href="/register" 
              className="bg-purple-600 hover:bg-purple-500 text-white px-10 py-5 rounded-2xl text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.6)] hover:-translate-y-1"
            >
              Initiate Neural Link
            </Link>
            <Link 
              href="/services" 
              className="bg-transparent border border-gray-700 hover:border-gray-500 hover:bg-gray-900 text-white px-10 py-5 rounded-2xl text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="py-24 bg-[#080a0f] border-t border-gray-900 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Our <span className="text-purple-500">Technology</span></h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">Integral solutions for communities and competitions.</p>
            </div>
            <div className="h-1 w-24 bg-purple-600 rounded-full md:mb-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Service 1 */}
            <div className="bg-[#121620] border border-gray-800 p-8 rounded-[2rem] hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-4">Exclusive Tournaments</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Automated brackets with official Riot Tournament Codes. Your stats, medals, and titles are exclusively forged in our competitive events.
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-[#121620] border border-gray-800 p-8 rounded-[2rem] hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-4">Stream Experiences</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Custom Twitch extensions and overlays. From real-time 1v1/2v2 stats to interactive trivia minigames designed for your audience.
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-[#121620] border border-gray-800 p-8 rounded-[2rem] hover:border-purple-500/50 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              </div>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-4">Community Systems</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Custom Discord bots. We implement economies, reward collection, access control, and constant engagement to keep your community alive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HALL OF FAME */}
      <section className="py-24 bg-[#0b0e14] border-t border-gray-900 relative">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mb-4">Hall of <span className="text-purple-500">Fame</span></h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Epic battles that defined the Arena.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Event 1 */}
            <div className="group rounded-[2rem] overflow-hidden bg-gray-900 border border-gray-800 relative shadow-xl">
              <div className="h-48 w-full bg-gradient-to-br from-indigo-900 to-[#0b0e14] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                <h3 className="text-4xl font-black italic text-white/20 uppercase transform -rotate-12 group-hover:scale-110 transition-transform duration-500">S-RANK S1</h3>
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-6 right-6 bg-purple-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border-2 border-[#0b0e14]">
                  Completed
                </div>
                <h4 className="text-lg font-black uppercase italic text-white mb-2">Inaugural Tournament S1</h4>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Champion: <span className="text-purple-400">Nightfury</span></span>
                  <span className="text-[10px] text-gray-600 font-bold uppercase">Dec 2025</span>
                </div>
              </div>
            </div>

            {/* Event 2 */}
            <div className="group rounded-[2rem] overflow-hidden bg-gray-900 border border-gray-800 relative shadow-xl">
              <div className="h-48 w-full bg-gradient-to-br from-red-900/50 to-[#0b0e14] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                <h3 className="text-4xl font-black italic text-white/20 uppercase transform -rotate-12 group-hover:scale-110 transition-transform duration-500">2V2 CLASH</h3>
              </div>
              <div className="p-6 relative">
                <div className="absolute -top-6 right-6 bg-gray-700 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border-2 border-[#0b0e14]">
                  Completed
                </div>
                <h4 className="text-lg font-black uppercase italic text-white mb-2">Abyss Duos 2v2</h4>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Champions: <span className="text-red-400">Team X</span></span>
                  <span className="text-[10px] text-gray-600 font-bold uppercase">Feb 2026</span>
                </div>
              </div>
            </div>

            {/* Event 3 */}
            <div className="group rounded-[2rem] overflow-hidden bg-gray-900 border border-gray-800 relative shadow-xl">
              <div className="h-48 w-full bg-gradient-to-br from-purple-900 to-[#0b0e14] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                <div className="absolute inset-0 backdrop-blur-sm bg-black/40 z-10 flex items-center justify-center">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-purple-400 border border-purple-500 px-4 py-2 rounded-lg bg-black/50">Upcoming</span>
                </div>
                <h3 className="text-4xl font-black italic text-white/10 uppercase transform -rotate-12">INVITATIONAL</h3>
              </div>
              <div className="p-6 relative opacity-50">
                <h4 className="text-lg font-black uppercase italic text-white mb-2">S-Rank Invitational</h4>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Prize Pool: <span className="text-gray-300">Classified</span></span>
                  <span className="text-[10px] text-gray-600 font-bold uppercase">May 2026</span>
                </div>
              </div>
            </div>

          </div>
          
          <div className="mt-12 text-center">
            <Link href="/tournaments" className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-purple-400 transition-colors border-b border-transparent hover:border-purple-400 pb-1">
              View all records &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION SECTION */}
      <section className="border-t border-gray-900 bg-[#080a0f] py-24 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 px-4">
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-8">The Nexus Awaits</h2>
          <Link 
            href="/register" 
            className="inline-block bg-white text-black hover:bg-gray-200 px-12 py-5 rounded-2xl text-xs md:text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:scale-105"
          >
            Join the Arena
          </Link>
        </div>
      </section>
    </main>
  );
}