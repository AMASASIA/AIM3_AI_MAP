import React, { useState } from 'react';
import { BrightCard } from '../components/BrightCard';
import { Globe, Moon, Wallet, ChevronRight, LogOut, ShieldCheck, Link as LinkIcon, Copy, Mic, Bell } from 'lucide-react';

const langs = ["JP", "EN", "FR", "ES", "KR", "IT"];

export const SettingsPage: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState("EN");
  const [darkMode, setDarkMode] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [voiceActive, setVoiceActive] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-md mx-auto w-full">
      <BrightCard title="Settings">
        
        {/* Wallet Section */}
        <section className="mb-10">
           <h3 className="flex items-center text-xs font-sans font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-black/10 pb-2">
            <Wallet className="w-3 h-3 mr-2" /> Wallet & Account
          </h3>
          
          <div className="bg-stone-50 border border-stone-200 p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-black">{walletConnected ? "0x1234...abcd" : "No Wallet Connected"}</p>
              <p className="font-sans text-[10px] text-stone-500 uppercase tracking-wider mt-1">
                {walletConnected ? "Ethereum Mainnet" : "Connect to mint OKE"}
              </p>
            </div>
            <button 
              onClick={() => setWalletConnected(!walletConnected)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${walletConnected ? 'bg-black text-white border-black' : 'bg-white text-black border-black hover:bg-stone-100'}`}
            >
              {walletConnected ? "Disconnect" : "Connect"}
            </button>
          </div>
          
          {walletConnected && (
             <div className="flex items-center text-emerald-700 text-xs font-sans font-medium">
               <ShieldCheck size={14} className="mr-1" /> Verified Account
             </div>
          )}
        </section>

        {/* OKE URL Section */}
        <section className="mb-10">
          <h3 className="flex items-center text-xs font-sans font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-black/10 pb-2">
            <LinkIcon className="w-3 h-3 mr-2" /> OKE URL
          </h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              readOnly 
              value="https://aim3.app/oke?id=0dao" 
              className="w-full bg-stone-50 border border-stone-200 p-2 text-xs font-mono text-stone-600 focus:outline-none"
            />
            <button 
              onClick={() => alert("URL Copied")}
              className="px-3 border border-black bg-white hover:bg-stone-100 transition-colors flex items-center"
            >
              <Copy size={14} />
            </button>
          </div>
        </section>

        {/* System & Preferences */}
        <section className="mb-10">
          <h3 className="flex items-center text-xs font-sans font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-black/10 pb-2">
             System
          </h3>
          
          <div className="space-y-4">
             {/* Voice Activation */}
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 <Mic size={16} className="text-stone-800 mr-3" strokeWidth={1.5} />
                 <span className="font-serif text-lg">Voice Activation</span>
               </div>
               <button 
                  onClick={() => setVoiceActive(!voiceActive)}
                  className={`w-12 h-6 border border-black rounded-full p-1 transition-colors ${voiceActive ? 'bg-black' : 'bg-white'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${voiceActive ? 'translate-x-6 bg-white' : 'translate-x-0 bg-black'}`}></div>
                </button>
             </div>

             {/* Notifications */}
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 <Bell size={16} className="text-stone-800 mr-3" strokeWidth={1.5} />
                 <span className="font-serif text-lg">Notifications</span>
               </div>
               <button 
                  onClick={() => setNotifications(!notifications)}
                  className={`w-12 h-6 border border-black rounded-full p-1 transition-colors ${notifications ? 'bg-black' : 'bg-white'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${notifications ? 'translate-x-6 bg-white' : 'translate-x-0 bg-black'}`}></div>
                </button>
             </div>

             {/* Dark Mode */}
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 <Moon size={16} className="text-stone-800 mr-3" strokeWidth={1.5} />
                 <span className="font-serif text-lg">Dark Mode</span>
               </div>
               <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 border border-black rounded-full p-1 transition-colors ${darkMode ? 'bg-black' : 'bg-white'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${darkMode ? 'translate-x-6 bg-white' : 'translate-x-0 bg-black'}`}></div>
                </button>
             </div>
          </div>
        </section>

        {/* Language Section */}
        <section className="mb-10">
          <h3 className="flex items-center text-xs font-sans font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-black/10 pb-2">
            <Globe className="w-3 h-3 mr-2" /> Language
          </h3>
          <div className="grid grid-cols-6 gap-1">
            {langs.map((l) => (
              <button 
                key={l}
                onClick={() => setSelectedLang(l)} 
                className={`
                  h-10 border text-xs font-serif transition-all
                  ${selectedLang === l ? 'bg-black text-white border-black' : 'bg-white text-stone-400 border-stone-200 hover:border-black hover:text-black'}
                `}
              >
                {l}
              </button>
            ))}
          </div>
        </section>

        {/* Footer Links */}
        <div className="pt-4 border-t border-black flex flex-col gap-3">
          <button className="flex justify-between items-center text-xs font-sans font-bold uppercase tracking-widest hover:text-stone-500">
             Help & Support <ChevronRight size={14} />
          </button>
          <button className="flex justify-between items-center text-xs font-sans font-bold uppercase tracking-widest text-red-900 hover:text-red-700">
             Log Out <LogOut size={14} />
          </button>
        </div>

      </BrightCard>
    </div>
  );
};