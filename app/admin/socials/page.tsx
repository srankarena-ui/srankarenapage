"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Ajusta tu ruta

export default function AdminSocials() {
  const [socials, setSocials] = useState<any[]>([]);
  const [platform, setPlatform] = useState("Twitter");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSocials = async () => {
    const { data } = await supabase.from('social_links').select('*').order('created_at', { ascending: true });
    if (data) setSocials(data);
  };

  useEffect(() => {
    fetchSocials();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    
    await supabase.from('social_links').insert([{ platform, url }]);
    
    setUrl("");
    fetchSocials();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('social_links').delete().eq('id', id);
    fetchSocials();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black italic uppercase text-white mb-8">Manage Social Links</h1>

      {/* Formulario para agregar */}
      <div className="bg-[#121620] border border-gray-800 p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold text-purple-400 mb-4">Add New Network</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">Platform</label>
            <select 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="Twitter">Twitter / X</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitch">Twitch</option>
              <option value="YouTube">YouTube</option>
              <option value="Discord">Discord</option>
              <option value="Facebook">Facebook</option>
              <option value="Website">Website (Generic Icon)</option>
            </select>
          </div>
          <div className="flex-[2] w-full">
            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">URL Link</label>
            <input 
              type="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-lg focus:outline-none focus:border-purple-500"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-lg transition-colors w-full md:w-auto"
          >
            {loading ? "Adding..." : "Add Link"}
          </button>
        </form>
      </div>

      {/* Lista de redes activas */}
      <div className="bg-[#121620] border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="p-4">Platform</th>
              <th className="p-4">URL</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {socials.map((social) => (
              <tr key={social.id} className="text-gray-300 text-sm hover:bg-gray-800/50">
                <td className="p-4 font-bold">{social.platform}</td>
                <td className="p-4 text-gray-500 truncate max-w-[200px]">{social.url}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleDelete(social.id)}
                    className="text-red-500 hover:text-red-400 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {socials.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-600 italic">No social links added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}