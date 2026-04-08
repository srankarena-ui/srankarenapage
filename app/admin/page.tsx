"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import { UserProfile, Tournament } from "../../types";
import Modal from "../../components/Modal";

// Iconos SVG Nativos
const Globe = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const InfoIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const Swords = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" y1="14" x2="9" y2="18"/><line x1="7" y1="17" x2="4" y2="20"/><line x1="3" y1="19" x2="5" y2="21"/></svg>;
const ChevronLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const ChevronRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const Trophy = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const ImageFileIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "events" | "games">("events");
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [showDummies, setShowDummies] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newGameName, setNewGameName] = useState("");
  const [modal, setModal] = useState<{isOpen: boolean, title: string, message: string, type: 'alert' | 'confirm', onConfirm?: () => void}>({isOpen: false, title: '', message: '', type: 'alert'});

  const initialFormData = {
    title: "",
    game: "League of Legends",
    start_date: "",
    start_time: "",
    banner_url: "",
    contact_method: "Discord",
    discord_link: "",
    region: "North America",
    map: "Howling Abyss",
    game_type: "Blind Pick",
    mode: "1v1",
    series_format: "Bo1",
    registration_status: "Open",
    check_in: "Disabled",
    score_reporting: "Admins & Players",
    require_screenshots: "Not Required",
    participant_limit: "Limited",
    max_participants: 16,
    reward_points: 100,
    tournament_format: "Single Elimination",
    rules: "",
    prizes: "",
    schedule: ""
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return router.push("/login");
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (!profile || (profile.role !== "admin" && profile.role !== "organizador")) return router.push("/");

    const [uRes, tRes, gRes] = await Promise.all([
      supabase.from("profiles").select("*").order('username'),
      supabase.from("tournaments").select("*").order('created_at', { ascending: false }),
      supabase.from("games").select("*").order('name')
    ]);
    
    if (uRes.data) setUsers(uRes.data);
    if (tRes.data) setTournaments(tRes.data);
    if (gRes.data) setAvailableGames(gRes.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const saveTournament = async () => {
    setIsPublishing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload = { 
        title: formData.title, 
        game: formData.game, 
        mode: formData.mode, 
        max_participants: formData.max_participants, 
        tournament_format: formData.tournament_format, 
        reward_points: formData.reward_points, 
        series_format: formData.series_format,
        start_date: formData.start_date,
        start_time: formData.start_time,
        banner_url: formData.banner_url,
        contact_method: formData.contact_method,
        discord_link: formData.discord_link,
        region: formData.region,
        map: formData.map,
        game_type: formData.game_type,
        registration_status: formData.registration_status,
        rules: formData.rules,
        prizes: formData.prizes,
        created_by: session?.user.id 
      };

      if (editingId) {
        await supabase.from("tournaments").update(payload).eq("id", editingId);
      } else {
        await supabase.from("tournaments").insert([payload]);
      }
      
      cancelEdit(); 
      await loadData(); 
      setModal({isOpen: true, title: '✅ Éxito', message: editingId ? 'TOURNAMENT UPDATED SUCCESSFULLY' : 'TOURNAMENT PUBLISHED SUCCESSFULLY', type: 'alert'});

    } catch (error: any) {
      console.error("DB Error:", error);
      setModal({isOpen: true, title: 'Error de Base de Datos', message: `DATABASE ERROR: ${error.message}`, type: 'alert'});
    } finally {
      setIsPublishing(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else saveTournament();
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  const startEditing = (t: any) => {
    setEditingId(t.id); 
    setFormData({ 
      ...formData, 
      title: t.title || "", 
      game: t.game || "League of Legends", 
      mode: t.mode || "1v1", 
      max_participants: t.max_participants || 16, 
      tournament_format: t.tournament_format || "Single Elimination", 
      series_format: t.series_format || "Bo1",
      start_date: t.start_date || "",
      start_time: t.start_time || "",
      banner_url: t.banner_url || "",
      rules: t.rules || "",
      prizes: t.prizes || "",
      region: t.region || "North America",
      map: t.map || "Howling Abyss",
      contact_method: t.contact_method || "Discord",
      discord_link: t.discord_link || ""
    });
    setCurrentStep(1); 
    setActiveTab("events");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTournament = async (id: string) => {
    setModal({isOpen: true, title: 'Eliminar Torneo', message: '¿Estás seguro que quieres eliminar este torneo? Esta acción no se puede deshacer.', type: 'confirm', onConfirm: async () => {
      await supabase.from("tournaments").delete().eq("id", id);
      loadData();
      setModal({isOpen: false, title: '', message: '', type: 'alert'});
    }});
  };

  const purgeDummies = async () => {
    const ids = users.filter(u => u.is_dummy).map(u => u.id);
    if (ids.length === 0) return;
    setModal({isOpen: true, title: 'Purgar Dummies', message: `¿Estás seguro que quieres eliminar ${ids.length} dummies?`, type: 'confirm', onConfirm: async () => {
      setLoading(true);
      await supabase.from("tournament_participants").delete().in("user_id", ids);
      await supabase.from("profiles").delete().in("id", ids);
      loadData();
      setModal({isOpen: false, title: '', message: '', type: 'alert'});
    }});
  };

  const createDummy = async () => {
    const dummy = { id: crypto.randomUUID(), username: `Hunter_${Math.floor(Math.random() * 9000)+1000}`, rank: "UNRANKED", role: "usuario", is_dummy: true };
    await supabase.from("profiles").insert([dummy]);
    loadData();
  };

  const deleteUser = async (userId: string) => {
    setModal({isOpen: true, title: 'Eliminar Usuario', message: '¿Estás seguro que quieres eliminar este usuario?', type: 'confirm', onConfirm: async () => {
      await supabase.from("profiles").delete().eq("id", userId);
      loadData();
      setModal({isOpen: false, title: '', message: '', type: 'alert'});
    }});
  };

  const addGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameName) return;
    await supabase.from("games").insert([{ name: newGameName, slug: newGameName.toLowerCase().replace(/ /g, "-") }]);
    setNewGameName(""); loadData();
  };

  if (loading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-purple-500 font-black italic tracking-widest animate-pulse">INITIATING TERMINAL...</div>;

  return (
    <>
      <main className="min-h-screen bg-[#0b0e14] text-gray-200 p-4 md:p-8 font-sans">
      <div className="max-w-[1900px] mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8 border-b border-gray-800 pb-10">
          <div>
            <h1 className="text-4xl font-black uppercase italic text-white tracking-tighter leading-none">Command Center</h1>
            <p className="text-[11px] font-bold text-purple-500 uppercase tracking-[0.5em] mt-3 italic">Elite Tactical Unit Interface</p>
          </div>
          <nav className="flex bg-[#121620] p-1.5 rounded-2xl border border-gray-800 shadow-2xl">
            {["events", "users", "games"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-10 py-3 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl ${activeTab === tab ? "bg-purple-600 text-white shadow-xl shadow-purple-900/30" : "text-gray-500 hover:text-white"}`}>{tab}</button>
            ))}
          </nav>
        </header>

        {activeTab === "users" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
               <div className="flex gap-4">
                <button onClick={createDummy} className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">Create Dummy</button>
                <button onClick={purgeDummies} className="bg-red-600/10 border border-red-500 text-red-500 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Purge Dummies</button>
                <button onClick={() => setShowDummies(!showDummies)} className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase border transition-all ${showDummies ? 'border-purple-500 text-purple-400' : 'border-gray-800 text-gray-500'}`}>{showDummies ? "Showing Dummies" : "Hiding Dummies"}</button>
               </div>
               <p className="text-[11px] font-black text-gray-600 uppercase italic">Registered Hunters: {users.length}</p>
            </div>
            <div className="bg-[#121620] border border-gray-800 rounded-[3rem] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-[#0b0e14] text-[11px] font-black uppercase text-gray-500 border-b border-gray-800">
                  <tr><th className="px-10 py-8 italic">Type</th><th className="px-10 py-8 italic text-center w-80">Hunter Identity</th><th className="px-10 py-8 italic text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {users.filter(u => showDummies || !u.is_dummy).map((u) => (
                    <tr key={u.id} className="hover:bg-[#1e2330] transition-colors group">
                      <td className="px-10 py-8 text-center">{u.is_dummy ? <span className="text-[8px] bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/30 text-purple-400 font-black">DUMMY</span> : "👤"}</td>
                      <td className="px-10 py-8 font-black text-white uppercase italic tracking-tighter text-lg">{u.username}</td>
                      <td className="px-10 py-8 text-right"><button onClick={() => deleteUser(u.id)} className="text-gray-600 hover:text-red-500 p-3 transition-all">Del</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "games" && (
          <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-500">
            <form onSubmit={addGame} className="bg-[#121620] p-10 rounded-[3rem] border border-gray-800 shadow-2xl mb-12 text-center">
              <h2 className="text-2xl font-black italic uppercase text-white mb-8 tracking-tighter">Register New Battleground</h2>
              <div className="flex gap-6">
                <input type="text" value={newGameName} onChange={(e) => setNewGameName(e.target.value)} placeholder="Game Name (e.g. Valorant)" className="flex-1 bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-lg outline-none focus:border-purple-500 transition-all font-black uppercase" />
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-12 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">Add</button>
              </div>
            </form>
            <div className="grid grid-cols-1 gap-6">
              {availableGames.map(game => (
                <div key={game.id} className="bg-[#121620] border border-gray-800 p-8 rounded-3xl flex justify-between items-center shadow-xl hover:border-purple-500/40 transition-all group">
                  <span className="font-black italic uppercase text-white tracking-tighter text-xl">{game.name}</span>
                  <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">{game.slug}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-500">
            <div className={`lg:col-span-8 bg-[#121620] rounded-[3.5rem] border-2 border-gray-800 overflow-hidden shadow-2xl flex flex-col min-h-[700px]`}>
              
              {/* STEP INDICATOR */}
              <div className="flex border-b border-gray-800 bg-[#0b0e14]/50">
                {[
                  { step: 1, label: 'Basics', icon: <Globe /> },
                  { step: 2, label: 'Info', icon: <InfoIcon /> },
                  { step: 3, label: 'Settings', icon: <Swords /> }
                ].map((item) => (
                  <div 
                    key={item.step}
                    className={`flex-1 py-6 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-4 ${currentStep === item.step ? 'border-purple-600 text-white bg-[#1e2330]' : 'border-transparent text-gray-600'}`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${currentStep >= item.step ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                      {item.step}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* FORM CONTENT */}
              <div className="p-12 flex-grow">
                
                {currentStep === 1 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[14px] font-black text-white uppercase tracking-widest italic">Step 1: Tournament Basics</h3>
                      {editingId && <span className="bg-blue-600 text-white text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]">MODE: EDITING</span>}
                    </div>
                    
                    {/* BANNER INPUT */}
                    <div className="mb-10">
                      <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest flex items-center gap-2">
                        <ImageFileIcon /> Banner URL
                      </label>
                      <input 
                        type="text" 
                        value={formData.banner_url} 
                        onChange={(e) => handleFormChange("banner_url", e.target.value)} 
                        placeholder="https://imgur.com/your-image.png" 
                        className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white outline-none focus:border-purple-500 transition-all font-medium" 
                      />
                      {formData.banner_url && (
                        <div className="mt-4 h-32 w-full rounded-2xl overflow-hidden border-2 border-gray-800 relative">
                           <img src={formData.banner_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/1200x600?text=Invalid+Image+URL")} />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Tournament Name</label>
                        <input type="text" value={formData.title} onChange={(e) => handleFormChange("title", e.target.value)} placeholder="e.g. RASDA TOURNAMENT 3.0" className="w-full bg-[#0b0e14] border-2 border-gray-800 p-6 rounded-3xl text-white text-xl outline-none focus:border-purple-500 transition-all font-black uppercase" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Game</label>
                        <select value={formData.game} onChange={(e) => handleFormChange("game", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-6 rounded-3xl text-lg font-black uppercase text-white">{availableGames.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}</select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Date</label>
                          <input type="date" value={formData.start_date} onChange={(e) => handleFormChange("start_date", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-6 rounded-3xl text-white font-black" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Time</label>
                          <input type="time" value={formData.start_time} onChange={(e) => handleFormChange("start_time", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-6 rounded-3xl text-white font-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-[14px] font-black text-white uppercase tracking-widest italic mb-6">Step 2: Contact & Rules</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Contact Method</label>
                        <select value={formData.contact_method} onChange={(e) => handleFormChange("contact_method", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white font-black uppercase"><option>Discord</option><option>Email</option></select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Discord Link</label>
                        <input type="text" value={formData.discord_link} onChange={(e) => handleFormChange("discord_link", e.target.value)} placeholder="https://discord.gg/..." className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white font-black" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Rules</label>
                      <textarea value={formData.rules} onChange={(e) => handleFormChange("rules", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-3xl text-white min-h-[120px] outline-none focus:border-purple-500" placeholder="Describe the rules..."></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Prizes</label>
                      <textarea value={formData.prizes} onChange={(e) => handleFormChange("prizes", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-3xl text-white min-h-[120px] outline-none focus:border-purple-500" placeholder="e.g. PRIZES: 200€ / MVP PRIZE 25€"></textarea>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-[14px] font-black text-white uppercase tracking-widest italic mb-6">Step 3: Match Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       <div>
                         <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Best Of</label>
                         <select value={formData.series_format} onChange={(e) => handleFormChange("series_format", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white font-black">
                           <option value="Bo1">BO1</option>
                           <option value="Bo3">BO3</option>
                           <option value="Bo5">BO5</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Map</label>
                         <input type="text" value={formData.map} onChange={(e) => handleFormChange("map", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white font-black uppercase" />
                       </div>
                       <div>
                         <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Region</label>
                         <input type="text" value={formData.region} onChange={(e) => handleFormChange("region", e.target.value)} placeholder="e.g. EU West" className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white font-black uppercase" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-800 pt-8">
                       <div className="flex gap-4 items-end">
                         <div className="flex-1">
                           <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Player Limit</label>
                           <select value={formData.participant_limit} onChange={(e) => handleFormChange("participant_limit", e.target.value)} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white font-black uppercase">
                             <option>Unlimited</option>
                             <option>Limited</option>
                           </select>
                         </div>
                         {formData.participant_limit === "Limited" && (
                           <div className="w-32">
                             <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Max</label>
                             <input type="number" value={formData.max_participants} onChange={(e) => handleFormChange("max_participants", parseInt(e.target.value))} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white font-black" />
                           </div>
                         )}
                       </div>
                       <div>
                         <label className="block text-[10px] font-black text-gray-600 mb-3 uppercase tracking-widest">Reward Points</label>
                         <input type="number" value={formData.reward_points} onChange={(e) => handleFormChange("reward_points", parseInt(e.target.value))} className="w-full bg-[#0b0e14] border-2 border-gray-800 p-5 rounded-2xl text-white font-black" />
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FIXED ACTION FOOTER */}
              <div className="p-10 border-t border-gray-800 bg-[#0b0e14]/30 flex gap-6">
                {currentStep > 1 && (
                  <button 
                    onClick={prevStep}
                    disabled={isPublishing}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-6 rounded-3xl text-[12px] font-black uppercase tracking-[0.2em] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <ChevronLeft /> Back
                  </button>
                )}
                
                <button 
                  onClick={nextStep}
                  disabled={isPublishing}
                  className={`flex-[2] py-6 rounded-3xl text-[14px] font-black uppercase tracking-[0.3em] transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50 disabled:cursor-wait
                  ${currentStep === 3 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-900/40 border border-green-400/30' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/40'}`}
                >
                  {isPublishing ? (
                    <span className="animate-pulse">DEPLOYING OPERATION...</span>
                  ) : currentStep === 3 ? (
                    <>{editingId ? 'UPDATE TOURNAMENT' : 'PUBLISH TOURNAMENT'} <Trophy /></>
                  ) : (
                    <>CONTINUE <ChevronRight /></>
                  )}
                </button>

                {editingId && (
                  <button 
                    onClick={cancelEdit}
                    className="bg-red-600/10 border border-red-500 text-red-500 px-8 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* LISTA DE OPERACIONES (REDISEÑADA TIPO TARJETA) */}
            <div className="lg:col-span-4 space-y-6">
                <h3 className="text-[11px] font-black uppercase text-gray-600 tracking-[0.5em] italic ml-4 text-center lg:text-left">Live Operations</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {tournaments.map(t => (
                    <div key={t.id} className="bg-[#202540] rounded-xl border border-[#2a2f4c] overflow-hidden shadow-lg flex flex-col">
                       
                       {/* CONTENIDO CLICKABLE DE LA TARJETA */}
                       <div className="flex flex-col cursor-pointer hover:bg-[#252a48] transition-colors" onClick={() => router.push(`/tournaments/${t.id}`)}>
                         {/* Header Banner */}
                         <div className="h-48 w-full bg-[#0b0e14] relative group overflow-hidden">
                           {t.banner_url ? (
                             <img src={t.banner_url} alt={t.title} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                           ) : (
                             <div className="w-full h-full bg-[#16192b] flex items-center justify-center">
                                <span className="text-gray-600 text-xs font-black uppercase tracking-widest">No Banner</span>
                             </div>
                           )}
                         </div>

                         {/* Info de Tarjeta */}
                         <div className="p-5 flex flex-col gap-4 relative z-10">
                           <h4 className="font-black text-white text-xl">{t.title}</h4>

                           <div className="flex justify-between items-center text-sm font-bold text-gray-300">
                             <div className="flex items-center gap-2"><CalendarIcon /> {t.start_date ? new Date(t.start_date).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'}) : "TBA"}</div>
                             <div className="flex items-center gap-2">
                               <ClockIcon /> {t.start_time || "TBA"} -05
                               <span className="ml-2 bg-indigo-500 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Live</span>
                             </div>
                           </div>

                           <div className="h-px w-full bg-[#2a2f4c]" />
                           <div className="text-sm font-bold text-gray-300">{t.region || "Global"}</div>
                           <div className="h-px w-full bg-[#2a2f4c]" />

                           <div className="flex items-center gap-3 text-sm font-black text-white">
                              <div className="w-6 h-6 bg-indigo-900 text-indigo-400 rounded flex items-center justify-center">
                                <Swords />
                              </div>
                              {t.game}
                           </div>
                         </div>
                       </div>
                       
                       {/* CONTROLES DE ADMIN (TOTALMENTE AISLADOS DEL CLIC DE LA TARJETA) */}
                       <div className="px-5 py-4 border-t border-[#2a2f4c] bg-[#1a1d36] flex justify-end gap-3 z-20">
                         <button 
                           onClick={() => startEditing(t)} 
                           className="flex items-center gap-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-xs font-black uppercase transition-all"
                         >
                           <EditIcon /> Edit
                         </button>
                         <button 
                           onClick={() => deleteTournament(t.id)} 
                           className="flex items-center gap-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg text-xs font-black uppercase transition-all"
                         >
                           <TrashIcon /> Delete
                         </button>
                       </div>

                    </div>
                  ))}
                </div>
            </div>
          </div>
        )}
      </div>
      </main>

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onClose={() => setModal({isOpen: false, title: '', message: '', type: 'alert'})}
        onConfirm={() => {
          if (modal.onConfirm) modal.onConfirm();
          setModal({isOpen: false, title: '', message: '', type: 'alert'});
        }}
      />
    </>
  );
}