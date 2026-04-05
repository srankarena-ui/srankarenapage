import Link from "next/link";

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#0b0e14] py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-[#121620] border border-gray-800 p-8 md:p-12 rounded-[2rem] shadow-2xl">
        <div className="mb-10">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 hover:text-white transition-colors">
            &larr; Return to Nexus
          </Link>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mt-6 mb-2">
            Terms of Service
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Last Updated: April 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using S-Rank Arena, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">2. Riot Games Legal Disclaimer (Mandatory)</h2>
            <div className="border-l-4 border-purple-600 pl-4 bg-purple-900/10 py-3 px-4 italic text-gray-400 rounded-r-lg">
              S-Rank Arena isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">3. Code of Conduct & Competitive Integrity</h2>
            <p className="mb-3">S-Rank Arena is built on fair play. By linking your account, you agree that:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You will not use third-party scripts, cheats, or exploits during your matches.</li>
              <li>You will not engage in "smurfing" (using a lower-ranked account to manipulate your stats).</li>
              <li>Any attempt to manipulate the API syncing process will result in an immediate and permanent ban.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">4. Account Ownership</h2>
            <p>Your S-Rank Arena account, including all unlocked badges, titles, and accumulated XP, remains the property of S-Rank Arena. These assets hold no real-world monetary value and cannot be traded or sold.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">5. Limitation of Liability</h2>
            <p>S-Rank Arena is provided "as is". We are not responsible for server downtimes, API rate limits imposed by Riot Games, or data loss. We shall not be liable for any indirect damages arising out of your use of the platform.</p>
          </section>
        </div>
      </div>
    </main>
  );
}