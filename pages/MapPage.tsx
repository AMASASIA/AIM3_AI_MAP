import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader as GoogleMapsLoader } from '@googlemaps/js-api-loader';
import { Plus, Minus, X, Image as ImageIcon, Map as MapIcon, AlertTriangle, Play, Share2, Instagram, Feather, MapPin, Stamp, MessageSquare, Settings as SettingsIcon, Send, ShieldAlert, Sparkles, Globe, Palette } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

declare var google: any;

// Emotion Color Definition
const EMOTION_COLORS: Record<string, string> = {
  E1: "#ff5b5b", // Passion
  E2: "#ffd34f", // Joy
  E3: "#7db7ff", // Serenity
  E4: "#4aff7a", // Nature
  E5: "#c17dff"  // Mystery
};

// --- DATA ---

// Normal OKE Spots
const INITIAL_SPOTS = [
  {
    id: "0dao",
    lat: 34.7072,
    lng: 135.5055,
    title: "0DAO",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop",
    description: "Nakazakicho Community",
    level: "E3"
  }
];

// Video / Fairy Spots
const VIDEO_SPOTS = [
  {
    id: "fairy001",
    title: "Fairy of the Alley",
    lat: 34.7080,
    lng: 135.5065,
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", // Sample video
    icon: "fairy", // Logic to handle this in marker creation
    layer: "fairies"
  },
  {
    id: "fairy002",
    title: "Twilight Dancer",
    lat: 34.7065,
    lng: 135.5045,
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    icon: "fairy",
    layer: "fairies"
  }
];

// High-Contrast Toner Style (Modified with Blue Water & Green Parks)
const TONER_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#000000" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#000000" }, { weight: 0.7 }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#000000" }, { weight: 2.5 }] },
  { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#000000" }, { weight: 0.8 }] },
  { featureType: "water", stylers: [{ color: "#aed9ff" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c5e8c5" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] }
];

const DEMO_KEY = "AIzaSyAzihfsqd_Ih85OnYV66EldNQkeJrVTIiQ";

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  status?: 'pending' | 'accepted' | 'rewrite' | 'blocked';
  suggestion?: string;
  timestamp: Date;
}

export const MapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any | null>(null);
  
  // UI States
  const [showImageMapper, setShowImageMapper] = useState(false);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // New Feature States
  const [activeVideo, setActiveVideo] = useState<{title: string, url: string} | null>(null);
  const [showStampModal, setShowStampModal] = useState(false);

  // Side Panel States (AIA Gate)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [sidePanelTab, setSidePanelTab] = useState<'chat' | 'settings'>('chat');

  // Chat States
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'ai', text: 'Welcome to the Advocacy Gate. All messages are moderated by Vert Fairy AI.', timestamp: new Date(), status: 'accepted' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Settings States
  const [settingLang, setSettingLang] = useState("EN");
  const [settingTheme, setSettingTheme] = useState("Bright Luxury");

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || DEMO_KEY;
    if (!apiKey) {
      setLoadError("Missing API Key");
      return;
    }

    const loader = new GoogleMapsLoader({ apiKey, version: "weekly" });

    loader.importLibrary("maps").then(() => {
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 34.7072, lng: 135.5055 },
        zoom: 15,
        disableDefaultUI: true,
        styles: TONER_STYLE,
        backgroundColor: "#ffffff",
      });

      setMapInstance(map);
      setMapLoaded(true);

      // Add Standard OKE Markers
      INITIAL_SPOTS.forEach(spot => addCustomMarker(map, spot));

      // Add Fairy Video Markers
      VIDEO_SPOTS.forEach(spot => addFairyMarker(map, spot));

    }).catch(e => {
      console.error("Google Maps Load Error:", e);
      setLoadError(e.message || "Failed to load Google Maps");
    });
  }, []);

  // Handle Focus
  useEffect(() => {
    if (focusId && mapInstance) {
      const spot = [...INITIAL_SPOTS, ...VIDEO_SPOTS].find(s => s.id === focusId);
      if (spot) {
        mapInstance.setCenter({ lat: spot.lat, lng: spot.lng });
        mapInstance.setZoom(16);
      }
    }
  }, [focusId, mapInstance]);

  // --- Chat Logic (Gemini Moderation) ---
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date(),
      status: 'pending'
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = "gemini-2.5-flash";
      
      const prompt = `
        Role: You are "Vert Fairy", a content moderator for a luxury community map app.
        Task: Analyze the toxicity of the User Message.
        Output: JSON only.
        Format: { "classification": "SAFE" | "QUESTIONABLE" | "TOXIC", "reason": string, "rewrite": string (if QUESTIONABLE) }

        Definitions:
        - SAFE: Casual conversation, questions, friendly remarks.
        - QUESTIONABLE: Heated, rude, controversial, mild aggression.
        - TOXIC: Hate speech, scams, severe insults, illegal content.

        User Message: "${userMsg.text}"
      `;

      const result = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const responseText = result.text;
      if (!responseText) throw new Error("No AI response");
      const analysis = JSON.parse(responseText);

      let aiMsg: ChatMessage | null = null;

      if (analysis.classification === 'SAFE') {
        // Update user message to accepted
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'accepted' } : m));
        // Optional: AI replies to the content itself? For now, let's just approve it.
        aiMsg = {
           id: (Date.now() + 1).toString(),
           sender: 'system',
           text: "Message posted to public timeline.",
           timestamp: new Date()
        };
      } else if (analysis.classification === 'QUESTIONABLE') {
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'rewrite' } : m));
        aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: `Your message seems a bit heated. Suggestion: "${analysis.rewrite}"`,
          timestamp: new Date()
        };
      } else {
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'blocked' } : m));
        aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "Message blocked. This content violates our community guidelines (Toxic/Scam).",
          timestamp: new Date()
        };
      }

      if (aiMsg) {
        setMessages(prev => [...prev, aiMsg!]);
      }

    } catch (error) {
      console.error("Chat Error:", error);
      // Fallback
      setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, status: 'accepted' } : m));
    } finally {
      setIsTyping(false);
    }
  };


  // --- Marker Helpers ---

  const addCustomMarker = (map: any, data: any) => {
    const emotionColor = EMOTION_COLORS[data.level || "E5"] || EMOTION_COLORS["E5"];
    const marker = new google.maps.Marker({
      position: { lat: data.lat, lng: data.lng },
      map,
      title: data.title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: emotionColor,
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 10,
      }
    });

    const contentString = `
      <div style="font-family: 'Cormorant Garamond', serif; width: 180px; text-align: center;">
        <div style="width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 2px; margin-bottom: 8px; background: #f5f5f5;">
          <img src="${data.image}" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%);" />
        </div>
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #000;">${data.title}</h3>
        <p style="margin: 2px 0 0; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: bold; color: ${emotionColor};">${data.level}</p>
        <a href="#/oke?id=${data.id || '0dao'}" style="display: block; margin-top: 8px; font-size: 9px; text-transform: uppercase; color: #000; text-decoration: underline;">View Card</a>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({ content: contentString, maxWidth: 220 });
    marker.addListener("click", () => infoWindow.open({ anchor: marker, map, shouldFocus: false }));
  };

  const addFairyMarker = (map: any, data: any) => {
    // Flower shape for Fairy (✾)
    const marker = new google.maps.Marker({
      position: { lat: data.lat, lng: data.lng },
      map,
      title: data.title,
      label: {
        text: "✾",
        color: "#c17dff", // Fairy Purple
        fontSize: "28px",
        fontWeight: "bold",
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10, // Hit area
        fillOpacity: 0,
        strokeWeight: 0,
      }
    });

    marker.addListener("click", () => {
      setActiveVideo({ title: data.title, url: data.video });
    });
  };

  const handleZoomIn = () => mapInstance?.setZoom((mapInstance.getZoom() || 13) + 1);
  const handleZoomOut = () => mapInstance?.setZoom((mapInstance.getZoom() || 13) - 1);

  const handleAddImageToMap = () => {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    if (!center) return;

    const newSpot = {
      id: `custom-${Date.now()}`,
      lat: center.lat(),
      lng: center.lng(),
      title: newTitle || "MAPPED MEMORY",
      image: uploadImage || "https://picsum.photos/600/600?grayscale",
      description: "User Uploaded",
      level: "E5"
    };

    addCustomMarker(mapInstance, newSpot);
    setShowImageMapper(false);
    setUploadImage(null);
    setNewTitle("");
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] bg-stone-100 overflow-hidden">
      {!mapLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper z-0">
          <p className="font-display animate-pulse tracking-widest text-lg">LOADING MAP...</p>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full opacity-100 transition-opacity duration-500" />

      {/* Overlay Title */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="bg-white/90 border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] inline-block pointer-events-auto backdrop-blur-sm">
            <h1 className="font-display text-2xl tracking-widest font-bold">AI MAP</h1>
            <p className="text-[10px] font-sans tracking-widest text-stone-500 mt-1 uppercase border-t border-black pt-1">AMAS EAW3.0</p>
          </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-28 right-4 flex flex-col space-y-3 z-10">
        {/* AIA GATE Button */}
        <button 
          onClick={() => setIsSidePanelOpen(true)} 
          className="w-10 h-10 bg-black text-white flex items-center justify-center hover:bg-zinc-800 shadow-lg mb-2 relative group"
        >
          <Sparkles size={18} strokeWidth={1.5} className="group-hover:text-emerald-300 transition-colors" />
          <div className="absolute right-12 bg-black text-white text-[10px] uppercase font-bold py-1 px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">AIA Gate</div>
        </button>

        <button onClick={() => setShowImageMapper(true)} className="w-10 h-10 bg-white border border-black flex items-center justify-center hover:bg-zinc-800 hover:text-white shadow-md">
          <MapIcon size={18} strokeWidth={1.5} />
        </button>
        <button onClick={handleZoomIn} className="w-10 h-10 bg-white border border-black flex items-center justify-center shadow-md">
          <Plus size={18} />
        </button>
        <button onClick={handleZoomOut} className="w-10 h-10 bg-white border border-black flex items-center justify-center shadow-md">
          <Minus size={18} />
        </button>
      </div>

      {/* --- RIGHT SIDEBAR (AIA GATE & SETTINGS) --- */}
      <div className={`
        absolute top-0 right-0 h-full w-[85%] md:w-[400px] bg-white border-l border-black z-30 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
        ${isSidePanelOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
         {/* Sidebar Header */}
         <div className="flex items-center justify-between p-4 border-b border-black/10 bg-stone-50">
            <div className="flex gap-4">
              <button 
                onClick={() => setSidePanelTab('chat')}
                className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${sidePanelTab === 'chat' ? 'border-black text-black' : 'border-transparent text-stone-400'}`}
              >
                AIA Gate
              </button>
              <button 
                onClick={() => setSidePanelTab('settings')}
                className={`text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${sidePanelTab === 'settings' ? 'border-black text-black' : 'border-transparent text-stone-400'}`}
              >
                Settings
              </button>
            </div>
            <button onClick={() => setIsSidePanelOpen(false)}><X size={20} /></button>
         </div>

         {/* Sidebar Content */}
         <div className="flex-1 overflow-y-auto bg-white p-4">
           
           {/* -- CHAT TAB -- */}
           {sidePanelTab === 'chat' && (
             <div className="h-full flex flex-col">
               <div className="mb-4 bg-emerald-50 border border-emerald-100 p-3 rounded-sm flex gap-3 items-start">
                  <ShieldAlert className="text-emerald-700 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">AI Advocacy Active</h4>
                    <p className="text-[10px] font-serif text-emerald-700 leading-tight mt-1">
                      Vert Fairy is moderating this timeline. Harmful content will be filtered.
                    </p>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                       <div className={`
                         max-w-[85%] p-3 text-xs font-sans leading-relaxed
                         ${msg.sender === 'user' 
                            ? 'bg-black text-white rounded-tl-xl rounded-bl-xl rounded-br-xl' 
                            : msg.sender === 'ai' 
                               ? 'bg-stone-100 text-black border border-stone-200 rounded-tr-xl rounded-br-xl rounded-bl-xl'
                               : 'bg-transparent text-stone-400 italic text-[10px] border-b border-stone-100 w-full text-center'
                          }
                       `}>
                          {msg.text}
                       </div>
                       
                       {/* Status Indicators for User Messages */}
                       {msg.sender === 'user' && (
                         <div className="text-[9px] font-bold uppercase tracking-widest mt-1 flex items-center">
                           {msg.status === 'pending' && <span className="text-stone-400">Analyzing...</span>}
                           {msg.status === 'accepted' && <span className="text-emerald-600">Public</span>}
                           {msg.status === 'rewrite' && <span className="text-amber-500">Held (Rewrite)</span>}
                           {msg.status === 'blocked' && <span className="text-red-600">Blocked</span>}
                         </div>
                       )}
                    </div>
                  ))}
                  {isTyping && <div className="text-[10px] text-stone-400 animate-pulse">Vert Fairy is thinking...</div>}
               </div>

               <div className="border-t border-black/10 pt-4 flex gap-2">
                 <input 
                   type="text" 
                   value={chatInput}
                   onChange={(e) => setChatInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                   placeholder="Type a message..."
                   className="flex-1 bg-stone-50 border border-stone-200 px-3 py-2 text-xs focus:outline-none focus:border-black transition-colors"
                 />
                 <button 
                   onClick={handleSendMessage}
                   disabled={!chatInput.trim() || isTyping}
                   className="bg-black text-white p-2 hover:bg-zinc-800 disabled:opacity-50"
                 >
                   <Send size={16} />
                 </button>
               </div>
             </div>
           )}

           {/* -- SETTINGS TAB -- */}
           {sidePanelTab === 'settings' && (
             <div className="space-y-8 font-serif">
                {/* Language */}
                <section>
                   <h3 className="flex items-center text-xs font-sans font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-black/10 pb-2">
                    <Globe className="w-3 h-3 mr-2" /> Language
                  </h3>
                  <div className="space-y-2">
                    {["JP", "EN", "FR", "ES", "KR", "IT"].map(lang => (
                      <label key={lang} className="flex items-center cursor-pointer group">
                        <input 
                          type="radio" 
                          name="lang" 
                          checked={settingLang === lang} 
                          onChange={() => setSettingLang(lang)}
                          className="hidden" 
                        />
                        <div className={`w-3 h-3 border border-black rounded-full flex items-center justify-center mr-3 ${settingLang === lang ? 'bg-black' : 'bg-white'}`}>
                          {settingLang === lang && <div className="w-1 h-1 bg-white rounded-full"></div>}
                        </div>
                        <span className={`text-sm transition-colors ${settingLang === lang ? 'text-black font-semibold' : 'text-stone-500 group-hover:text-black'}`}>{lang}</span>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Theme */}
                <section>
                   <h3 className="flex items-center text-xs font-sans font-bold uppercase tracking-[0.2em] text-stone-400 mb-4 border-b border-black/10 pb-2">
                    <Palette className="w-3 h-3 mr-2" /> Theme
                  </h3>
                  <div className="space-y-2">
                    {["Bright Luxury", "Dark Mode", "High Contrast"].map(theme => (
                      <label key={theme} className="flex items-center cursor-pointer group">
                        <input 
                          type="radio" 
                          name="theme" 
                          checked={settingTheme === theme} 
                          onChange={() => setSettingTheme(theme)}
                          className="hidden" 
                        />
                         <div className={`w-3 h-3 border border-black rounded-full flex items-center justify-center mr-3 ${settingTheme === theme ? 'bg-black' : 'bg-white'}`}>
                          {settingTheme === theme && <div className="w-1 h-1 bg-white rounded-full"></div>}
                        </div>
                        <span className={`text-sm transition-colors ${settingTheme === theme ? 'text-black font-semibold' : 'text-stone-500 group-hover:text-black'}`}>{theme}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <div className="p-4 bg-stone-50 text-[10px] font-sans text-stone-400 text-center leading-relaxed">
                   AI MAP Version 3.0.1<br/>
                   Powered by Google Gemini
                </div>
             </div>
           )}
         </div>
      </div>

      {/* --- SPONSORED CONTENT SPACE (Bottom Panel) --- */}
      <div className="absolute bottom-6 left-4 right-4 z-20">
        <div className="bg-white/95 backdrop-blur-md border border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-2xl p-5">
           <div className="flex items-start justify-between mb-4">
             <div className="flex items-center gap-2">
               <div className="p-2 bg-emerald-50 rounded-full border border-emerald-100">
                 {/* Leaf Icon (Vert Fairy) */}
                 <Feather className="w-5 h-5 text-emerald-600" size={20} strokeWidth={1.5} />
               </div>
               <div>
                 <h3 className="font-display text-sm font-bold tracking-widest uppercase">Vert Fairy</h3>
                 <p className="text-[10px] font-sans text-stone-400">Sponsored Content</p>
               </div>
             </div>
             <button 
                onClick={() => setShowStampModal(true)}
                className="bg-black text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest hover:bg-zinc-800 transition-colors"
             >
               Check In
             </button>
           </div>
           
           <div className="flex justify-between items-center gap-4">
              <button className="flex-1 h-16 bg-stone-50 border border-stone-100 hover:border-black/20 transition-all flex flex-col items-center justify-center group">
                 <Feather size={16} className="text-stone-400 group-hover:text-black mb-1 transition-colors" />
                 <span className="text-[9px] font-sans uppercase tracking-widest text-stone-500">History</span>
              </button>
              <button className="flex-1 h-16 bg-stone-50 border border-stone-100 hover:border-black/20 transition-all flex flex-col items-center justify-center group">
                 <MapPin size={16} className="text-stone-400 group-hover:text-black mb-1 transition-colors" />
                 <span className="text-[9px] font-sans uppercase tracking-widest text-stone-500">Spots</span>
              </button>
              <button 
                onClick={() => setShowStampModal(true)}
                className="flex-1 h-16 bg-stone-50 border border-stone-100 hover:border-black/20 transition-all flex flex-col items-center justify-center group"
              >
                 <Stamp size={16} className="text-stone-400 group-hover:text-black mb-1 transition-colors" />
                 <span className="text-[9px] font-sans uppercase tracking-widest text-stone-500">Stamp</span>
              </button>
           </div>
        </div>
      </div>

      {/* --- VIDEO PLAYER MODAL --- */}
      {activeVideo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white w-full max-w-sm overflow-hidden shadow-2xl relative">
            {/* Decoration */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
            
            <div className="p-4 flex justify-between items-center bg-stone-50 border-b border-stone-100">
               <h3 className="font-display text-sm uppercase tracking-[0.2em] font-bold">Captured by the Fairy</h3>
               <button onClick={() => setActiveVideo(null)}><X size={20} className="text-stone-400 hover:text-black" /></button>
            </div>

            <div className="relative aspect-video bg-black group cursor-pointer">
              <video 
                src={activeVideo.url} 
                controls 
                autoPlay 
                className="w-full h-full object-contain" 
              />
            </div>

            <div className="p-6 text-center">
              <h2 className="font-display text-2xl mb-1">{activeVideo.title}</h2>
              <div className="w-12 h-[1px] bg-black mx-auto mb-4 opacity-20"></div>
              
              <div className="flex justify-center gap-6 mt-6">
                 <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 rounded-full border border-stone-200 group-hover:border-black transition-colors">
                      <Instagram size={18} />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-stone-500">Story</span>
                 </button>
                 <button className="flex flex-col items-center gap-1 group">
                    <div className="p-3 rounded-full border border-stone-200 group-hover:border-black transition-colors">
                      <Share2 size={18} />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-stone-500">Share</span>
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- STAMP RALLY MODAL --- */}
      {showStampModal && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white w-full max-w-sm shadow-[0_-10px_40px_rgba(0,0,0,0.2)] sm:shadow-2xl animate-[slideUp_0.3s_ease-out] relative">
            <button onClick={() => setShowStampModal(false)} className="absolute top-4 right-4 p-2"><X size={20} /></button>
            
            <div className="p-8 flex flex-col items-center text-center">
               <div className="mb-6 opacity-80">
                  <Feather size={64} className="text-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]" strokeWidth={1} />
               </div>
               
               <h2 className="font-display text-4xl font-bold mb-2 tracking-widest">CHECK IN</h2>
               <p className="font-serif text-stone-500 italic mb-8">Collect the fairy's blessing.</p>
               
               <div className="w-full border-t border-b border-black/10 py-6 mb-8">
                  <p className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mb-4">Current Location</p>
                  <p className="font-display text-xl">NAKAZAKICHO</p>
               </div>

               <button 
                  onClick={() => { alert("Stamped!"); setShowStampModal(false); }}
                  className="w-full py-4 bg-black text-white font-sans text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-zinc-800 transition-all active:scale-[0.99]"
               >
                  Drop Your Moment Here
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- IMAGE MAPPER MODAL (Existing) --- */}
      {showImageMapper && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
              <h3 className="font-display text-xl uppercase tracking-widest">Image Mapper</h3>
              <button onClick={() => setShowImageMapper(false)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="w-full h-40 bg-stone-100 border border-dashed border-black flex flex-col items-center justify-center cursor-pointer hover:bg-stone-200" onClick={() => setUploadImage("https://picsum.photos/600/600?grayscale&random=" + Date.now())}>
                {uploadImage ? <img src={uploadImage} alt="Preview" className="h-full w-full object-cover" /> : <><ImageIcon size={32} className="text-stone-400 mb-2" /><span className="text-xs font-sans uppercase tracking-widest text-stone-500">Tap to Upload</span></>}
              </div>
              <input type="text" placeholder="LOCATION TITLE" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full border-b border-black py-2 font-serif text-lg focus:outline-none bg-transparent" />
              <button onClick={handleAddImageToMap} disabled={!uploadImage} className="w-full py-3 bg-black text-white font-sans text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 disabled:opacity-50">Place on Map</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};