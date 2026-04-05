import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#0b0e14] py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto bg-[#121620] border border-gray-800 p-8 md:p-12 rounded-[2rem] shadow-2xl">
        <div className="mb-10">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 hover:text-white transition-colors">
            &larr; Return to Nexus
          </Link>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white mt-6 mb-2">
            Privacy Policy
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Last Updated: April 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">1. Introduction</h2>
            <p>Welcome to S-Rank Arena. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform, participate in our tournaments, or sync your game accounts.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">2. Data We Collect</h2>
            <p className="mb-2"><strong className="text-purple-400">Account Information:</strong> When you register, we collect your email address and authentication data through our secure provider. We do not store your passwords on our servers.</p>
            <p><strong className="text-purple-400">Gaming Data:</strong> When you link your Riot Games account, we collect your Player Universally Unique IDentifier (PUUID), Summoner Name, and in-game performance metrics (such as kills, vision score, damage dealt). This data is strictly gathered after your account is linked.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Calculate your S-Rank progression, achievements, and unlockable titles.</li>
              <li>Verify your performance and placement in our automated tournaments.</li>
              <li>Display public leaderboards and player profiles on our platform.</li>
              <li>Maintain the integrity of the competition and detect anomalous behavior.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">4. Third-Party Services</h2>
            <p>We use Supabase for secure database management and authentication. We interact with the Riot Games API to fetch your gameplay data. We do not sell, rent, or share your personal data with any other third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-black italic uppercase text-white mb-3">5. Your Rights & Data Deletion</h2>
            <p>You have the right to access, modify, or delete your personal data at any time. Upon deletion, all your synced stats and progression will be permanently removed from our databases.</p>
          </section>
        </div>
      </div>
    </main>
  );
}