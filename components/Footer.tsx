"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; 

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

const getIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'twitter':
    case 'x':
      return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.004 3.985H5.078z" /></svg>;
    case 'instagram':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
    case 'twitch':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7m5 4V7"/></svg>;
    case 'youtube':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>;
    case 'discord':
      return <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>;
    case 'facebook':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
  }
};

export default function Footer() {
  const [socials, setSocials] = useState<SocialLink[]>([]);

  const fetchSocials = async () => {
    const { data, error } = await supabase.from('social_links').select('*').order('created_at', { ascending: true });
    if (error) console.error("Error fetching socials:", error);
    if (data) setSocials(data);
  };

  useEffect(() => {
    fetchSocials();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'social_links' }, () => {
        fetchSocials();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <footer 
      className="bg-[#121620] border-t border-gray-800 relative z-10" 
      style={{ marginTop: 'auto' }}
    >
      {/* AQUÍ ESTÁ EL FIX: Ajustado a 40px para la mitad del margen anterior */}
      <div 
        className="max-w-6xl mx-auto px-4 md:px-8 pb-12" 
        style={{ paddingTop: '40px' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-12">
                <Image src="/s-rank-logo.svg" alt="S-Rank Arena" fill className="object-contain invert" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">S-Rank</span>
                <span className="text-[10px] font-black tracking-[0.3em] text-purple-500 uppercase leading-none mt-1">Arena</span>
              </div>
            </Link>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed mt-2">
              Premier eSports Organization. Forging legacies in the Arena.
            </p>
          </div>

          <div>
            <h4 className="text-purple-500 text-xs font-black uppercase tracking-widest mb-6">About S-Rank</h4>
            <ul className="space-y-4">
              <li><Link href="/services" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Our Services</Link></li>
              <li><Link href="/tournaments" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Tournaments</Link></li>
              <li><a href="mailto:contact@srankarena.com" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-purple-500 text-xs font-black uppercase tracking-widest mb-6">Legal & Privacy</h4>
            <ul className="space-y-4">
              <li><Link href="/tos" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-purple-500 text-xs font-black uppercase tracking-widest mb-6">Follow Us</h4>
            <div className="flex flex-col gap-4">
              {socials.length > 0 ? (
                socials.map((social) => (
                  <a 
                    key={social.id} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-400 hover:text-purple-400 hover:translate-x-1 transition-transform w-fit"
                    title={social.platform}
                  >
                    <span className="bg-gray-900 p-2 rounded-lg border border-gray-800 flex items-center justify-center">
                      {getIcon(social.platform)}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-widest">
                      {social.platform}
                    </span>
                  </a>
                ))
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">No socials added.</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            Copyright © {new Date().getFullYear()} S-Rank Arena. All rights reserved.
          </p>
          <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            Designed for the Elite.
          </div>
        </div>
      </div>
    </footer>
  );
}