import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import { Plus, Minus, X, Image as ImageIcon, Map as MapIcon, AlertTriangle } from 'lucide-react';

declare var google: any;

// Emotion Color Definition
const EMOTION_COLORS: Record<string, string> = {
  E1: "#ff5b5b", // Passion
  E2: "#ffd34f", // Joy
  E3: "#7db7ff", // Serenity
  E4: "#4aff7a", // Nature
  E5: "#c17dff"  // Mystery
};

// Data
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

// High-Contrast Toner Style (Modified with Blue Water & Green Parks)
const TONER_STYLE = [
  // White Background
  { elementType: "geometry", stylers: [{ color: "#ffffff" }] },

  // Labels -> Black
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#000000" }]
  },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },

  // Administrative Boundaries
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#000000" }, { weight: 0.7 }]
  },

  // Roads (Bold Black)
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      { color: "#000000" },
      { weight: 2.5 }
    ]
  },

  // Local Roads (Thinner Black)
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#000000" }, { weight: 0.8 }]
  },

  // Water (Light Blue - Modified from Black)
  {
    featureType: "water",
    stylers: [{ color: "#aed9ff" }]
  },

  // Parks (Green - Modified from White)
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#c5e8c5" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },

  // Transit (Hidden for cleaner print look)
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }]
  }
];

// Fallback key provided by user for immediate display
const DEMO_KEY = "AIzaSyAzihfsqd_Ih85OnYV66EldNQkeJrVTIiQ";

export const MapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any | null>(null);
  
  // UI State
  const [showImageMapper, setShowImageMapper] = useState(false);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Use environment variable or fallback to demo key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || DEMO_KEY;
    
    if (!apiKey) {
      setLoadError("Missing API Key (NEXT_PUBLIC_GOOGLE_MAPS_KEY)");
      return;
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly"
    });

    loader.load().then(() => {
      const map = new google.maps.Map(mapRef.current!, {
        center: { lat: 34.7072, lng: 135.5055 }, // Nakazakicho / Osaka area
        zoom: 15, // Optimized for Toner style
        disableDefaultUI: true,
        styles: TONER_STYLE,
        backgroundColor: "#ffffff",
      });

      setMapInstance(map);
      setMapLoaded(true);

      // Add Initial Markers
      INITIAL_SPOTS.forEach(spot => addCustomMarker(map, spot));
    }).catch(e => {
      console.error("Google Maps Load Error:", e);
      setLoadError(e.message || "Failed to load Google Maps");
    });
  }, []);

  // Handle Focus
  useEffect(() => {
    if (focusId && mapInstance) {
      const spot = INITIAL_SPOTS.find(s => s.id === focusId);
      if (spot) {
        mapInstance.setCenter({ lat: spot.lat, lng: spot.lng });
        mapInstance.setZoom(16);
      }
    }
  }, [focusId, mapInstance]);

  // Helper to add markers with styled InfoWindows
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
      <div style="font-family: 'Cormorant Garamond', serif; width: 200px; padding: 4px; text-align: center;">
        <div style="width: 100%; aspect-ratio: 1; overflow: hidden; border-radius: 4px; margin-bottom: 8px; background: #f5f5f5;">
          <img src="${data.image}" style="width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%);" />
        </div>
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #000; line-height: 1.2;">
          ${data.title}
        </h3>
        <p style="margin: 4px 0 0; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: bold; color: ${emotionColor};">
          ${data.level || 'E5'} // ${data.description || 'Verified Spot'}
        </p>
        <a href="#/oke?id=${data.id || '0dao'}" style="display: block; margin-top: 10px; padding: 6px 0; border: 1px solid #000; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: bold; text-transform: uppercase; text-decoration: none; color: #000;">
          View Card
        </a>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 240,
    });

    marker.addListener("click", () => {
      infoWindow.open({ anchor: marker, map, shouldFocus: false });
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
      level: "E5" // Default emotion
    };

    addCustomMarker(mapInstance, newSpot);
    
    // Close modal and reset
    setShowImageMapper(false);
    setUploadImage(null);
    setNewTitle("");
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] bg-stone-100">
      {!mapLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper z-0">
          <p className="font-display animate-pulse tracking-widest text-lg">LOADING MAP...</p>
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper z-10 p-6 text-center">
          <AlertTriangle className="text-red-600 w-12 h-12 mb-4" />
          <p className="font-display text-xl mb-2 text-red-900">MAP LOAD ERROR</p>
          <p className="font-sans text-xs text-stone-600 max-w-xs leading-relaxed">
            {loadError}
          </p>
          <p className="mt-4 text-[10px] font-mono bg-stone-100 p-2 rounded">
            Check API Key Configuration
          </p>
        </div>
      )}
      
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full opacity-100 transition-opacity duration-500" />

      {/* Overlay Title */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="bg-white border border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] inline-block pointer-events-auto">
            <h1 className="font-display text-2xl tracking-widest font-bold">AI MAP</h1>
            <p className="text-[10px] font-sans tracking-widest text-stone-500 mt-1 uppercase border-t border-black pt-1">AMAS EAW3.0</p>
          </div>
      </div>

      {/* Map Controls */}
      <div className="absolute bottom-8 right-6 flex flex-col space-y-3 z-10">
        <button 
          onClick={() => setShowImageMapper(true)}
          className="w-12 h-12 bg-black text-white border border-black flex items-center justify-center hover:bg-zinc-800 transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] mb-4"
          title="Image Mapper"
        >
          <MapIcon size={20} strokeWidth={1.5} />
        </button>

        <button 
          onClick={handleZoomIn} 
          className="w-10 h-10 bg-white border border-black flex items-center justify-center hover:bg-stone-50 transition-all active:translate-y-1 shadow-md"
        >
          <Plus size={20} strokeWidth={1} />
        </button>
        <button 
          onClick={handleZoomOut} 
          className="w-10 h-10 bg-white border border-black flex items-center justify-center hover:bg-stone-50 transition-all active:translate-y-1 shadow-md"
        >
          <Minus size={20} strokeWidth={1} />
        </button>
      </div>

      {/* Image Mapper Modal */}
      {showImageMapper && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border border-black p-6 w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-6 border-b border-black pb-2">
              <h3 className="font-display text-xl uppercase tracking-widest">Image Mapper</h3>
              <button onClick={() => setShowImageMapper(false)}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div 
                className="w-full h-40 bg-stone-100 border border-dashed border-black flex flex-col items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors"
                onClick={() => setUploadImage("https://picsum.photos/600/600?grayscale&random=" + Date.now())}
              >
                {uploadImage ? (
                  <img src={uploadImage} alt="Preview" className="h-full w-full object-cover opacity-80" />
                ) : (
                  <>
                    <ImageIcon size={32} className="text-stone-400 mb-2" />
                    <span className="text-xs font-sans uppercase tracking-widest text-stone-500">Tap to Upload</span>
                  </>
                )}
              </div>

              <input 
                type="text" 
                placeholder="LOCATION TITLE"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full border-b border-black py-2 font-serif text-lg focus:outline-none placeholder:text-stone-300 bg-transparent"
              />

              <div className="pt-2">
                <p className="text-[10px] font-sans text-stone-500 uppercase tracking-wider mb-2">
                  * Pin will be dropped at center of map (E5 Style)
                </p>
                <button 
                  onClick={handleAddImageToMap}
                  disabled={!uploadImage}
                  className="w-full py-3 bg-black text-white font-sans text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 disabled:opacity-50 transition-all"
                >
                  Place on Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};