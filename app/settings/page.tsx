"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "../../components/Modal";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // League of Legends States
  const [gameName, setGameName] = useState("");
  const [tagline, setTagline] = useState("");
  const [region, setRegion] = useState("LAN");

  // Clash Royale States
  const [crTag, setCrTag] = useState("");
  const [crName, setCrName] = useState("");
  const [updatingCR, setUpdatingCR] = useState(false);

  // Modal State
  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, type: 'alert' | 'confirm'}>({isOpen: false, title: '', message: '', type: 'alert'});

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) {
        setProfile(data);
        
        // Load LOL data
        if (data.riot_gamename) setGameName(data.riot_gamename);
        if (data.riot_tagline) setTagline(data.riot_tagline);
        if (data.lol_region) setRegion(data.lol_region);

        // Load CR data
        if (data.cr_tag) setCrTag(data.cr_tag);
        if (data.cr_name) setCrName(data.cr_name);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  // =====================================
  // LEAGUE OF LEGENDS SAVING
  // =====================================
  const handleLinkRiot = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await fetch("/api/lol/verify", {
        method: "POST",
        body: JSON.stringify({ gameName, tagline, region }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const { error: dbError } = await supabase.from("profiles").update({
        riot_puuid: data.puuid,
        riot_gamename: data.gameName,
        riot_tagline: data.tagLine,
        lol_region: region
      }).eq("id", profile.id);

      if (dbError) throw dbError;

      setModal({isOpen: true, title: '✅ Success', message: 'Riot Account linked successfully.', type: 'alert'});
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setModal({isOpen: true, title: 'Error', message: err.message, type: 'alert'});
    } finally {
      setUpdating(false);
    }
  };

  // =====================================
  // CLASH ROYALE SAVING
  // =====================================
  const handleLinkCR = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingCR(true);
    try {
      if (!crTag.trim()) throw new Error("Player Tag is required.");
      if (!crName.trim()) throw new Error("In-game name is required.");

      // Clean the Tag to ensure it starts with '#'
      let finalTag = crTag.trim().toUpperCase();
      if (!finalTag.startsWith("#")) {
          finalTag = "#" + finalTag;
      }

      const { error: dbError } = await supabase.from("profiles").update({
        cr_tag: finalTag,
        cr_name: crName.trim()
      }).eq("id", profile.id);

      if (dbError) throw dbError;

      setModal({isOpen: true, title: '✅ Success', message: 'Clash Royale Account linked successfully!', type: 'alert'});
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setModal({isOpen: true, title: 'Error', message: err.message, type: 'alert'});
    } finally {
      setUpdatingCR(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0b0e14]"></div>;

  return (
    <>
      <main className="min-h-screen bg-[#0b0e14] text-gray-200 p-8 font-sans pb-32">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <Link href={`/profile/${profile.username}`} className="text-[10px] font-black uppercase text-gray-600 hover:text-white transition-all tracking-[0.2em]">&larr; Back to Profile</Link>
          <h1 className="text-4xl font-black text-white italic uppercase mt-4">Account Settings</h1>
        </header>

        <div className="space-y-8">
            {/* ==============================================
                SECTION: LEAGUE OF LEGENDS
                ============================================== */}
            <section className="bg-[#121620] border border-gray-800 rounded-[2.5rem] p-8 shadow-xl">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-red-600/10 flex items-center justify-center rounded-xl text-red-500 font-black italic border border-red-500/20">L</div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">League of Legends Link</h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Riot Games Connection</p>
                  </div>
               </div>

               {profile.riot_puuid ? (
                 <div className="bg-[#0b0e14] border border-red-500/30 p-6 rounded-3xl flex flex-col sm:flex-row gap-6 justify-between items-center shadow-inner">
                    <div className="text-center sm:text-left">
                      <p className="text-[9px] text-gray-600 font-black uppercase mb-1 tracking-widest">Linked in {profile.lol_region}</p>
                      <p className="text-2xl font-black text-white italic uppercase tracking-tighter">{profile.riot_gamename} <span className="text-gray-700">#{profile.riot_tagline}</span></p>
                    </div>
                    <button onClick={async () => {
                       if(!confirm("Unlink Riot ID? You will lose access to LOL tournaments.")) return;
                       await supabase.from("profiles").update({ riot_puuid: null, riot_gamename: null, riot_tagline: null, lol_region: null }).eq("id", profile.id);
                       window.location.reload();
                    }} className="w-full sm:w-auto bg-gray-900 text-gray-500 border border-gray-800 px-6 py-4 rounded-xl text-[10px] font-black uppercase hover:border-red-500 hover:text-red-500 transition-all tracking-widest">Unlink</button>
                 </div>
               ) : (
                 <form onSubmit={handleLinkRiot} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                         <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Riot ID</label>
                         <input type="text" placeholder="e.g. Faker" value={gameName} onChange={(e) => setGameName(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" required />
                      </div>
                      <div className="relative">
                         <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Tagline</label>
                         <input type="text" placeholder="e.g. NA1" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-all" required />
                      </div>
                    </div>
                    <div className="relative mt-6">
                      <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Region</label>
                      <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm text-white font-bold outline-none focus:border-red-500 transition-all appearance-none">
                        <option value="LAN">Latin America North (LAN)</option>
                        <option value="LAS">Latin America South (LAS)</option>
                        <option value="NA">North America (NA)</option>
                        <option value="EUW">Europe West (EUW)</option>
                        <option value="BR">Brazil (BR)</option>
                      </select>
                    </div>
                    <button type="submit" disabled={updating} className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-5 rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-red-900/20 transition-all disabled:opacity-50">
                      {updating ? "Verifying..." : "Link Riot ID"}
                    </button>
                 </form>
               )}
            </section>

            {/* ==============================================
                SECTION: CLASH ROYALE
                ============================================== */}
            <section className="bg-[#121620] border border-gray-800 rounded-[2.5rem] p-8 shadow-xl">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-10 h-10 bg-blue-600/10 flex items-center justify-center rounded-xl text-blue-500 font-black italic border border-blue-500/20">C</div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Clash Royale Link</h2>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Supercell Connection</p>
                  </div>
               </div>

               {profile.cr_tag ? (
                 <div className="bg-[#0b0e14] border border-blue-500/30 p-6 rounded-3xl flex flex-col sm:flex-row gap-6 justify-between items-center shadow-inner">
                    <div className="text-center sm:text-left">
                      <p className="text-[9px] text-gray-600 font-black uppercase mb-1 tracking-widest">Supercell Arena</p>
                      <p className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">{profile.cr_name}</p>
                      <p className="text-xs font-bold text-gray-500 tracking-widest">{profile.cr_tag}</p>
                    </div>
                    <button onClick={async () => {
                       if(!confirm("Unlink Clash Royale? You will lose access to CR tournaments.")) return;
                       await supabase.from("profiles").update({ cr_tag: null, cr_name: null }).eq("id", profile.id);
                       window.location.reload();
                    }} className="w-full sm:w-auto bg-gray-900 text-gray-500 border border-gray-800 px-6 py-4 rounded-xl text-[10px] font-black uppercase hover:border-blue-500 hover:text-blue-500 transition-all tracking-widest">Unlink</button>
                 </div>
               ) : (
                 <form onSubmit={handleLinkCR} className="space-y-6">
                    <div className="relative">
                       <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">In-Game Name</label>
                       <input type="text" placeholder="e.g. PlayerOne" value={crName} onChange={(e) => setCrName(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-white" required />
                    </div>
                    <div className="relative">
                       <label className="text-[9px] font-black uppercase text-gray-600 absolute -top-2 left-4 bg-[#121620] px-2 tracking-widest">Player Tag</label>
                       <input type="text" placeholder="e.g. #2P0YQ029" value={crTag} onChange={(e) => setCrTag(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all text-white uppercase" required />
                       <p className="text-[10px] text-gray-600 font-bold mt-3 ml-2 tracking-widest">Find your Tag below your name in your in-game profile.</p>
                    </div>
                    <button type="submit" disabled={updatingCR} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-xl text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50">
                      {updatingCR ? "Verifying Tag..." : "Link CR Tag"}
                    </button>
                 </form>
               )}
            </section>
        </div>

      </div>
    </main>

    {/* NOTIFICATION MODAL */}
    <Modal
      isOpen={modal.isOpen}
      title={modal.title}
      message={modal.message}
      type={modal.type}
      onClose={() => setModal({isOpen: false, title: '', message: '', type: 'alert'})}
    />
    </>
  );
}