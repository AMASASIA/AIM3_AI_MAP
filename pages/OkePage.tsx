import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BrightCard } from '../components/BrightCard';
import { OkeCardData, AppRoute } from '../types';
import { Share2, MapPin, Hexagon, CheckCircle2, QrCode, Sparkles } from 'lucide-react';

const OKE_DATA: Record<string, OkeCardData & { description?: string, emotion?: string }> = {
  "0dao": {
    id: "0dao",
    title: "0DAO",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800&auto=format&fit=crop", 
    lat: 34.7072,
    lng: 135.5055,
    createdAt: "2025.01.12",
    description: "The beginning of everything in Nakazakicho.",
    emotion: "E3"
  }
};

export const OkePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "0dao";
  
  // Try to find static card, or generate one from params if 'generated'
  let card = OKE_DATA[id];

  if (!card && id === 'generated') {
    const title = searchParams.get("title") || "UNKNOWN MEMORY";
    const desc = searchParams.get("desc") || "No description available.";
    const emotion = searchParams.get("emotion") || "E5";
    
    card = {
      id: "generated",
      title: title,
      image: `https://picsum.photos/600/600?grayscale&blur=2&random=${Date.now()}`,
      lat: 34.7072, // Default to Nakazakicho for demo
      lng: 135.5055,
      createdAt: new Date().toLocaleDateString('en-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      description: desc,
      emotion: emotion
    };
  }

  if (!card) {
    return (
      <div className="p-6 text-center font-serif text-xl mt-10">
        <div className="mb-4">Card not found.</div>
        <Link to={AppRoute.MAP} className="underline text-sm font-sans uppercase tracking-widest">Return to Map</Link>
      </div>
    );
  }

  const isGenerated = id === 'generated';

  return (
    <div className="max-w-md mx-auto w-full pb-8">
      {/* Top Status Bar */}
      <div className="flex justify-between items-center mb-4 px-2">
        <span className="flex items-center text-[10px] font-sans font-bold uppercase tracking-widest border border-black px-2 py-1 bg-white">
          <Hexagon size={10} className="mr-1" fill="black" /> {isGenerated ? "Pending Mint" : "Token Bound"}
        </span>
        <span className="flex items-center text-[10px] font-sans font-bold uppercase tracking-widest text-emerald-700">
          {isGenerated ? <Sparkles size={12} className="mr-1" /> : <CheckCircle2 size={12} className="mr-1" />}
          {isGenerated ? "AI Generated" : "Creator Verified"}
        </span>
      </div>

      <BrightCard className="!p-4">
        {/* Card Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-wider text-black uppercase">
              {card.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-xs font-mono text-stone-600">ID: {card.id.toUpperCase()}</p>
               {card.emotion && (
                 <span className="text-[10px] font-bold px-1 border border-stone-300 rounded bg-stone-50">{card.emotion}</span>
               )}
            </div>
          </div>
          <QrCode size={32} strokeWidth={1} className="text-black" />
        </div>

        {/* NFT Image Frame */}
        <div className="relative p-3 bg-white border border-stone-200 shadow-inner mb-6">
           <div className="aspect-square w-full relative overflow-hidden bg-stone-100 border border-black/5">
            <img
              src={card.image}
              alt="OKE Card"
              className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Watermark Overlay */}
            <div className="absolute bottom-4 right-4 text-[10px] font-display text-white mix-blend-difference opacity-50 tracking-[0.3em]">
              BRIGHT LUXURY
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 font-sans text-xs border-t border-black pt-4 mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Location</span>
            <span className="font-mono font-medium">{card.lat.toFixed(4)}N / {card.lng.toFixed(4)}E</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Mint Date</span>
            <span className="font-mono font-medium">{card.createdAt}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button className="w-full py-4 bg-black text-white font-sans text-sm font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all active:scale-[0.99] shadow-lg">
            {isGenerated ? "Confirm & Mint" : "Mint to Wallet"}
          </button>
          
          <div className="flex gap-3">
            <Link
              to={`${AppRoute.MAP}?focus=${card.id}`}
              className="flex-1 py-3 border border-black text-black font-sans text-xs font-bold uppercase tracking-widest text-center hover:bg-stone-100 transition-colors flex items-center justify-center"
            >
              <MapPin className="w-3 h-3 mr-2" /> Map
            </Link>

            <button
              onClick={() => alert(`URL copied`)}
              className="flex-1 py-3 border border-black text-black font-sans text-xs font-bold uppercase tracking-widest text-center hover:bg-stone-100 transition-colors flex items-center justify-center"
            >
              <Share2 className="w-3 h-3 mr-2" /> Share
            </button>
          </div>
        </div>
      </BrightCard>

      <div className="text-center mt-6 px-4">
        <p className="font-serif italic text-xs text-stone-500">
          "{card.description || 'Memory preserved in eternal luxury.'}"
        </p>
      </div>
    </div>
  );
};